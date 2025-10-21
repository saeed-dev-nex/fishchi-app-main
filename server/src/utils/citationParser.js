import moment from 'moment-jalaali';

/**
 * Citation Parser Utility
 * Parses different citation formats (APA, Vancouver, Chicago, etc.) and extracts source information
 */

// Helper function to detect citation format
const detectCitationFormat = (citation) => {
  const text = citation.toLowerCase();

  // APA format detection patterns
  if (text.includes('(') && text.includes(')') && text.includes('.')) {
    // APA typically has (year) pattern and ends with DOI/URL
    if (
      text.match(/\(\d{4}\)/) &&
      (text.includes('doi:') || text.includes('http'))
    ) {
      return 'apa';
    }
  }

  // MLA format detection patterns
  if (
    text.includes('works cited') ||
    text.match(/^[a-z]+\s+[a-z]+\./) ||
    (text.includes('vol.') && text.includes('pp.'))
  ) {
    return 'mla';
  }

  // Harvard format detection patterns
  if (text.match(/\([a-z]+\s+\d{4}\)/) && text.includes('retrieved from')) {
    return 'harvard';
  }

  // Vancouver format detection (numbered citations)
  if (text.match(/^\d+\./) || text.match(/\[\d+\]/)) {
    return 'vancouver';
  }

  // Chicago format detection
  if (text.includes('vol.') || text.includes('no.') || text.includes('pp.')) {
    return 'chicago';
  }

  // Default to APA if uncertain
  return 'apa';
};

// Extract authors from citation text
const extractAuthors = (text, format = 'apa') => {
  const authors = [];

  // Split text into parts to find author section
  const parts = text.split('.');
  if (parts.length < 2) return authors;

  // First part usually contains authors
  const authorSection = parts[0].trim();

  // Check if text contains Persian characters
  const hasPersian = /[آ-ی]/.test(authorSection);

  if (hasPersian) {
    // Handle Persian authors - improved parsing for citation formats
    // Persian citations typically use: "نام خانوادگی، نام" (Lastname، Firstname)
    // This matches APA, Chicago, Vancouver formats for Persian
    
    // Clean the author section
    const cleanAuthorSection = authorSection
      .replace(/\s*و\s+/g, ',') // Replace "و" with comma for splitting
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Pattern: نام خانوادگی، نام
    // Captures multi-word lastnames and firstnames
    const persianAuthorPattern = /([آ-ی\s]+?)،\s*([آ-ی\s]+?)(?=،|,|$|و)/g;
    let match;

    while ((match = persianAuthorPattern.exec(cleanAuthorSection)) !== null) {
      const lastname = match[1]?.trim();
      const firstname = match[2]?.trim();

      if (lastname && firstname && lastname.length > 1 && firstname.length > 1) {
        // Skip common words that might be mistaken as names
        const skipWords = [
          'و',
          'در',
          'به',
          'از',
          'که',
          'این',
          'آن',
          'با',
          'برای',
          'یک',
          'را',
        ];
        
        // Check if both parts are not in skip words
        if (
          !skipWords.includes(lastname) &&
          !skipWords.includes(firstname) &&
          lastname !== firstname
        ) {
          authors.push({
            firstname: firstname,
            lastname: lastname,
          });
        }
      }
    }

    // If no authors found with the pattern above, try a simpler approach
    if (authors.length === 0) {
      // Split by common delimiters
      const parts = cleanAuthorSection.split(/[,،]/);
      for (let i = 0; i < parts.length - 1; i += 2) {
        const lastname = parts[i]?.trim();
        const firstname = parts[i + 1]?.trim();
        
        if (lastname && firstname && lastname.length > 1 && firstname.length > 1) {
          authors.push({
            firstname: firstname,
            lastname: lastname,
          });
        }
      }
    }
  } else {
    // Handle English authors based on format
    let patterns = [];

    switch (format) {
      case 'apa':
        patterns = [
          /([A-Z][a-z]+),\s*([A-Z]\.?)\s*&\s*([A-Z][a-z]+),\s*([A-Z]\.?)/g, // Lastname, F. & Lastname, M.
          /([A-Z][a-z]+),\s*([A-Z]\.?)/g, // Lastname, F.
          /([A-Z][a-z]+),\s*([A-Z][a-z]+)/g, // Lastname, Firstname
        ];
        break;
      case 'mla':
        patterns = [
          /([A-Z][a-z]+),\s*([A-Z][a-z]+)/g, // Lastname, Firstname
          /([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, // Firstname Lastname
        ];
        break;
      case 'harvard':
        patterns = [
          /([A-Z][a-z]+),\s*([A-Z]\.?)/g, // Lastname, F.
          /([A-Z][a-z]+),\s*([A-Z][a-z]+)/g, // Lastname, Firstname
        ];
        break;
      case 'chicago':
        patterns = [
          /([A-Z][a-z]+),\s*([A-Z][a-z]+)/g, // Lastname, Firstname
          /([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, // Firstname Lastname
        ];
        break;
      case 'vancouver':
        patterns = [
          /([A-Z][a-z]+)\s+([A-Z]\.?)/g, // Lastname F.
          /([A-Z][a-z]+)\s+([A-Z][a-z]+)/g, // Lastname Firstname
        ];
        break;
      default:
        patterns = [
          /([A-Z][a-z]+),\s*([A-Z]\.?)/g,
          /([A-Z][a-z]+),\s*([A-Z][a-z]+)/g,
        ];
    }

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(authorSection)) !== null) {
        if (match[1] && match[2] && match[1].length > 1) {
          authors.push({
            firstname: match[2].trim(),
            lastname: match[1].trim(),
          });

          // Handle additional authors in the same match (for patterns with 4+ groups)
          if (match[3] && match[4] && match[3].length > 1) {
            authors.push({
              firstname: match[4].trim(),
              lastname: match[3].trim(),
            });
          }
        }
      }
    }
  }

  return authors;
};

// Extract year from citation text
const extractYear = (text) => {
  // Look for year patterns
  const yearPatterns = [
    /\((\d{4})\)/, // (2024)
    /(\d{4})\./, // 2024.
    /(\d{4}),/, // 2024,
    /(\d{4})\s/, // 2024
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const year = parseInt(match[1]);
      // Validate year range
      if (year >= 1000 && year <= 2100) {
        return year;
      }
    }
  }

  return null;
};

