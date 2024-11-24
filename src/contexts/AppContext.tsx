import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQuery } from "react-query";
import { Finding, Publication, SummaryResponse } from "../interfaces";
import getWorksStats, { AnalysisResult } from "../scripts/processArticles";
import getLinksFromMarkdown from "../scripts/getLinksFromMarkdown";

export interface AppContextValue {
  query: string;
  setQuery: (query: string) => void;
  results?: SummaryResponse;
  loading: boolean;
  summary?: SummaryResponse["summary"];
  facts?: string[];
  loadingFacts: boolean;
  stats?: AnalysisResult;
  loadingStats: boolean;
  totalPublicationsCount: number;
  openPublication: Publication | null;
  setOpenPublication: (publication: Publication | null) => void;
  toggleFinding: (index: Finding["title"]) => void;
  visibleFindings: Finding["title"][];
  filteredBibliography: Publication[];
}

export const AppContext = createContext<AppContextValue | null>(null);

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

export const useAppContextValue = (): AppContextValue => {
  const [query, setQuery] = useState("");
  const [visibleFindings, setVisibleFindings] = useState<Finding["title"][]>(
    []
  );
  const [openPublication, setOpenPublication] = useState<Publication | null>(
    null
  );

  const enabled = query.trim().length > 0;

  const summaryQuery = useQuery(["summary", query], () => fetchSummary(query), {
    enabled,
  });

  const factsQuery = useQuery<{ facts: string[] }>(
    ["facts", query],
    () => fetchFacts(query),
    {
      enabled,
    }
  );

  const statsQuery = useQuery(["stats", query], () => fetchStats(query), {
    enabled,
  });

  const data = summaryQuery.data;
  const summary = data?.summary;
  const facts = factsQuery.data?.facts;
  const stats = statsQuery.data;
  const totalPublicationsCount = data?.total_count ?? 0;

  const bibliography: Publication[] | undefined = data?.works_partial;

  const toggleFinding = useCallback(
    (index: Finding["title"]) => {
      if (visibleFindings.includes(index)) {
        setVisibleFindings(visibleFindings.filter((id) => id !== index));
      } else {
        setVisibleFindings([...visibleFindings, index]);
      }
    },
    [visibleFindings]
  );

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

  return {
    query,
    setQuery,
    summary,
    results: data,
    loading: summaryQuery.isLoading,
    facts,
    loadingFacts: factsQuery.isLoading,
    stats,
    loadingStats: statsQuery.isLoading,
    totalPublicationsCount,
    openPublication,
    setOpenPublication,
    toggleFinding,
    visibleFindings,
    filteredBibliography,
  };
};

export const useAppContext = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return value;
};
