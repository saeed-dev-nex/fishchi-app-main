// Shared types for AddSourceModal components

export type ManualFormInputs = {
  title: string;
  authors: string;
  year: string;
  type: string;
  language: 'persian' | 'english';
  abstract?: string;
  journal?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  tags?: string;
};

export type DoiFormInputs = {
  doi: string;
};