// Extract title from citation text
const extractTitle = (text, format = 'apa') => {
  // Split text into parts
  const parts = text.split('.');
  if (parts.length < 3) return null;

  // Title extraction based on format
  let titlePart = null;

  switch (format) {
    case 'apa':
      // APA: Title is usually the second part (after authors, before journal)
      titlePart = parts[1]?.trim();
      break;
    case 'mla':
      // MLA: Title is usually the second part, often in quotes
      titlePart = parts[1]?.trim();
      // Remove quotes if present
      titlePart = titlePart?.replace(/^["']|["']$/g, '');
      break;
    case 'harvard':
      // Harvard: Title is usually the second part
      titlePart = parts[1]?.trim();
      break;
    case 'chicago':
      // Chicago: Title is usually the second part
      titlePart = parts[1]?.trim();
      break;
    case 'vancouver':
      // Vancouver: Title is usually the second part
      titlePart = parts[1]?.trim();
      break;
    default:
      titlePart = parts[1]?.trim();
  }

  if (!titlePart) return null;

  // Clean up the title part
  titlePart = titlePart
    .replace(/^\s*\.\s*/, '') // Remove leading period
    .replace(/\s*\.\s*$/, '') // Remove trailing period
    .trim();

  // If title is too short, try the next part
  if (titlePart.length < 10 && parts[2]) {
    titlePart = parts[2].trim();
  }

  // Additional cleanup
  titlePart = titlePart
    .replace(/^[آ-یA-Za-z]+\s*,\s*/, '') // Remove any remaining author parts
    .replace(/\s*\([^)]*\)\s*$/, '') // Remove trailing parentheses
    .trim();

  return titlePart.length > 5 ? titlePart : null;
};

// Extract journal/publication info
const extractPublicationInfo = (text) => {
  const publicationDetails = {};

  // Split text into parts to find journal section
  const parts = text.split('.');
  if (parts.length >= 4) {
    // Journal is usually in the fourth part (after title)
    const journalPart = parts[3]?.trim();
    if (journalPart) {
      // Extract journal name (before parentheses or volume/issue)
      const journalMatch = journalPart.match(/^([^()،]+)/);
      if (journalMatch && journalMatch[1]) {
        publicationDetails.journal = journalMatch[1].trim();
      }
    }
  }

  // Extract volume and issue from the entire text
  const volumeIssuePatterns = [
    /(\d+)\s*\(\s*(\d+)\s*\)/, // 9(34) with optional spaces
    /vol\.\s*(\d+),?\s*no\.\s*(\d+)/i, // vol. 9, no. 34
  ];

  for (const pattern of volumeIssuePatterns) {
    const match = text.match(pattern);
    if (match) {
      publicationDetails.volume = match[1];
      if (match[2]) publicationDetails.issue = match[2];
      break;
    }
  }

  // Extract pages
  const pagesPatterns = [
    /(\d+-\d+)/, // 25-50
    /pp\.\s*(\d+-\d+)/i, // pp. 25-50
    /p\.\s*(\d+)/i, // p. 25
  ];

  for (const pattern of pagesPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && !publicationDetails.pages) {
      publicationDetails.pages = match[1];
      break;
    }
  }

  return publicationDetails;
};

