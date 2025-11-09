// server/src/utils/citationEngine.js
import { Cite, plugins } from '@citation-js/core';
import '@citation-js/plugin-csl';

// Global citation tracking for Vancouver numbering
let vancouverCitationOrder = new Map();
let vancouverCounter = 0;

// Persian localization mappings
const PERSIAN_LOCALIZATIONS = {
  and: 'و',
  'et al.': 'و همکاران',
  'et al': 'و همکاران',
  'eds.': 'ویراستاران',
  'ed.': 'ویراستار',
  'pp.': 'صص.',
  'p.': 'ص.',
  'vol.': 'جلد',
  'no.': 'شماره',
  'n.d.': 'بی‌تا',
  In: 'در',
  'Retrieved from': 'بازیابی از',
  'Available at': 'دسترس در',
  January: 'ژانویه',
  February: 'فوریه',
  March: 'مارس',
  April: 'آوریل',
  May: 'می',
  June: 'ژوئن',
  July: 'ژوئیه',
  August: 'اوت',
  September: 'سپتامبر',
  October: 'اکتبر',
  November: 'نوامبر',
  December: 'دسامبر',
};

/**
 * Formats citations for given CSL-JSON items with enhanced Vancouver support
 *
 * @param {Array<Object>} cslItems - Array of CSL-JSON objects
 * @param {string} styleName - Citation style (e.g., 'apa', 'mla', 'vancouver')
 * @param {Array<string>} itemIdsToCite - Array of item IDs to cite
 * @param {string} lang - Locale (e.g., 'en-US', 'fa-IR')
 * @param {Object} options - Additional formatting options
 * @returns {Object} Object with inText and bibliography strings
 */
export const formatCitations = (
  cslItems,
  styleName = 'apa',
  itemIdsToCite = [],
  lang = 'en-US',
  options = {}
) => {
  try {
    // Validate inputs
    if (!cslItems || cslItems.length === 0) {
      throw new Error('No CSL items provided');
    }

    // Normalize style name
    const normalizedStyle = normalizeStyleName(styleName);
    const isVancouver = normalizedStyle === 'vancouver';
    const isPersian = lang === 'fa-IR' || lang.startsWith('fa');

    // Handle Vancouver numbering
    if (isVancouver && options.resetNumbering) {
      vancouverCitationOrder.clear();
      vancouverCounter = 0;
    }

    // Create a Cite instance with all items (for context)
    const cite = new Cite(cslItems);

    // Generate in-text citation for specific items
    let inText = '';
    if (itemIdsToCite && itemIdsToCite.length > 0) {
      // Filter the items we want to cite
      const itemsToCite = cslItems.filter(
        (item) =>
          itemIdsToCite.includes(item.id) ||
          itemIdsToCite.includes(item.id?.toString())
      );

      if (itemsToCite.length > 0) {
        if (isVancouver) {
          // Handle Vancouver numbering manually
          const numbers = itemsToCite.map((item) => {
            const itemId = item.id?.toString();
            if (!vancouverCitationOrder.has(itemId)) {
              vancouverCounter++;
              vancouverCitationOrder.set(itemId, vancouverCounter);
            }
            return vancouverCitationOrder.get(itemId);
          });

          if (numbers.length === 1) {
            inText = `[${numbers[0]}]`;
          } else {
            inText = `[${numbers.join(',')}]`;
          }
        } else {
          const citeCitation = new Cite(itemsToCite);
          inText = citeCitation.format('citation', {
            format: 'text',
            template: normalizedStyle,
            lang: lang,
          });

          // Apply Persian localization if needed
          if (isPersian) {
            inText = localizeToPersian(inText);
          }
        }
      } else {
        console.warn('No matching items found for citation');
        inText = isVancouver ? '[?]' : '(?)';
      }
    } else {
      // If no specific items to cite, use the first item
      const firstItem = cslItems[0];
      if (isVancouver) {
        const itemId = firstItem.id?.toString();
        if (!vancouverCitationOrder.has(itemId)) {
          vancouverCounter++;
          vancouverCitationOrder.set(itemId, vancouverCounter);
        }
        inText = `[${vancouverCitationOrder.get(itemId)}]`;
      } else {
        const citeCitation = new Cite([firstItem]);
        inText = citeCitation.format('citation', {
          format: 'text',
          template: normalizedStyle,
          lang: lang,
        });

        // Apply Persian localization if needed
        if (isPersian) {
          inText = localizeToPersian(inText);
        }
      }
    }

    // Generate bibliography for all items
    let bibliography = cite.format('bibliography', {
      format: 'text',
      template: normalizedStyle,
      lang: lang,
    });

    // Apply Persian localization to bibliography if needed
    if (isPersian) {
      bibliography = localizeToPersian(bibliography);
    }

    return {
      inText: inText.trim(),
      bibliography: bibliography.trim(),
    };
  } catch (error) {
    console.error('Citation formatting error:', error);

    // Provide fallback formatting
    const fallbackItem = cslItems[0] || {};
    const author = fallbackItem.author?.[0];
    const year = fallbackItem.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
    const authorName = author?.family || author?.literal || 'Unknown';

    const isVancouver = normalizeStyleName(styleName) === 'vancouver';
    return {
      inText: isVancouver ? '[1]' : `(${authorName}, ${year})`,
      bibliography: `${authorName}. (${year}). ${
        fallbackItem.title || 'Untitled'
      }.`,
    };
  }
};

