// server/src/utils/citationEngine.js - UPDATED
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';

// -----------------------------------------------------------------
// ✅ [FIX for Req 3]
// Global Vancouver tracking is NO LONGER USED FOR ORDERING.
// We keep it only for resetting.
// The order will be passed from the client via options.orderedSourceIds
// -----------------------------------------------------------------
let vancouverCitationOrder = new Map(); // sourceId -> number
let vancouverCounter = 0;

/**
 * Formats citations with FIXED Vancouver numbering
 */
export const formatCitations = (
  cslItems,
  styleName = 'apa',
  itemIdsToCite = [],
  lang = 'en-US',
  options = {}
) => {
  try {
    if (!cslItems || cslItems.length === 0) {
      throw new Error('No CSL items provided');
    }

    const normalizedStyle = normalizeStyleName(styleName);
    const isVancouver = normalizedStyle === 'vancouver';
    const isPersian = lang === 'fa-IR' || lang.startsWith('fa');

    // ✅ [FIX for Req 3] Use ordered list from client if available
    const orderedSourceIds = options.orderedSourceIds || [];

    // ✅ FIX: Reset numbering ONLY if explicitly requested
    if (isVancouver && options.resetNumbering === true) {
      vancouverCitationOrder.clear();
      vancouverCounter = 0;
      console.log('🔄 Vancouver numbering reset');
    }

    const cite = new Cite(cslItems);
    let inText = '';

    if (itemIdsToCite && itemIdsToCite.length > 0) {
      const itemsToCite = cslItems.filter(
        (item) =>
          itemIdsToCite.includes(item.id) ||
          itemIdsToCite.includes(item.id?.toString())
      );

      if (itemsToCite.length > 0) {
        if (isVancouver) {
          // ✅ [FIX for Req 3] Assign numbers based on DOCUMENT ORDER
          const numbers = itemsToCite.map((item) => {
            const itemId = item.id?.toString();
            let number = orderedSourceIds.indexOf(itemId) + 1;
            if (number === 0) {
              // Fallback if not in ordered list (should not happen in bib update)
              if (!vancouverCitationOrder.has(itemId)) {
                vancouverCounter++;
                vancouverCitationOrder.set(itemId, vancouverCounter);
              }
              number = vancouverCitationOrder.get(itemId);
            }
            return number;
          });

          inText =
            numbers.length === 1 ? `[${numbers[0]}]` : `[${numbers.join(',')}]`;
        } else {
          const citeCitation = new Cite(itemsToCite);
          inText = citeCitation.format('citation', {
            format: 'text',
            template: normalizedStyle,
            lang: lang,
          });

          if (isPersian) {
            inText = localizeToPersian(inText);
          }
        }
      } else {
        console.warn('No matching items found for citation');
        inText = isVancouver ? '[?]' : '(?)';
      }
    } else {
      // This block is likely for single citation formatting
      const firstItem = cslItems[0];
      if (isVancouver) {
        const itemId = firstItem.id?.toString();
        let number = orderedSourceIds.indexOf(itemId) + 1;
        if (number === 0) {
          if (!vancouverCitationOrder.has(itemId)) {
            vancouverCounter++;
            vancouverCitationOrder.set(itemId, vancouverCounter);
          }
          number = vancouverCitationOrder.get(itemId);
        }
        inText = `[${number}]`;
      } else {
        const citeCitation = new Cite([firstItem]);
        inText = citeCitation.format('citation', {
          format: 'text',
          template: normalizedStyle,
          lang: lang,
        });

        if (isPersian) {
          inText = localizeToPersian(inText);
        }
      }
    }

    // We no longer return bibliography from here, this function is for in-text only
    return {
      inText: inText.trim(),
      bibliography: '', // Bibliography generation is a separate call
    };
  } catch (error) {
    console.error('Citation formatting error:', error);

    const fallbackItem = cslItems[0] || {};
    const author = fallbackItem.author?.[0];
    const year = fallbackItem.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
    const authorName = author?.family || author?.literal || 'Unknown';

    const isVancouver = normalizeStyleName(styleName) === 'vancouver';
    return {
      inText: isVancouver ? '[1]' : `(${authorName}, ${year})`,
      bibliography: ``,
    };
  }
};

