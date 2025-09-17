export const mapSourceToCSL = (source) => {
  return {
    id: source._id.toString(),
    type:
      source.type === 'article'
        ? 'article-journal'
        : source.type === 'book'
        ? 'book'
        : 'webpage',
    title: source.title,
    author: source.authors.map((a) => {
      // تلاش برای جدا کردن نام و نام خانوادگی (ساده شده)
      const parts = a.name.split(' ');
      return { family: parts.pop(), given: parts.join(' ') };
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
  };
};