// Extract identifiers (DOI, URL, etc.)
const extractIdentifiers = (text) => {
  const identifiers = {};

  // Extract DOI
  const doiPattern = /doi:\s*([^\s,]+)/i;
  const doiMatch = text.match(doiPattern);
  if (doiMatch) {
    identifiers.doi = doiMatch[1];
  }

  // Extract URL
  const urlPattern = /(https?:\/\/[^\s,]+)/i;
  const urlMatch = text.match(urlPattern);
  if (urlMatch) {
    identifiers.url = urlMatch[1];
  }

  // Extract ISBN
  const isbnPattern = /isbn[:\s]*([0-9-]+)/i;
  const isbnMatch = text.match(isbnPattern);
  if (isbnMatch) {
    identifiers.isbn = isbnMatch[1];
  }

  return identifiers;
};

// Detect language based on content
const detectLanguage = (text) => {
  // Check for Persian characters
  const persianPattern = /[آ-ی]/;
  if (persianPattern.test(text)) {
    return 'persian';
  }
  return 'english';
};

// Main citation parser function
export const parseCitation = (citationText) => {
  try {
    if (!citationText || typeof citationText !== 'string') {
      throw new Error('Invalid citation text');
    }

    const text = citationText.trim();
    const format = detectCitationFormat(text);
    const language = detectLanguage(text);

    // Extract components
    const authors = extractAuthors(text, format);
    const year = extractYear(text);
    const title = extractTitle(text, format);
    const publicationDetails = extractPublicationInfo(text);
    const identifiers = extractIdentifiers(text);

    // Determine source type based on content
    let type = 'article'; // default
    if (text.toLowerCase().includes('book') || identifiers.isbn) {
      type = 'book';
    } else if (
      text.toLowerCase().includes('thesis') ||
      text.toLowerCase().includes('dissertation')
    ) {
      type = 'thesis';
    } else if (identifiers.url && !publicationDetails.journal) {
      type = 'website';
    }

    // Convert year based on language
    let convertedYear = year;
    if (year && language === 'persian') {
      // If year is in Persian format (1300-1500), keep as is
      // If year is in Gregorian format (1900-2100), convert to Persian
      if (year >= 1300 && year <= 1500) {
        convertedYear = year;
      } else if (year >= 1900 && year <= 2100) {
        const gregorianDate = moment(`${year}-01-01`, 'YYYY-MM-DD');
        convertedYear = gregorianDate.jYear();
      }
    }

    const parsedData = {
      title: title || '',
      authors: authors.length > 0 ? authors : [],
      year: convertedYear,
      type,
      language,
      publicationDetails:
        Object.keys(publicationDetails).length > 0
          ? publicationDetails
          : undefined,
      identifiers:
        Object.keys(identifiers).length > 0 ? identifiers : undefined,
      detectedFormat: format,
      confidence: calculateConfidence(authors, title, year, publicationDetails),
    };

    return {
      success: true,
      data: parsedData,
      message: 'Citation parsed successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to parse citation',
    };
  }
};

// Calculate confidence score for parsing
const calculateConfidence = (authors, title, year, publicationDetails) => {
  let score = 0;

  if (authors && authors.length > 0) score += 30;
  if (title && title.length > 10) score += 25;
  if (year) score += 20;
  if (publicationDetails && publicationDetails.journal) score += 15;
  if (
    publicationDetails &&
    (publicationDetails.volume || publicationDetails.pages)
  )
    score += 10;

  return Math.min(score, 100);
};

// Test function for development
export const testCitationParser = () => {
  const testCitations = [
    // Persian APA
    'زبان فهم نصیری، سارا، حسن زاده، اسماعیل، و احمدی، نزهت. (1396). واکنش ها به فرامین ممنوعیت شراب, مواد مخدر و ریش در چند نامه اخوانی از قرن یازدهم. مطالعات تاریخ فرهنگی (پژوهشنامه انجمن ایرانی تاریخ)، 9(34 )، 25-50. SID. https://sid.ir/paper/233178/fa',

    // English APA
    'Smith, J., & Johnson, M. (2024). The impact of technology on education. Journal of Educational Technology, 15(3), 123-145. doi:10.1234/jet.2024.001',

    // MLA
    'Smith, John, and Mary Johnson. "The Impact of Technology on Education." Journal of Educational Technology, vol. 15, no. 3, 2024, pp. 123-145.',

    // Harvard
    'Smith, J & Johnson, M 2024, "The impact of technology on education", Journal of Educational Technology, vol. 15, no. 3, pp. 123-145, retrieved from https://doi.org/10.1234/jet.2024.001',

    // Chicago
    'Smith, John, and Mary Johnson. "The Impact of Technology on Education." Journal of Educational Technology 15, no. 3 (2024): 123-145.',

    // Vancouver
    '1. Smith J, Johnson M. The impact of technology on education. J Educ Technol. 2024;15(3):123-145.',
  ];

  testCitations.forEach((citation, index) => {
    console.log(`\n--- Test ${index + 1} ---`);
    console.log('Citation:', citation);
    const result = parseCitation(citation);
    console.log('Result:', JSON.stringify(result, null, 2));
  });
};
