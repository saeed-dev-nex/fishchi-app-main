/**
 * Persian Name Processor
 * Handles reversal of Persian names from "FamilyName FirstName" to "FirstName FamilyName"
 * Supports complex Persian naming patterns with multiple name and family name parts
 */

// پیشوندهای رایج در نام‌ها
const persianAllNamePrefixes = [
  // مذهبی
  'سید',
  'سیده',
  'میر',
  'میرزا',
  'حاج',
  'حاجیه',
  'حاجی',
  'آیت‌الله',
  'حجةالاسلام',
  'آقا',
  'شیخ',
  'مولوی',
  'علامه',
  'امام',
  'استاد',
  'پیر',
  'ماموستا',
  'غلام',
  'سیّد',
  'ملا',

  // شغلی و عنوانی

  'دکتر',
  'پزشک',
  // توصیفی
  'بی',
  'نا',
  'بد',
  'با',
  'هم',
  'پر',
  'فر',
  'خوش',
  'بد',
  // ترکیبی
  'عدل',
  'نور',
  'داد',
  'توکل',
  'حق',
  'شهر',
  'مهر',
  'آب',
  'گل',
  'چهار',
  'سبز',
];

// پسوندهای رایج در نام‌خانوادگی‌ها
const persianAllFamilySuffixes = [
  // پسوندهای نسبی
  'زاده',
  'زاد',
  'پور',
  'نژاد',
  'بن',
  'نو',
  'فرزند',
  // پسوندهای باستانی و نخبه
  'فر',
  'کیا',
  'اصل',
  'مه',
  'جاوید',
  // معنایی و رابط
  'دوست',
  'طلب',
  'خواه',
  'پرور',
  'پرست',
  'دار',
  // شغلی
  'گر',
  'کار',
  'چی',
  'ساز',
  'بان',
  'دار',
  // جغرافیایی/قومیتی
  'آبادی',
  'وند',
  'لو',
  'لی',
  'یان',
  'دهقان',
  'دهقانی',
  // جغرافیایی
  'کوهی',
  'کوهستانی',
  'خراسانی',
  'اصفهانی',
  'شیرازی',
  'تهرانی',
  'تبریزی',
  'یزدی',
  'کرمانی',
  'مازندرانی',
  'اردبیلی',
  'سنندجی',
  'مشهدی',
  'نجفی',
  'عراقی',
  'کاشانی',
  'عرب',
  'ترک',
  'کرد',
  'بلوچ',
  'لر',
  // صفات و مشتق
  'ی',
  'انی',
  'آسا',
  'آگه',
  'آگین',
  'مند',
  'ناک',
  // مالکیت و ساخت
  'بان',
  'دار',
  'ساز',
  'ور',
  // ترکیبی ویژه
  'بد',
  'آور',
  'فام',
  'کده',
  'آسا',
  'خان',
  'کدخدا',
  'خواجه',
  'امیر',
  'سردار',
  'سرهنگ',
  'مشهدی',
  'ملا',
];

/**
 * Checks if a word is likely a name prefix
 * @param {string} word - The word to check
 * @returns {boolean} - True if the word is a name prefix
 */
function isNamePrefix(word) {
  return persianAllNamePrefixes.includes(word.trim());
}

/**
 * Checks if a word is likely a family name suffix
 * @param {string} word - The word to check
 * @returns {boolean} - True if the word is a family name suffix
 */
function isFamilySuffix(word) {
  return persianAllFamilySuffixes.includes(word.trim());
}

/**
 * Calculates the probability that a word is part of the first name
 * @param {string} word - The word to analyze
 * @param {number} position - Position of the word in the name
 * @param {number} totalWords - Total number of words
 * @returns {number} - Probability score (0-1)
 */
