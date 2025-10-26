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
export const hasPersianCharacters = (text: string): boolean => {
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
    .replace(/\s*و\s+/g, ',') // Replace "و" with comma
    .replace(/\s*،\s*/g, '،') // Normalize Persian comma spacing
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

      if (!skipWords.includes(lastname) && !skipWords.includes(firstname)) {
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
  const authorParts = authorText.split(/[,،&;|]+/).map((part) => part.trim());

  for (const part of authorParts) {
    if (!part || part.length < 2) continue;

    // Skip common connector words
    if (['and', 'et al', 'et', 'al'].includes(part.toLowerCase())) {
      continue;
    }

    // Pattern 1: "Lastname, Firstname" or "Lastname, F."
    const commaMatch = part.match(
      /^([A-Z][a-zA-Z'-]+)\s*,?\s+([A-Z][a-zA-Z.'-]*)/
    );
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
    .map((author) => `${author.firstname} ${author.lastname}`)
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
    (author) =>
      hasPersianCharacters(author.firstname) ||
      hasPersianCharacters(author.lastname)
  );

  if (hasPersian) {
    // Persian format: "نام خانوادگی، نام"
    return authors
      .map((author) => `${author.lastname}، ${author.firstname}`)
      .join(', ');
  } else {
    // English format: "Firstname Lastname"
    return authors
      .map((author) => `${author.firstname} ${author.lastname}`)
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
      if (
        char === '،' &&
        nextChar &&
        nextChar.trim() &&
        /[آ-ی]/.test(nextChar)
      ) {
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

// Revised function to extract authors with improved Persian handling
// Function to safely trim strings, handles null/undefined
const safeTrim = (str: any): string => (str ? String(str).trim() : '');

// Revised function to extract authors with improved Persian handling
export const extractAuthors = (text: any): Author[] => {
  const authors: Author[] = [];
  if (!text || typeof text !== 'string') return authors;

  // Split text into parts to isolate the author section (usually before the year or first main period)
  const potentialAuthorSection = text.split(/[\(\.\d{4}]/)[0] || '';
  let authorSection = safeTrim(potentialAuthorSection);

  // Early exit if the section is too short or likely not authors
  if (authorSection.length < 3) return authors;

  const hasPersian = /[آ-ی]/.test(authorSection);

  // 1. Normalize separators and clean the string
  let normalizedText = authorSection
    .replace(/\s*و\s+/g, ' ; ') // Replace Persian 'and' with semicolon
    .replace(/\s*and\s+/gi, ' ; ') // Replace English 'and' with semicolon
    .replace(/\s*&\s+/g, ' ; ') // Replace '&' with semicolon
    .replace(/\s*،\s*/g, '،') // Normalize Persian comma spacing
    .replace(/\s*,\s*/g, ',') // Normalize English comma spacing
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/et al\./gi, '') // Remove "et al."
    .trim();

  // 2. Split into potential author segments
  const segments = normalizedText.split(/\s*;\s*/); // Split primarily by semicolon

  for (const segment of segments) {
    const trimmedSegment = safeTrim(segment);
    if (trimmedSegment.length < 3) continue;

    if (hasPersian && trimmedSegment.includes('،')) {
      // --- Persian "Lastname، Firstname" pattern ---
      // Regex: Capture group 1 (lastname, possibly multi-word) before '،'
      //        Capture group 2 (firstname, possibly multi-word) after '،'
      //        Handles potential spaces around the comma.
      const persianMatch = trimmedSegment.match(
        /^([\u0600-\u06FF\s]+?)،\s*([\u0600-\u06FF\s]+)$/
      );
      if (persianMatch) {
        const lastname = safeTrim(persianMatch[1]);
        const firstname = safeTrim(persianMatch[2]);
        if (firstname.length > 1 && lastname.length > 1) {
          authors.push({ firstname, lastname });
          continue; // Move to the next segment
        }
      }
      // Fallback for potentially multiple names separated by Persian comma
      const commaParts = trimmedSegment.split('،');
      if (commaParts.length >= 2) {
        // Attempt to treat pairs as Last, First
        for (let i = 0; i < commaParts.length - 1; i += 2) {
          const lastname = safeTrim(commaParts[i]);
          const firstname = safeTrim(commaParts[i + 1]);
          if (firstname.length > 1 && lastname.length > 1) {
            authors.push({ firstname, lastname });
          }
        }
        continue;
      }
    } else if (trimmedSegment.includes(',')) {
      // --- English "Lastname, Firstname" or "Lastname, F." pattern ---
      const commaParts = trimmedSegment.split(',');
      const lastname = safeTrim(commaParts[0]);
      const firstnamePart = safeTrim(commaParts.slice(1).join(',')); // Join back if comma was in name
      const firstnameMatch = firstnamePart.match(/^([A-Z\.\s]+)/i); // Extract initials or full first name
      const firstname = firstnameMatch
        ? safeTrim(firstnameMatch[0].replace(/\./g, ''))
        : '';

      if (firstname.length > 0 && lastname.length > 1) {
        authors.push({ firstname, lastname });
        continue; // Move to the next segment
      }
    }

    // --- Fallback: Assume "Firstname Lastname" or simple name ---
    // Handle cases without commas (Persian or English)
    const words = trimmedSegment.split(' ');
    if (words.length >= 2) {
      // Simple assumption: First word is firstname, rest is lastname (common in some English styles or if parsing failed)
      // Or for Persian if comma wasn't used correctly.
      // This is less reliable but acts as a fallback.
      const firstname = safeTrim(words[0]);
      const lastname = safeTrim(words.slice(1).join(' '));
      if (firstname.length > 1 && lastname.length > 1) {
        // Basic validation to avoid adding invalid parts
        if (!/\d/.test(firstname) && !/\d/.test(lastname)) {
          // Avoid numbers
          authors.push({ firstname, lastname });
        }
      }
    } else if (
      words.length === 1 &&
      words[0].length > 2 &&
      !/\d/.test(words[0])
    ) {
      // Single word - less ideal, maybe treat as lastname? Or skip? Let's add with empty firstname for now.
      // authors.push({ firstname: '', lastname: safeTrim(words[0]) });
      // Or better, try to combine with previous if it makes sense (more complex)
      // For simplicity, we might skip single-word segments unless context suggests otherwise.
    }
  }

  // --- Final Validation and Deduplication ---
  const validAuthors = [];
  const seenNames = new Set();
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
    'دانشگاه',
    'گروه',
    'چکیده',
    'مجله',
    'مقاله',
  ]; // Add more if needed

  for (const author of authors) {
    if (
      author.firstname &&
      author.lastname &&
      author.firstname.length > 1 &&
      author.lastname.length > 1 &&
      !skipWords.includes(author.firstname.toLowerCase()) &&
      !skipWords.includes(author.lastname.toLowerCase())
    ) {
      const fullName = `${author.firstname} ${author.lastname}`;
      if (!seenNames.has(fullName)) {
        validAuthors.push(author);
        seenNames.add(fullName);
      }
    }
  }

  return validAuthors;
};
