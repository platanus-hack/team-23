export interface SummaryResponse {
  summary: Summary;
  keywords: string[];
  total_count: number;
  works_partial: Publication[];
}

export interface Summary {
  clean_query: string;
  introduction_summary: string;
  key_findings: Finding[];
  query_answer?: string;
  related_queries: string[];
  title: string;
}

export interface Institution {
  institution_ids: string[];
  raw_affiliation_string: string;
}

export interface Author {
  display_name: string;
  id: string;
  orcid?: string;
}

export interface Authorship {
  affiliations: Institution[];
  author: Author;
  author_position: string;
  countries: string[];
  institutions: object[];
  is_corresponding: boolean;
  raw_affiliation_strings: string[];
  raw_author_name: string;
}

export interface Publication {
  id: string;
  authorships: Authorship[];
  cited_by_count: number;
  doi: string;
  pub_date: string;
  pub_year: number;
  title: string;
  abstract: string;
  location_display_name: string;
  location_url: string;
}

export interface Finding {
  summary: string;
  title: string;
}
