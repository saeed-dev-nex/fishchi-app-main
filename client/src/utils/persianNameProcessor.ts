/**
 * Persian Name Processor Utility
 * Handles parsing and formatting of Persian and English author names
 * Based on citation formats like APA, Chicago, Vancouver, etc.
 */

export interface Author {
  firstname: string;
  lastname: string;
}

/**
 * Detects if text contains Persian characters
 */
const hasPersianCharacters = (text: string): boolean => {
  return /[آ-ی]/.test(text);
};

/**
 * Parse Persian author names from citation format
 * Format: "نام خانوادگی، نام" (Lastname، Firstname)
 * Example: "ربیعی، لیلا" => { firstname: "لیلا", lastname: "ربیعی" }
 */
const parsePersianAuthors = (authorText: string): Author[] => {
  const authors: Author[] = [];
  
  // Remove common Persian conjunctions and clean up
  const cleanText = authorText
    .replace(/\s*و\s+/g, ',')  // Replace "و" with comma
    .replace(/\s*،\s*/g, '،')  // Normalize Persian comma spacing
    .trim();

  // Pattern: نام خانوادگی، نام
  // The pattern captures: Lastname، Firstname
  const persianAuthorPattern = /([آ-ی\s]+)،\s*([آ-ی\s]+)/g;
  let match;

  while ((match = persianAuthorPattern.exec(cleanText)) !== null) {
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

      if (
        !skipWords.includes(lastname) &&
        !skipWords.includes(firstname)
      ) {
        authors.push({
          firstname: firstname,
          lastname: lastname,
        });
      }
    }
  }

  return authors;
};

/**
 * Parse English author names from citation format
 * Handles multiple formats:
 * - "Lastname, Firstname" (APA, Chicago)
 * - "Firstname Lastname" (some formats)
 * - "Lastname F." (abbreviated)
 */
const parseEnglishAuthors = (authorText: string): Author[] => {
  const authors: Author[] = [];
  
  // Split by common separators
  const authorParts = authorText.split(/[,،&;|]+/).map(part => part.trim());

  for (const part of authorParts) {
    if (!part || part.length < 2) continue;

    // Skip common connector words
    if (['and', 'et al', 'et', 'al'].includes(part.toLowerCase())) {
      continue;
    }

    // Pattern 1: "Lastname, Firstname" or "Lastname, F."
    const commaMatch = part.match(/^([A-Z][a-zA-Z'-]+)\s*,?\s+([A-Z][a-zA-Z.'-]*)/);
    if (commaMatch) {
      authors.push({
        firstname: commaMatch[2].replace(/\./g, '').trim(),
        lastname: commaMatch[1].trim(),
      });
      continue;
    }

    // Pattern 2: "Firstname Lastname" (simple two-word names)
    const spaceMatch = part.match(/^([A-Z][a-z]+)\s+([A-Z][a-zA-Z'-]+)$/);
    if (spaceMatch) {
      // Check if first word looks like a first name (shorter, common patterns)
      const possibleFirstname = spaceMatch[1];
      const possibleLastname = spaceMatch[2];
      
      // If it's just two capitalized words, assume Firstname Lastname
      if (possibleFirstname.length <= 15) {
        authors.push({
          firstname: possibleFirstname,
          lastname: possibleLastname,
        });
      }
    }
  }

  return authors;
};

/**
 * Main function to parse authors from text
 * Automatically detects Persian or English and uses appropriate strategy
 */
export const parseAuthors = (authorText: string): Author[] => {
  if (!authorText || authorText.trim().length === 0) {
    return [];
  }

  const cleanText = authorText.trim();
  
  // Detect language
  if (hasPersianCharacters(cleanText)) {
    return parsePersianAuthors(cleanText);
  } else {
    return parseEnglishAuthors(cleanText);
  }
};

/**
 * Format authors for display
 * Persian: "نام نام خانوادگی" (Firstname Lastname)
 * English: "Firstname Lastname"
 */
export const formatAuthors = (authors: Author[]): string => {
  if (!authors || authors.length === 0) return '';
  
  return authors
    .map(author => `${author.firstname} ${author.lastname}`)
    .join(', ');
};

/**
 * Format authors for storage (reverse format for Persian citations)
 * This maintains the citation format: "نام خانوادگی، نام"
 */
export const formatAuthorsForCitation = (authors: Author[]): string => {
  if (!authors || authors.length === 0) return '';
  
  // Check if any author has Persian characters
  const hasPersian = authors.some(
    author =>
      hasPersianCharacters(author.firstname) ||
      hasPersianCharacters(author.lastname)
  );

  if (hasPersian) {
    // Persian format: "نام خانوادگی، نام"
    return authors
      .map(author => `${author.lastname}، ${author.firstname}`)
      .join(', ');
  } else {
    // English format: "Firstname Lastname"
    return authors
      .map(author => `${author.firstname} ${author.lastname}`)
      .join(', ');
  }
};

/**
 * Split author string by common delimiters
 * Handles: comma (,), Persian comma (،), pipe (|), semicolon (;), ampersand (&)
 */
export const splitAuthorString = (authorText: string): string[] => {
  if (!authorText) return [];
  
  // Split by delimiters but preserve Persian comma pattern "نام خانوادگی، نام"
  const parts: string[] = [];
  let current = '';
  
  for (let i = 0; i < authorText.length; i++) {
    const char = authorText[i];
    const nextChar = authorText[i + 1];
    
    // Check if this is a delimiter
    if ([',', '،', '|', ';', '&'].includes(char)) {
      // For Persian comma, check if it's part of "Lastname، Firstname" pattern
      if (char === '،' && nextChar && nextChar.trim() && /[آ-ی]/.test(nextChar)) {
        // This is likely part of a Persian name pattern, keep it
        current += char;
      } else {
        // This is a separator between authors
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
      }
    } else if (char === ' ' && ['و'].includes(nextChar)) {
      // Persian "و" (and)
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
      i++; // Skip the "و"
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
};

/**
 * Validate author object
 */
export const isValidAuthor = (author: Author): boolean => {
  return (
    author &&
    typeof author === 'object' &&
    typeof author.firstname === 'string' &&
    typeof author.lastname === 'string' &&
    author.firstname.length > 0 &&
    author.lastname.length > 0
  );
};

/**
 * Example usage and test cases
 */
export const testPersianNameProcessor = () => {
  const testCases = [
    'ربیعی، لیلا',
    'یوسفی خواه، سارا',
    'گرزین، سارا',
    'مازوچی، مجتبی',
    'حسینی، تانیا',
    'ربیعی، لیلا، یوسفی خواه، سارا، گرزین، سارا',
    'Smith, John',
    'Smith, J., & Johnson, M.',
    'John Smith, Mary Johnson',
  ];

  console.log('=== Persian Name Processor Tests ===\n');
  
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: "${testCase}"`);
    const authors = parseAuthors(testCase);
    console.log('Parsed:', JSON.stringify(authors, null, 2));
    console.log('Formatted:', formatAuthors(authors));
    console.log('Citation Format:', formatAuthorsForCitation(authors));
    console.log('---\n');
  });
};