/**
 * Formats a bibliography for given CSL-JSON items
 *
 * @param {Array<Object>} cslItems - Array of CSL-JSON objects
 * @param {string} styleName - Citation style (e.g., 'apa', 'mla', 'chicago-note-bibliography')
 * @param {string} lang - Locale (e.g., 'en-US', 'fa-IR')
 * @returns {string} Formatted bibliography as HTML
 */
export const formatBibliography = (
  cslItems,
  styleName = 'apa',
  lang = 'en-US',
  options = {}
) => {
  try {
    if (!cslItems || cslItems.length === 0) {
      return '<div>No sources to format</div>';
    }

    // Normalize style name
    const normalizedStyle = normalizeStyleName(styleName);
    const isVancouver = normalizedStyle === 'vancouver';

    // For Vancouver style, sort items by their citation order
    let sortedItems = cslItems;
    if (isVancouver && options.citationOrder) {
      sortedItems = [...cslItems].sort((a, b) => {
        const orderA = options.citationOrder.indexOf(a.id?.toString()) || 999;
        const orderB = options.citationOrder.indexOf(b.id?.toString()) || 999;
        return orderA - orderB;
      });
    }

    // Check if we have mixed languages (per-source localization needed)
    const hasMixedLanguages =
      sortedItems.some(
        (item) => item.language === 'fa-IR' || item.language?.startsWith('fa')
      ) &&
      sortedItems.some(
        (item) => item.language !== 'fa-IR' && !item.language?.startsWith('fa')
      );

    console.log('📚 Bibliography language analysis:', {
      totalSources: sortedItems.length,
      hasMixedLanguages: hasMixedLanguages,
      requestedLang: lang,
      sourceLanguages: sortedItems.map((s) => ({ id: s.id, lang: s.language })),
    });

    // If mixed languages or per-source localization needed, process each entry separately
    if (hasMixedLanguages || lang === 'auto') {
      return formatBibliographyWithPerSourceLocalization(
        sortedItems,
        normalizedStyle,
        isVancouver,
        options
      );
    }

    // Otherwise, use standard single-language formatting
    const cite = new Cite(sortedItems);

    // Generate bibliography as HTML
    let bibliography = cite.format('bibliography', {
      format: 'html',
      template: normalizedStyle,
      lang: lang,
    });

    // For Vancouver style, add numbering
    if (isVancouver) {
      bibliography = addVancouverNumbering(
        bibliography,
        sortedItems,
        options.citationOrder
      );
    }

    // Apply Persian localization to entire bibliography if requested language is Persian
    const isPersian = lang === 'fa-IR' || lang.startsWith('fa');
    if (isPersian) {
      bibliography = localizeToPersian(bibliography);
    }

    // Wrap in a div with proper styling for CSL bibliographies
    const styleClass = isVancouver ? 'vancouver-bib' : 'csl-bib-body';
    const styling = isVancouver
      ? 'line-height: 1.35; padding-left: 0; direction: ltr;'
      : 'line-height: 1.35; padding-left: 2em; text-indent: -2em; direction: ltr;';

    return `<div class="${styleClass}" style="${styling}">
  ${bibliography}
</div>`;
  } catch (error) {
    console.error('Bibliography formatting error:', error);

    // Fallback: create simple HTML list
    const entries = cslItems
      .map((item, index) => {
        const author = item.author?.[0];
        const year = item.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
        const authorName = author?.family || author?.literal || 'Unknown';
        const title = item.title || 'Untitled';

        const isVancouver = normalizeStyleName(styleName) === 'vancouver';
        const prefix = isVancouver ? `${index + 1}. ` : '';
        let entry = `${prefix}${authorName}. (${year}). ${title}.`;

        // Apply Persian localization if needed
        if (lang === 'fa-IR' || lang.startsWith('fa')) {
          entry = localizeToPersian(entry);
        }

        return `<div style="margin-bottom: 1em;">${entry}</div>`;
      })
      .join('');

    return `<div class="csl-bib-body">${entries}</div>`;
  }
};

