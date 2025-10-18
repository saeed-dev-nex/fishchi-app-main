export const mapSourceToCSL = (source) => {
  return {
    id: source._id.toString(),
    type:
      source.type === 'article'
        ? 'article-journal'
        : source.type === 'book'
        ? 'book'
        : source.type === 'thesis'
        ? 'thesis'
        : source.type === 'website'
        ? 'webpage'
        : 'article',
    title: source.title,
    author: source.authors.map((a) => {
      // استفاده از ساختار جدید firstname و lastname
      return {
        family: a.lastname || '',
        given: a.firstname || '',
      };
    }),
    issued: { 'date-parts': [[source.year]] },
    'container-title': source.publicationDetails?.journal,
    publisher: source.publicationDetails?.publisher,
    volume: source.publicationDetails?.volume,
    issue: source.publicationDetails?.issue,
    page: source.publicationDetails?.pages,
    URL: source.identifiers?.url,
    DOI: source.identifiers?.doi,
    ISBN: source.identifiers?.isbn,
    abstract: source.abstract,
    keyword: source.tags?.join(', '),
    language: source.language,
  };
};
