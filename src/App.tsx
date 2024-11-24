import React, { useState, useRef } from "react";
import { useQuery } from "react-query";
import "./App.css";
import ReactMarkdown from "react-markdown";
import getWorksStats from "./scripts/processArticles";
import type { AnalysisResult } from "./scripts/processArticles";

const fetchSearchResults = async (query: string) => {
  console.log("search");
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

function App() {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [workStats, setWorkStats] = useState<null | AnalysisResult>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const { data, refetch } = useQuery(
    ["searchSummary"],
    () => fetchSearchResults(inputRef.current?.value || ""),
    {
      enabled: false,
    }
  );

  const { data: factsData, refetch: refetchFacts } = useQuery(
    ["searchFacts"],
    () => fetchFacts(inputRef.current?.value || ""),
    {
      enabled: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) {
      refetchFacts();
      setTimeout(() => {
        refetch();
        getWorksStats(data?.keywords?.join(" OR ")).then((result) => {
          setWorkStats(result);
        });
      }, 500);
    }
  };

  const facts = factsData?.facts;
  const summary = data?.summary;
  console.log(summary);

  return (
    <div id="results">
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
      {facts && (
        <div>
          {facts.map((fact: string, index: number) => (
            <div key={index}>
              <h4>{fact}</h4>
            </div>
          ))}
        </div>
      )}
      {summary && (
        <div>
          <div>
            <h1>
              {summary.query_answer ? summary.clean_query : summary.title}
            </h1>
            <ReactMarkdown>
              {summary.query_answer
                ? summary.query_answer
                : summary.introduction_summary}
            </ReactMarkdown>
          </div>

          <div>
            <h3>Descubrimientos más recientes</h3>
            <ReactMarkdown>{summary.research_findings_summary}</ReactMarkdown>
          </div>

          <div>
            <h2>Quizás te puede interesar:</h2>
            <div>
              {summary.related_queries.map((question, index) => (
                <p key={index}>{question}</p>
              ))}
            </div>
          </div>
        </div>
      )}
      {workStats && (
        <div>
          <div>
            <h2>¿Dónde se investiga más este tema?</h2>
            <div>
              {Object.entries(workStats.countryDistribution)
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
              {workStats.topAuthors.slice(0, 5).map((author) => (
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
              {workStats.topInstitutions.slice(0, 5).map((institution) => (
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
          <div>
            <h2>¿Cuándo se investigó más sobre este tópico?</h2>
            <div>
              {/* {Object.entries(workStats.yearDistribution)
                .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                .map(([year, count]) => (
                  <div key={year}>
                    <p>
                      {year} ({count})
                    </p>
                  </div>
                ))} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