function getNameProbability(word, position, totalWords) {
  let score = 0;

  // Position-based scoring
  if (position === 0) score += 0.3; // First word is more likely to be family name
  if (position === totalWords - 1) score += 0.2; // Last word is more likely to be first name

  // Prefix-based scoring
  if (isNamePrefix(word)) {
    score += 0.4; // Strong indicator of first name
  }

  // Suffix-based scoring
  if (isFamilySuffix(word)) {
    score -= 0.3; // Strong indicator of family name
  }

  // Length-based scoring (shorter words are often first names)
  if (word.length <= 4) score += 0.1;
  if (word.length >= 8) score -= 0.1;

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculates the probability that a word is part of the family name
 * @param {string} word - The word to analyze
 * @param {number} position - Position of the word in the name
 * @param {number} totalWords - Total number of words
 * @returns {number} - Probability score (0-1)
 */
function getFamilyProbability(word, position, totalWords) {
  let score = 0;

  // Position-based scoring
  if (position === 0) score += 0.4; // First word is more likely to be family name
  if (position === totalWords - 1) score -= 0.2; // Last word is less likely to be family name

  // Suffix-based scoring
  if (isFamilySuffix(word)) {
    score += 0.4; // Strong indicator of family name
  }

  // Prefix-based scoring
  if (isNamePrefix(word)) {
    score -= 0.3; // Strong indicator of first name
  }

  // Length-based scoring (longer words are often family names)
  if (word.length >= 6) score += 0.1;
  if (word.length <= 3) score -= 0.1;

  return Math.max(0, Math.min(1, score));
}

/**
 * Finds the optimal split point for name and family name
 * @param {string[]} words - Array of words
 * @returns {number} - Index where family name ends and first name begins
 */
function findOptimalSplitPoint(words) {
  const totalWords = words.length;

  if (totalWords === 2) {
    return 1; // Simple case: first word is family name, second is first name
  }

  let bestSplit = 1;
  let bestScore = -Infinity;

  // Try different split points
  for (let split = 1; split < totalWords; split++) {
    let score = 0;

    // Calculate scores for family name part (before split)
    for (let i = 0; i < split; i++) {
      score += (getFamilyProbability(words[i], i, split) * (split - i)) / split;
    }

    // Calculate scores for first name part (after split)
    for (let i = split; i < totalWords; i++) {
      score +=
        (getNameProbability(words[i], i - split, totalWords - split) *
          (totalWords - i)) /
        (totalWords - split);
    }

    // Bonus for balanced split
    const balance = 1 - Math.abs(split - (totalWords - split)) / totalWords;
    score += balance * 0.2;

    if (score > bestScore) {
      bestScore = score;
      bestSplit = split;
    }
  }

  return bestSplit;
}

/**
 * Reverses a Persian name from "FamilyName FirstName" to "FirstName FamilyName"
 * @param {string} name - The name to reverse
 * @returns {string} - The reversed name
 */
function reversePersianName(name) {
  if (!name || typeof name !== 'string') {
    return name;
  }

  // Clean and normalize the input
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const words = cleanName.split(' ');

  if (words.length < 2) {
    return name; // Can't reverse single word names
  }

  if (words.length === 2) {
    // Simple case: just swap the two words
    return `${words[1]} ${words[0]}`;
  }

  // Complex case: find optimal split point
  const splitPoint = findOptimalSplitPoint(words);

  const familyNameParts = words.slice(0, splitPoint);
  const firstNameParts = words.slice(splitPoint);

  return `${firstNameParts.join(' ')} ${familyNameParts.join(' ')}`;
}

/**
 * Processes multiple names in a text
 * @param {string} text - Text containing names
 * @returns {string} - Text with reversed names
 */
function processNamesInText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Common patterns for names in academic contexts
  const namePatterns = [
    // Pattern: "FamilyName, FirstName" or "FamilyName FirstName"
    /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+)\s*,\s*([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+)/g,
    // Pattern: "FamilyName FirstName" (simple case)
    /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)\s+([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g,
  ];

  let processedText = text;

  namePatterns.forEach((pattern) => {
    processedText = processedText.replace(pattern, (match, part1, part2) => {
      // If there's a comma, it's likely "FamilyName, FirstName"
      if (match.includes(',')) {
        return `${part2.trim()} ${part1.trim()}`;
      }

      // Otherwise, use the smart algorithm
      const fullName = `${part1.trim()} ${part2.trim()}`;
      return reversePersianName(fullName);
    });
  });

  return processedText;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    reversePersianName,
    processNamesInText,
    isNamePrefix,
    isFamilySuffix,
    getNameProbability,
    getFamilyProbability,
    findOptimalSplitPoint,
  };
}

// Make functions available globally for browser use
if (typeof window !== 'undefined') {
  window.PersianNameProcessor = {
    reversePersianName,
    processNamesInText,
    isNamePrefix,
    isFamilySuffix,
    getNameProbability,
    getFamilyProbability,
    findOptimalSplitPoint,
  };
}

// For Node.js testing
if (typeof global !== 'undefined') {
  global.PersianNameProcessor = {
    reversePersianName,
    processNamesInText,
    isNamePrefix,
    isFamilySuffix,
    getNameProbability,
    getFamilyProbability,
    findOptimalSplitPoint,
  };
}