/**
 * Formats bibliography with per-source localization for mixed language sources
 * This ensures each source is localized according to its own language
 */
function formatBibliographyWithPerSourceLocalization(
  cslItems,
  styleName,
  isVancouver,
  options = {}
) {
  try {
    console.log(
      '📚 [formatBibliographyWithPerSourceLocalization] Processing mixed-language bibliography'
    );

    const entries = cslItems.map((item, index) => {
      try {
        // Determine language for this specific source
        const sourceLang =
          item.language === 'fa-IR' || item.language?.startsWith('fa')
            ? 'fa-IR'
            : 'en-US';
        const isPersian = sourceLang === 'fa-IR';

        // Format this single item with Cite.js
        const cite = new Cite([item]);
        let entry = cite.format('bibliography', {
          format: 'html',
          template: styleName,
          lang: sourceLang,
        });

        // Apply Persian localization if needed
        if (isPersian) {
          entry = localizeToPersian(entry);
        }

        // Add Vancouver numbering if needed
        if (isVancouver) {
          const number = index + 1;
          // Remove any existing numbering from the entry
          entry = entry.replace(/^\s*\d+\.\s*/, '');
          // Add our own numbering
          entry = entry.replace(/(<[^>]*csl-entry[^>]*>)/, `$1${number}. `);
        }

        // Set text direction based on source language
        const direction = isPersian ? 'rtl' : 'ltr';
        const alignment = isPersian ? 'right' : 'left';

        // Wrap entry with appropriate direction
        return `<div style="direction: ${direction}; text-align: ${alignment}; margin-bottom: 0.5em;">${entry}</div>`;
      } catch (itemError) {
        console.error(`❌ Error formatting source ${item.id}:`, itemError);
        // Fallback formatting
        const author = item.author?.[0];
        const year = item.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
        const authorName = author?.family || author?.literal || 'Unknown';
        const title = item.title || 'Untitled';
        const prefix = isVancouver ? `${index + 1}. ` : '';
        return `<div style="margin-bottom: 0.5em;">${prefix}${authorName}. (${year}). ${title}.</div>`;
      }
    });

    const combinedBibliography = entries.join('\n');

    // Wrap in a div with proper styling
    const styleClass = isVancouver ? 'vancouver-bib' : 'csl-bib-body';
    const styling = isVancouver
      ? 'line-height: 1.35; padding-left: 0;'
      : 'line-height: 1.35; padding-left: 2em; text-indent: -2em;';

    return `<div class="${styleClass}" style="${styling}">
  ${combinedBibliography}
</div>`;
  } catch (error) {
    console.error(
      '❌ Error in formatBibliographyWithPerSourceLocalization:',
      error
    );
    // Fallback to simple formatting
    return formatBibliography(cslItems, styleName, 'en-US', options);
  }
}

/**
 * Adds Vancouver-style numbering to bibliography entries
 */
function addVancouverNumbering(bibliography, items, citationOrder) {
  try {
    // Use regex-based approach for server environment (no DOM)
    let counter = 1;

    // Split into lines and process each line
    const lines = bibliography.split('\n');
    const numberedLines = lines.map((line) => {
      // Look for CSL entry divs and add numbering
      if (line.includes('class="csl-entry"')) {
        // Replace content inside csl-entry with numbered content
        const numberedLine = line.replace(
          /(<div[^>]*class="csl-entry"[^>]*>)(.*?)(<\/div>)/i,
          `$1${counter}. $2$3`
        );
        counter++;
        return numberedLine;
      }
      return line;
    });

    return numberedLines.join('\n');
  } catch (error) {
    console.warn('Could not add Vancouver numbering:', error);
    // Fallback: simple regex replacement
    let counter = 1;
    return bibliography.replace(
      /<div[^>]*class="csl-entry"[^>]*>(.*?)<\/div>/gi,
      (match, content) => {
        const numbered = `<div class="csl-entry">${counter}. ${content}</div>`;
        counter++;
        return numbered;
      }
    );
  }
}

/**
 * Normalizes citation style names to match Citation.js templates
 *
 * @param {string} styleName - Input style name
 * @returns {string} Normalized style name
 */
