interface Author {
  id: string;
  display_name: string;
}

interface Institution {
  id: string;
  display_name: string;
  country_code: string;
}

interface Authorship {
  author: Author;
  institutions: Institution[];
  countries: string[];
}

interface Publication {
  doi: string;
  authorships: Authorship[];
  publication_date: string;
}

interface PublicationData {
  results: Publication[];
}

interface AuthorCount {
  id: string;
  display_name: string;
  count: number;
}

interface InstitutionCount {
  id: string;
  display_name: string;
  count: number;
}

interface CountryCount {
  [country: string]: number;
}

interface YearDistribution {
  [year: string]: number;
}

export interface AnalysisResult {
  topAuthors: AuthorCount[];
  topInstitutions: InstitutionCount[];
  countryDistribution: CountryCount;
  yearDistribution: YearDistribution;
}

function analyzePublications(data: PublicationData): AnalysisResult {
  // Initialize counters
  const authorCounts = new Map<string, AuthorCount>();
  const institutionCounts = new Map<string, InstitutionCount>();
  const countryCounts: CountryCount = {};
  const yearCounts: YearDistribution = {};

  // Process each publication
  data.results.forEach((publication) => {
    // Count publication years
    const year = publication.publication_date.substring(0, 4);
    yearCounts[year] = (yearCounts[year] || 0) + 1;

    // Process each authorship
    publication.authorships.forEach((authorship) => {
      // Count authors
      const author = authorship.author;
      if (author) {
        const existingAuthor = authorCounts.get(author.id) || {
          id: author.id,
          display_name: author.display_name,
          count: 0,
        };
        existingAuthor.count += 1;
        authorCounts.set(author.id, existingAuthor);
      }

      // Count institutions
      authorship.institutions?.forEach((institution) => {
        const existingInstitution = institutionCounts.get(institution.id) || {
          id: institution.id,
          display_name: institution.display_name,
          count: 0,
        };
        existingInstitution.count += 1;
        institutionCounts.set(institution.id, existingInstitution);
      });

      // Count countries
      authorship.countries?.forEach((country) => {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      });
    });
  });

  // Convert Maps to sorted arrays
  const topAuthors = Array.from(authorCounts.values()).sort(
    (a, b) => b.count - a.count
  );

  const topInstitutions = Array.from(institutionCounts.values()).sort(
    (a, b) => b.count - a.count
  );

  return {
    topAuthors,
    topInstitutions,
    countryDistribution: countryCounts,
    yearDistribution: yearCounts,
  };
}

export default async function getWorksStats(
  query: string
): Promise<AnalysisResult> {
  const response = await fetch(
    `https://api.openalex.org/works?search=${query}&per_page=200&select=doi,authorships,title,publication_date`
  );

  const data: PublicationData = await response.json();

  return analyzePublications(data);
}