/**
 * ✅ [FIX for Req 3, 4, 5]
 * Format bibliography based on document order (for Vancouver)
 * or language-split sections (for other styles).
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

    const normalizedStyle = normalizeStyleName(styleName);
    const isVancouver = normalizedStyle === 'vancouver';
    const orderedSourceIds = options.orderedSourceIds || [];

    let sortedItems = cslItems;
    let bibliography = '';

    // ✅ [FIX for Req 3] For Vancouver, ALWAYS sort by document order
    if (isVancouver) {
      sortedItems = [...cslItems].sort((a, b) => {
        const orderA = orderedSourceIds.indexOf(a.id?.toString());
        const orderB = orderedSourceIds.indexOf(b.id?.toString());
        
        // Handle items not in the list (though they shouldn't be)
        const finalOrderA = orderA === -1 ? 999 : orderA;
        const finalOrderB = orderB === -1 ? 999 : orderB;
        
        return finalOrderA - finalOrderB;
      });
      console.log(
        '📚 Vancouver bibliography sorted by document order:',
        sortedItems.map(
          (s) => `${s.id}: [${orderedSourceIds.indexOf(s.id?.toString()) + 1}]`
        )
      );

      // Format Vancouver with per-source localization
      bibliography = formatBibliographyWithPerSourceLocalization(
        sortedItems,
        normalizedStyle,
        isVancouver,
        orderedSourceIds // Pass order for numbering
      );

    } else {
      // ✅ [FIX for Req 4 & 5] For non-Vancouver, split by language
      const persianSources = sortedItems
        .filter(
          (item) =>
            item.language === 'fa-IR' || item.language?.startsWith('fa')
        )
        .sort((a, b) => (a.title || '').localeCompare(b.title || '')); // Sort alphabetically

      const englishSources = sortedItems
        .filter(
          (item) =>
            item.language !== 'fa-IR' && !item.language?.startsWith('fa')
        )
        .sort((a, b) => (a.title || '').localeCompare(b.title || '')); // Sort alphabetically

      let persianBib = '';
      let englishBib = '';

      if (persianSources.length > 0) {
        const cite = new Cite(persianSources);
        persianBib = cite.format('bibliography', {
          format: 'html',
          template: normalizedStyle,
          lang: 'fa-IR',
        });
        persianBib = localizeToPersian(persianBib);
        bibliography += `<h3>الف. منابع فارسی</h3><div class="csl-bib-body" style="direction: rtl; text-align: right; line-height: 1.35; padding-right: 2em; text-indent: -2em;">${persianBib}</div>`;
      }

      if (englishSources.length > 0) {
        const cite = new Cite(englishSources);
        englishBib = cite.format('bibliography', {
          format: 'html',
          template: normalizedStyle,
          lang: 'en-US',
        });
        bibliography += `<h3>ب. منابع انگلیسی</h3><div class="csl-bib-body" style="direction: ltr; text-align: left; line-height: 1.35; padding-left: 2em; text-indent: -2em;">${englishBib}</div>`;
      }
    }

    const styleClass = isVancouver ? 'vancouver-bib' : '';
    // Main wrapper styling
    const styling = isVancouver
      ? 'line-height: 1.35; padding-left: 0;'
      : ''; // Styling is now per-section for non-vancouver

    return `<div class="${styleClass}" style="${styling}">
  ${bibliography}
</div>`;
  } catch (error) {
    console.error('Bibliography formatting error:', error);

    const entries = cslItems
      .map((item, index) => {
        const author = item.author?.[0];
        const year = item.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
        const authorName = author?.family || author?.literal || 'Unknown';
        const title = item.title || 'Untitled';

        const isVancouver = normalizeStyleName(styleName) === 'vancouver';
        const number =
          options.orderedSourceIds?.indexOf(item.id?.toString()) + 1 ||
          index + 1;
        const prefix = isVancouver ? `${number}. ` : '';
        let entry = `${prefix}${authorName}. (${year}). ${title}.`;

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
 * ✅ FIXED: Add numbering based on DOCUMENT ORDER
 */
function addVancouverNumberingFixed(bibliography, sortedItems, orderedSourceIds) {
  try {
    const lines = bibliography.split('\n');
    let itemIndex = 0;

    const numberedLines = lines.map((line) => {
      if (
        line.includes('class="csl-entry"') &&
        itemIndex < sortedItems.length
      ) {
        const item = sortedItems[itemIndex];
        // Get number from the ordered list
        const number = orderedSourceIds.indexOf(item.id?.toString()) + 1;
        
        const validNumber = number > 0 ? number : itemIndex + 1; // Fallback

        const numberedLine = line.replace(
          /(<div[^>]*class="csl-entry"[^>]*>)(.*?)(<\/div>)/i,
          `$1${validNumber}. $2$3`
        );

        itemIndex++;
        return numberedLine;
      }
      return line;
    });

    return numberedLines.join('\n');
  } catch (error) {
    console.warn('Could not add Vancouver numbering:', error);
    return bibliography;
  }
}

/**
 * ✅ [FIX for Req 5]
 * Formats bibliography with per-source localization and direction.
 * Now used ONLY for Vancouver.
 */
