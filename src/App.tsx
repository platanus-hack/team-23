import React, { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "react-query";
import "./App.css";
import ReactMarkdown from "react-markdown";
import getWorksStats from "./scripts/processArticles";
import CitationLink from "./components/CitationLink";
import PublicationDetailsModal from "./components/PublicationDetailsModal";
import AppearingTextRandomizer from "./components/AppearingTextRandomizer";
import getLinksFromMarkdown from "./scripts/getLinksFromMarkdown";
import preventWidows from "./scripts/preventWidows";
import {
  Authorship,
  Finding,
  Publication,
  SummaryResponse,
} from "./interfaces";

const fetchSummary = async (query: string): Promise<SummaryResponse> => {
  const response = await fetch(
    `https://etai-backend-537a5149f0b1.herokuapp.com/query?question=${query}`
  );
  if (!response.ok) {
    throw new Error("Error fetching search results");
  }
  return response.json();
};

const fetchFacts = async (query: string) => {
  const response = await fetch(
    `https://etai-backend-537a5149f0b1.herokuapp.com/facts?question=${query}`
  );
  if (!response.ok) {
    throw new Error("Error fetching search results");
  }
  return response.json();
};

const fetchStats = async (query: string) => {
  return await getWorksStats(query);
};

function App() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Finding["title"][]>([]);
  const [openPublication, setOpenPublication] = useState<Publication | null>(
    null
  );

  const enabled = query.trim().length > 0;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const toggleDropdown = (index: Finding["title"]) => {
    if (openDropdowns.includes(index)) {
      setOpenDropdowns(openDropdowns.filter((id) => id !== index));
    } else {
      setOpenDropdowns([...openDropdowns, index]);
    }
  };

  const { data, isLoading } = useQuery(
    ["searchSummary", query],
    () => fetchSummary(query),
    {
      enabled,
    }
  );

  const { data: factsData } = useQuery(
    ["searchFacts", query],
    () => fetchFacts(query),
    {
      enabled,
    }
  );

  const { data: workStatsData } = useQuery(
    ["workStats", query],
    () => fetchStats(query),
    {
      enabled,
    }
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input.trim().length === 0) return;
      setQuery(input);
    },
    [input]
  );

  const facts = factsData?.facts;
  const totalCount = data?.total_count;
  const summary = data?.summary;
  const showInput = !(data || isLoading);
  const bibliography: Publication[] | undefined = data?.works_partial;

  const extractedLinks = useMemo(
    () =>
      summary
        ? [
            ...(summary.query_answer
              ? getLinksFromMarkdown(summary.query_answer)
              : []),
            ...summary.key_findings
              .map((finding) => getLinksFromMarkdown(finding.summary))
              .flat(),
          ]
        : [],
    [summary]
  );

  const filteredBibliography = useMemo(
    () =>
      extractedLinks.map(
        (url) => bibliography?.find((pub) => pub.id === url) as Publication
      ) ?? [],
    [bibliography, extractedLinks]
  );

  const mappedAnchorComponent = useCallback(
    (props: JSX.IntrinsicElements["a"]) => (
      <CitationLink
        {...props}
        bibliography={filteredBibliography}
        onCitationClick={(id) => {
          const publication = bibliography?.find((pub) => pub.id === id);
          if (publication) setOpenPublication(publication);
        }}
      />
    ),
    [bibliography, filteredBibliography]
  );

  return (
    <div className="py-4">
      {showInput && (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={handleInput}
              placeholder="Por qué el cilantro es tan rico"
            />
            <button type="submit">Buscar</button>
          </form>
        </div>
      )}
      {isLoading && (
        <div>
          {facts ? (
            <div>
              <AppearingTextRandomizer
                facts={facts}
                rotateInterval={1800}
                timeBetweenChars={60}
              />
            </div>
          ) : (
            "Loading..."
          )}
        </div>
      )}
      {summary && (
        <div>
          <div className="mb-10">
            {!!totalCount && (
              <div className="text-[15px] text-neutral-400 mb-2">
                {new Intl.NumberFormat().format(totalCount)} artículos
                encontrados
              </div>
            )}

            <h1 className="text-[22px] leading-7 font-semibold text-black">
              {preventWidows(
                summary.query_answer ? summary.clean_query : summary.title
              )}
            </h1>

            <div className="w-[50px] h-[2px] bg-orange-500 mt-5 mb-7" />

            <ReactMarkdown
              className="markdown-body"
              components={{
                a: mappedAnchorComponent,
              }}
            >
              {summary.query_answer
                ? summary.query_answer
                : summary.introduction_summary}
            </ReactMarkdown>
          </div>

          <div>
            <h2>Hallazgos clave</h2>
            {summary.key_findings.map((finding: Finding) => (
              <div
                key={finding.title}
                className="bg-[#F5F3EE] mb-3 py-4 rounded-md"
              >
                <div
                  className="flex items-center gap-4 justify-between px-5 text-black"
                  onClick={() => toggleDropdown(finding.title)}
                >
                  <div className="font-medium">
                    {preventWidows(finding.title)}
                  </div>
                  <span
                    className={`material-symbols-sharp text-[16px] with-transition ${
                      openDropdowns.includes(finding.title) && "rotate-90"
                    }`}
                  >
                    arrow_forward_ios
                  </span>
                </div>
                <ReactMarkdown
                  className={`markdown-body with-transition overflow-hidden px-5 mt-2 ${
                    !openDropdowns.includes(finding.title) && "hidden"
                  }`}
                  components={{
                    a: mappedAnchorComponent,
                  }}
                >
                  {finding.summary}
                </ReactMarkdown>
              </div>
            ))}
          </div>

          <div>
            <h2>Quizás te puede interesar:</h2>
            <div>
              {summary.related_queries.map((question: string) => (
                <p key={question}>{question}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      {workStatsData && (
        <div>
          <div>
            <h2>¿Dónde se investiga más este tema?</h2>
            <div>
              {Object.entries(workStatsData.countryDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country}>
                    <p>
                      {country} ({count})
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <h2>¿Quiénes investigan más sobre este tópico?</h2>
            <div>
              {workStatsData.topAuthors.slice(0, 5).map((author) => (
                <div key={author.id}>
                  <p>
                    {author.display_name} ({author.count})
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>¿Y en qué universidades?</h2>
            <div>
              {workStatsData.topInstitutions.slice(0, 5).map((institution) => (
                <div key={institution.id}>
                  <a href={institution.id}>
                    <p>
                      {institution.display_name} ({institution.count})
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {filteredBibliography.length > 0 && (
        <div>
          <h2>Bibliografía</h2>
          <ul>
            {filteredBibliography.map((publication: Publication) => {
              const author =
                publication.authorships.find(
                  (authorship: Authorship) =>
                    authorship.author_position === "first"
                ) || publication.authorships[0];
              if (!author) return null;
              return (
                <li key={publication.id}>
                  <a href={""}>{publication.title}</a>
                  <p>
                    {[
                      author.raw_author_name +
                        (publication.authorships.length > 1 && "  et al."),
                      publication.pub_year && publication.pub_year,
                      publication.cited_by_count &&
                        `Citado por ${publication.cited_by_count}`,
                    ].join(" · ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {openPublication && (
        <PublicationDetailsModal
          publication={openPublication}
          onClose={() => setOpenPublication(null)}
        />
      )}
    </div>
  );
}

export default App;
