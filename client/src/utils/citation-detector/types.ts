// Citation Types
export enum Lang {
  Persian = 'fa',
  English = 'en',
  Unknown = 'unknown',
}

export enum CitationStyle {
  APA = 'APA',
  Chicago = 'Chicago',
  Vancouver = 'Vancouver',
  Harvard = 'Harvard',
  Unknown = 'Unknown',
}

export interface CitationMetadata {
  authors: string[];
  year?: number;
  title?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  place?: string;
  doi?: string;
  url?: string;
  isPersian?: boolean;
}