function formatBibliographyWithPerSourceLocalization(
  cslItems,
  styleName,
  isVancouver,
  orderedSourceIds // ✅ Pass order list
) {
  try {
    const entries = cslItems.map((item, index) => {
      try {
        const sourceLang =
          item.language === 'fa-IR' || item.language?.startsWith('fa')
            ? 'fa-IR'
            : 'en-US';
        const isPersian = sourceLang === 'fa-IR';

        const cite = new Cite([item]);
        let entry = cite.format('bibliography', {
          format: 'html',
          template: styleName,
          lang: sourceLang,
        });

        if (isPersian) {
          entry = localizeToPersian(entry);
        }

        if (isVancouver) {
          const number = orderedSourceIds.indexOf(item.id?.toString()) + 1;
          const validNumber = number > 0 ? number : index + 1; // Fallback

          entry = entry.replace(/^\s*\d+\.\s*/, ''); // Remove any existing number
          // Add the correct number
          entry = entry.replace(
            /(<div[^>]*class="csl-entry"[^>]*>)/,
            `$1${validNumber}. `
          );
        }

        // ✅ [FIX for Req 5] Set direction and alignment
        const direction = isPersian ? 'rtl' : 'ltr';
        const alignment = isPersian ? 'right' : 'left';

        // Remove the outer div that CSL adds, we add our own
        entry = entry.replace(/<div[^>]*class="csl-entry"[^>]*>/, '');
        entry = entry.replace(/<\/div>\s*$/, '');


        return `<div class="csl-entry" style="direction: ${direction}; text-align: ${alignment}; margin-bottom: 0.5em;">${entry}</div>`;
      } catch (itemError) {
        console.error(`Error formatting source ${item.id}:`, itemError);
        const author = item.author?.[0];
        const year = item.issued?.['date-parts']?.[0]?.[0] || 'n.d.';
        const authorName = author?.family || author?.literal || 'Unknown';
        const title = item.title || 'Untitled';
        const number =
          orderedSourceIds.indexOf(item.id?.toString()) + 1 || index + 1;
        const prefix = isVancouver ? `${number}. ` : '';
        return `<div class="csl-entry" style="margin-bottom: 0.5em;">${prefix}${authorName}. (${year}). ${title}.</div>`;
      }
    });

    return entries.join('\n');
  } catch (error) {
    console.error(
      'Error in formatBibliographyWithPerSourceLocalization:',
      error
    );
    // Fallback
    return cslItems.map((item) => `<div>Error formatting ${item.id}</div>`).join('\n');
  }
}


function normalizeStyleName(styleName) {
  if (!styleName) return 'apa';
  const style = styleName.toLowerCase().trim();
  const styleMap = {
    apa: 'apa',
    mla: 'mla',
    chicago: 'chicago-note-bibliography', // Make sure this is the one you want
    'chicago-author-date': 'chicago-author-date',
    'harvard-cite-them-right': 'harvard-cite-them-right',
    harvard: 'harvard1', // Fallback
    vancouver: 'vancouver',
    ieee: 'ieee',
  };
  return styleMap[style] || style || 'apa';
}

export function getAvailableStyles() {
  return [
    'apa',
    'mla',
    'chicago-author-date',
    'harvard-cite-them-right',
    'vancouver',
    'ieee',
  ];
}

export function isStyleSupported(styleName) {
  const normalized = normalizeStyleName(styleName);
  const available = getAvailableStyles();
  return available.includes(normalized);
}

export const resetVancouverNumbering = () => {
  vancouverCitationOrder.clear();
  vancouverCounter = 0;
  console.log('✅ Vancouver numbering completely reset');
};

export const getVancouverOrder = () => {
  return new Map(vancouverCitationOrder);
};

export const setVancouverOrder = (orderMap) => {
  vancouverCitationOrder = new Map(orderMap);
  vancouverCounter = Math.max(...orderMap.values(), 0);
};

// Persian localization helpers
const PERSIAN_LOCALIZATIONS = {
  and: 'و',
  'et al.': 'و همکاران',
  'et al': 'و همکاران',
  'pp.': 'صص.',
  'p.': 'ص.',
  'vol.': 'جلد',
  'no.': 'شماره',
  'n.d.': 'بی‌تا',
};

function localizeToPersian(text) {
  if (!text) return text;
  let localizedText = text;

  // Regex to avoid replacing parts of words
  for (const [english, persian] of Object.entries(PERSIAN_LOCALIZATIONS)) {
    // Use word boundaries for 'and', 'p.', 'pp.', etc.
    const regex = new RegExp(
      `\\b${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'gi'
    );
    localizedText = localizedText.replace(regex, persian);
  }

  localizedText = localizedText.replace(/\s+&\s+/g, ' و ');
  // Specific fix for et al. which might not have word boundaries
  localizedText = localizedText.replace(/,?\s*et\s+al\.?/gi, ' و همکاران');

  return localizedText;
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