function normalizeStyleName(styleName) {
  if (!styleName) return 'apa';

  const style = styleName.toLowerCase().trim();

  // Map common style variations
  const styleMap = {
    apa: 'apa',
    mla: 'mla',
    chicago: 'chicago-note-bibliography',
    harvard: 'harvard1',
    vancouver: 'vancouver',
    ieee: 'ieee',
    acs: 'american-chemical-society',
    ama: 'american-medical-association',
    asa: 'american-sociological-association',
    apsa: 'american-political-science-association',
  };

  return styleMap[style] || style || 'apa';
}

/**
 * Gets available citation styles
 *
 * @returns {Array<string>} Array of available style names
 */
export function getAvailableStyles() {
  return [
    'apa',
    'mla',
    'chicago-note-bibliography',
    'harvard1',
    'vancouver',
    'ieee',
    'american-chemical-society',
    'american-medical-association',
  ];
}

/**
 * Validates if a style is supported
 *
 * @param {string} styleName - Style name to validate
 * @returns {boolean} True if style is supported
 */
export function isStyleSupported(styleName) {
  const normalized = normalizeStyleName(styleName);
  const available = getAvailableStyles();
  return available.includes(normalized);
}

/**
 * Resets Vancouver citation numbering
 */
export const resetVancouverNumbering = () => {
  vancouverCitationOrder.clear();
  vancouverCounter = 0;
};

/**
 * Gets current Vancouver citation order
 */
export const getVancouverOrder = () => {
  return new Map(vancouverCitationOrder);
};

/**
 * Sets Vancouver citation order manually
 */
export const setVancouverOrder = (orderMap) => {
  vancouverCitationOrder = new Map(orderMap);
  vancouverCounter = Math.max(...orderMap.values(), 0);
};

/**
 * Localizes citation text to Persian
 * @param {string} text - Text to localize
 * @returns {string} Localized text
 */
function localizeToPersian(text) {
  if (!text) return text;

  let localizedText = text;

  // Apply all Persian localizations
  for (const [english, persian] of Object.entries(PERSIAN_LOCALIZATIONS)) {
    // Use word boundaries for exact matches
    const regex = new RegExp(
      `\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'gi'
    );
    localizedText = localizedText.replace(regex, persian);
  }

  // Handle specific patterns
  // Multiple authors: "Author1 & Author2" -> "Author1 و Author2"
  localizedText = localizedText.replace(/\s+&\s+/g, ' و ');

  // Et al variants
  localizedText = localizedText.replace(/,?\s*et\s+al\.?/gi, ' و همکاران');

  // Page ranges: "pp. 123-456" -> "صص. ۱۲۳-۴۵۶"
  localizedText = localizedText.replace(/pp\.\s*(\d+)-(\d+)/gi, 'صص. $1-$2');
  localizedText = localizedText.replace(/p\.\s*(\d+)/gi, 'ص. $1');

  // Volume and issue: "Vol. 5, No. 3" -> "جلد ۵، شماره ۳"
  localizedText = localizedText.replace(
    /Vol\.\s*(\d+),?\s*No\.\s*(\d+)/gi,
    'جلد $1، شماره $2'
  );
  localizedText = localizedText.replace(/Vol\.\s*(\d+)/gi, 'جلد $1');
  localizedText = localizedText.replace(/No\.\s*(\d+)/gi, 'شماره $1');

  // Handle Persian numerals if needed (optional)
  if (shouldConvertToPersianNumerals()) {
    localizedText = convertToPersianNumerals(localizedText);
  }

  return localizedText;
}

/**
 * Converts English numerals to Persian numerals
 * @param {string} text - Text with English numerals
 * @returns {string} Text with Persian numerals
 */
function convertToPersianNumerals(text) {
  const englishToPersian = {
    0: '۰',
    1: '۱',
    2: '۲',
    3: '۳',
    4: '۴',
    5: '۵',
    6: '۶',
    7: '۷',
    8: '۸',
    9: '۹',
  };

  return text.replace(/[0-9]/g, (digit) => englishToPersian[digit] || digit);
}

/**
 * Determines whether to convert numerals to Persian
 * @returns {boolean} Should convert numerals
 */
function shouldConvertToPersianNumerals() {
  // Can be configured based on user preference or document settings
  // For now, return false to keep English numerals for international compatibility
  return false;
}

export default {
  formatCitations,
  formatBibliography,
  getAvailableStyles,
  isStyleSupported,
  resetVancouverNumbering,
  getVancouverOrder,
  setVancouverOrder,
};
