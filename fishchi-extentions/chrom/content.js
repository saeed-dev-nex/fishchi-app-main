// Content Script for Fishchi Extension
// Extracts source information from Iranian academic websites

console.log('Fishchi content script file loaded');

(function () {
  'use strict';

  console.log('Fishchi content script IIFE started');

  // Function to convert author names from "Last, First" format to "First Last" format
  function convertAuthorName(name) {
    if (!name || typeof name !== 'string') return name;

    const trimmedName = name.trim();

    // Check if the name contains a comma (indicating "Last, First" format)
    if (trimmedName.includes('،') || trimmedName.includes(',')) {
      // Split by comma (Persian or English)
      const parts = trimmedName
        .split(/[،,]/)
        .map((part) => part.trim())
        .filter((part) => part);

      if (parts.length < 2) {
        return trimmedName; // Not enough parts to convert
      }

      let lastName = parts[0].trim();
      let firstName = parts[1].trim();

      // If we have additional parts, add them to the appropriate name
      if (parts.length > 2) {
        const additionalParts = parts.slice(2);
        // For comma-separated names, assume additional parts belong to first name
        firstName = firstName + ' ' + additionalParts.join(' ');
      }

      // Return in "First Last" format
      return firstName + ' ' + lastName;
    }

    // If no comma, assume it's in "Last First" format (like SID format)
    // For SID and Noormags, we'll assume the format is "Last First" and convert to "First Last"
    const words = trimmedName.split(' ').filter((word) => word.trim());

    if (words.length >= 2) {
      // Simple approach: assume first word is last name, rest is first name
      const lastName = words[0];
      const firstName = words.slice(1).join(' ');
      return firstName + ' ' + lastName;
    }

    // If only one word, return as is
    return trimmedName;
  }

  // Configuration for different websites
  const SITE_CONFIGS = {
    'sid.ir': {
      name: 'SID',
      selectors: {
        title: 'meta[name="citation_title"], h1.artitle',
        authors: 'meta[name="citation_author"], .sras em a',
        year: 'meta[name="citation_year"], .arjournal',
        journal: 'meta[name="citation_publisher"], .arjournal a',
        volume: 'meta[name="citation_volume"], .arjournal',
        issue: 'meta[name="citation_issue"], .arjournal',
        firstPage: 'meta[name="citation_firstpage"], .srps',
        lastPage: 'meta[name="citation_lastpage"], .srps',
        keywords: 'meta[name="citation_keywords"], .srks .keyword em a',
        abstract: 'meta[property="og:description"], .arabs',
      },
      extractors: {
        title: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to SID
          const domSelectors = [
            'h1.artitle',
            '.artitle',
            'h1',
            '.article-title',
            '.title',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }
          return null;
        },
        authors: (elements) => {
          // Check if elements is a NodeList or array
          if (elements && elements.length > 0) {
            return Array.from(elements)
              .map((el) => ({
                name: convertAuthorName(el.textContent?.trim()),
              }))
              .filter((a) => a.name);
          }

          // Check if single element has content attribute
          if (elements && typeof elements.getAttribute === 'function') {
            const content = elements.getAttribute('content')?.trim();
            if (content) {
              return content
                .split(',')
                .map((name) => ({ name: convertAuthorName(name.trim()) }))
                .filter((a) => a.name);
            }
          }

          // Fallback to DOM selectors specific to SID
          const domSelectors = [
            '.sras em a',
            '.sras em',
            '.author',
            '.authors .author-name',
            '.author-list .author',
          ];
          for (const selector of domSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              return Array.from(elements)
                .map((el) => ({
                  name: convertAuthorName(el.textContent?.trim()),
                }))
                .filter((a) => a.name);
            }
          }

          // Try text patterns
          const pageText = document.body.textContent;
          const authorPatterns = [
            /نویسنده[گان]?\s*:?\s*([^\n\r]+)/i,
            /Author[s]?\s*:?\s*([^\n\r]+)/i,
          ];

          for (const pattern of authorPatterns) {
            const match = pageText.match(pattern);
            if (match && match[1] && typeof match[1] === 'string') {
              const authors = match[1]
                .split(/[،,;؛]/)
                .map((name) => ({ name: convertAuthorName(name.trim()) }))
                .filter((a) => a.name);
              if (authors.length > 0 && authors[0].name) {
                return authors;
              }
            }
          }
          return [];
        },
        year: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const year = element.getAttribute('content')?.trim();
            if (year) return parseInt(year, 10);
          }

          // Fallback to DOM selectors specific to SID
          const domSelectors = [
            '.arjournal',
            '.year',
            '.publication-date',
            '.date',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              const text = el.textContent?.trim();
              const yearMatch = text.match(/\d{4}/);
              if (yearMatch) return parseInt(yearMatch[0], 10);
            }
          }

          // Try text patterns
          const pageText = document.body.textContent;
          const yearPatterns = [
            /سال\s*:?\s*(\d{4})/gi,
            /Year\s*:?\s*(\d{4})/gi,
            /:(\d{4})\s*\|/gi, // Pattern for SID: "1402 | دوره:6 | شماره:18"
          ];

          for (const pattern of yearPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              return parseInt(match[1], 10);
            }
          }
          return null;
        },
        journal: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to SID
          const domSelectors = [
            '.arjournal a',
            '.arjournal',
            '.journal-title',
            '.magazine-title',
            '.journal',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }

          // Try text patterns
          const pageText = document.body.textContent;
          const journalPatterns = [
            /نشریه:\s*([^\n\r]+)/gi,
            /مجله\s*:?\s*([^\n\r]+)/gi,
            /Journal\s*:?\s*([^\n\r]+)/gi,
          ];

          for (const pattern of journalPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              return match[1].trim();
            }
          }
          return null;
        },
        volume: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to SID
          const arjournalElement = document.querySelector('.arjournal');
          if (arjournalElement) {
            const text = arjournalElement.textContent;
            const volumeMatch = text.match(/دوره:\s*(\d+)/);
            if (volumeMatch) {
              return volumeMatch[1];
            }
          }

          return null;
        },
        issue: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to SID
          const arjournalElement = document.querySelector('.arjournal');
          if (arjournalElement) {
            const text = arjournalElement.textContent;
            const issueMatch = text.match(/شماره:\s*(\d+)/);
            if (issueMatch) {
              return issueMatch[1];
            }
          }

          return null;
        },
        pages: (firstPage, lastPage) => {
          // Check if elements are single elements (not NodeList)
          let first = null;
          let last = null;

          if (firstPage && typeof firstPage.getAttribute === 'function') {
            first = firstPage.getAttribute('content')?.trim();
          }

          if (lastPage && typeof lastPage.getAttribute === 'function') {
            last = lastPage.getAttribute('content')?.trim();
          }

          if (first && last) return `${first}-${last}`;

          // Fallback to DOM selectors specific to SID
          const srpsElement = document.querySelector('.srps');
          if (srpsElement) {
            const text = srpsElement.textContent;
            const pageMatch = text.match(
              /صفحه شروع\s*(\d+)\s*\|\s*صفحه پایان\s*(\d+)/
            );
            if (pageMatch) {
              return `${pageMatch[1]}-${pageMatch[2]}`;
            }
          }

          return first || last || null;
        },
        keywords: (elements) => {
          // Check if elements is a NodeList or array
          if (elements && elements.length > 0) {
            return Array.from(elements)
              .map((el) => el.textContent?.trim())
              .filter((t) => t);
          }

          // Check if single element has content attribute
          if (elements && typeof elements.getAttribute === 'function') {
            const content = elements.getAttribute('content')?.trim();
            if (content) {
              return content
                .split('،')
                .map((tag) => tag.trim())
                .filter((t) => t);
            }
          }

          // Fallback to DOM selectors specific to SID
          const domSelectors = [
            '.srks .keyword em a',
            '.srks .keyword em',
            '.srks .keyword',
            '.keywords',
            '.tags',
            '.key-words',
          ];
          for (const selector of domSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              return Array.from(elements)
                .map((el) => el.textContent?.trim())
                .filter((t) => t);
            }
          }
          return [];
        },
        abstract: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to SID
          const domSelectors = [
            '.arabs',
            '.abstract',
            '.summary',
            '.description',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }
          return null;
        },
      },
    },
    'civilica.com': {
      name: 'Civilica',
      selectors: {
        title: 'h1, .article-title, .title',
        authors:
          'meta[name="citation_author"], .author-name, .authors .author, .author, .author-list .author-name, .author-list .author, .article-author, .author-info .name, .doc-author, .author-item, .author-link, .doc-info .doc-author a, .author-section .author-name, .content .author, span[class*="author"], div[class*="author"], a[href*="/author/"], a[href*="/profile/"], .author-link, .author-item, .author-name, .author, .authors, .author-info, .author-list',
        year: '.year, .publication-year, .date, .publication-date, .doc-year, .article-year',
        journal:
          '.journal-name, .conference-name, .conference, .conference-title, .doc-journal, .article-journal, .publication-name',
        abstract:
          '.abstract, .summary, .description, .article-abstract, .doc-abstract, .article-summary, .content-abstract',
        keywords:
          '.keywords, .tags, .key-words, .article-keywords, .doc-keywords, .keyword-list, .tag-list',
      },
      extractors: {
        title: (element) => {
          if (element && element.textContent) {
            return element.textContent.trim();
          }
          return null;
        },
        authors: (elements) => {
          // Check if elements is a NodeList or array
          if (elements && elements.length > 0) {
            return Array.from(elements)
              .map((el) => ({ name: el.textContent?.trim() }))
              .filter((a) => a.name);
          }

          // Check if single element has content attribute
          if (elements && typeof elements.getAttribute === 'function') {
            const content = elements.getAttribute('content')?.trim();
            if (content) {
              return content
                .split(',')
                .map((name) => ({ name: name.trim() }))
                .filter((a) => a.name);
            }
          }

          // Try to extract from meta tags directly
          const authorMeta = document.querySelector(
            'meta[name="citation_author"]'
          );
          if (authorMeta) {
            const content = authorMeta.getAttribute('content')?.trim();
            if (content) {
              const authors = content
                .split(',')
                .map((name) => ({ name: name.trim() }))
                .filter((a) => a.name);
              if (authors.length > 0) {
                return authors;
              }
            }
          }

          // Try structured data extraction
          const structuredData = document.querySelector(
            'script[type="application/ld+json"]'
          );
          if (structuredData) {
            try {
              const data = JSON.parse(structuredData.textContent);
              if (data.author) {
                const authors = Array.isArray(data.author)
                  ? data.author
                  : [data.author];
                const result = authors
                  .map((author) => ({ name: author.trim() }))
                  .filter((a) => a.name);
                if (result.length > 0) {
                  return result;
                }
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }

          // Fallback to DOM selectors specific to Civilica
          const domSelectors = [
            '.author-name',
            '.authors .author',
            '.author',
            '.author-list .author-name',
            '.author-list .author',
            '.article-author',
            '.author-info .name',
            '.doc-author',
            '.author-item',
            '.author-link',
            // Try to find author links in the page
            'a[href*="/author/"]',
            'a[href*="/profile/"]',
            // Look for author patterns in text
            '.author',
            '.authors',
            '.author-info',
            '.author-list',
            // Additional Civilica-specific selectors
            '.doc-info .doc-author a',
            '.author-section .author-name',
            '.content .author',
            'span[class*="author"]',
            'div[class*="author"]',
          ];

          for (const selector of domSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              const authors = Array.from(elements)
                .map((el) => ({ name: el.textContent?.trim() }))
                .filter((a) => a.name && a.name.length > 2);
              if (authors.length > 0) {
                return authors;
              }
            }
          }

          // Try to extract authors from page text patterns
          const pageText = document.body.textContent;
          const authorPatterns = [
            /نویسنده[گان]?\s*:?\s*([^\n\r]+)/i,
            /Author[s]?\s*:?\s*([^\n\r]+)/i,
            /تألیف\s*:?\s*([^\n\r]+)/i,
            /پدیدآورنده[گان]?\s*:?\s*([^\n\r]+)/i,
            /مؤلف[ان]?\s*:?\s*([^\n\r]+)/i,
          ];

          for (const pattern of authorPatterns) {
            const match = pageText.match(pattern);
            if (match && match[1] && typeof match[1] === 'string') {
              const authors = match[1]
                .split(/[،,;؛]/)
                .map((name) => ({ name: name.trim() }))
                .filter((a) => a.name && a.name.length > 2);
              if (authors.length > 0 && authors[0].name) {
                return authors;
              }
            }
          }

          return [];
        },
        year: (element) => {
          if (element && element.textContent) {
            const text = element.textContent.trim();
            const yearMatch = text.match(/\d{4}/);
            if (yearMatch) return parseInt(yearMatch[0], 10);
          }

          // Try to extract year from page text
          const pageText = document.body.textContent;
          const yearPatterns = [
            /سال\s*:?\s*(\d{4})/i,
            /Year\s*:?\s*(\d{4})/i,
            /تاریخ\s*:?\s*(\d{4})/i,
            /(\d{4})\s*میلادی/i,
            /(\d{4})\s*شمسی/i,
            // Look for 4-digit numbers that could be years
            /\b(19\d{2}|20\d{2})\b/,
            // Persian year patterns
            /\b(13\d{2})\b/,
          ];

          for (const pattern of yearPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              const year = parseInt(match[1] || match[0], 10);
              // Validate year range
              if (year >= 1300 && year <= 1500) {
                // Persian year, convert to Gregorian
                return year + 621;
              } else if (year >= 1900 && year <= 2100) {
                return year;
              }
            }
          }
          return null;
        },
        journal: (element) => {
          if (element && element.textContent) {
            const text = element.textContent.trim();
            // Avoid extracting very long text blocks
            if (text && text.length < 200) {
              return text;
            }
          }

          // Try to extract journal from page text with more specific patterns
          const pageText = document.body.textContent;
          const journalPatterns = [
            /مجله\s*:?\s*([^\n\r]{5,100})/i,
            /Journal\s*:?\s*([^\n\r]{5,100})/i,
            /ژورنال\s*:?\s*([^\n\r]{5,100})/i,
            /نشریه\s*:?\s*([^\n\r]{5,100})/i,
            /کنفرانس\s*:?\s*([^\n\r]{5,100})/i,
            /Conference\s*:?\s*([^\n\r]{5,100})/i,
            /سمینار\s*:?\s*([^\n\r]{5,100})/i,
            /همایش\s*:?\s*([^\n\r]{5,100})/i,
          ];

          for (const pattern of journalPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              const journal = match[1].trim();
              // Clean up the journal name
              const cleanJournal = journal
                .replace(/[،,;؛].*$/, '') // Remove everything after comma
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
              if (cleanJournal.length > 3 && cleanJournal.length < 100) {
                return cleanJournal;
              }
            }
          }

          // Try to find journal in meta tags
          const journalMeta = document.querySelector(
            'meta[name="citation_journal_title"]'
          );
          if (journalMeta) {
            const content = journalMeta.getAttribute('content')?.trim();
            if (content && content.length < 200) {
              return content;
            }
          }

          return null;
        },
        abstract: (element) => {
          if (element && element.textContent) {
            const text = element.textContent.trim();
            if (text && text.length > 20) {
              return text.substring(0, 500) + (text.length > 500 ? '...' : '');
            }
          }

          // Try to extract abstract from page text patterns
          const pageText = document.body.textContent;
          const abstractPatterns = [
            /چکیده\s*:?\s*([^\n\r]{50,1000})/i,
            /خلاصه\s*:?\s*([^\n\r]{50,1000})/i,
            /Abstract\s*:?\s*([^\n\r]{50,1000})/i,
            /Summary\s*:?\s*([^\n\r]{50,1000})/i,
            /خلاصه ماشینی\s*:?\s*([^\n\r]{50,1000})/i,
          ];

          for (const pattern of abstractPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              const abstract = match[1].trim();
              if (abstract.length > 20) {
                return (
                  abstract.substring(0, 500) +
                  (abstract.length > 500 ? '...' : '')
                );
              }
            }
          }

          // Try to find abstract in meta tags
          const abstractMeta = document.querySelector(
            'meta[name="description"]'
          );
          if (abstractMeta) {
            const content = abstractMeta.getAttribute('content')?.trim();
            if (content && content.length > 20) {
              return (
                content.substring(0, 500) + (content.length > 500 ? '...' : '')
              );
            }
          }

          return null;
        },
        keywords: (elements) => {
          if (elements && elements.length > 0) {
            return Array.from(elements)
              .map((el) => el.textContent?.trim())
              .filter((t) => t);
          }

          // Try to extract keywords from page text patterns
          const pageText = document.body.textContent;
          const keywordPatterns = [
            /کلمات کلیدی\s*:?\s*([^\n\r]+)/i,
            /Keywords\s*:?\s*([^\n\r]+)/i,
            /کلیدواژه[ها]?\s*:?\s*([^\n\r]+)/i,
            /برچسب[ها]?\s*:?\s*([^\n\r]+)/i,
            /Tags\s*:?\s*([^\n\r]+)/i,
          ];

          for (const pattern of keywordPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              const keywords = match[1]
                .split(/[،,;؛]/)
                .map((tag) => tag.trim())
                .filter((t) => t && t.length > 1);
              if (keywords.length > 0) {
                return keywords;
              }
            }
          }

          // Try to find keywords in meta tags
          const keywordsMeta = document.querySelector('meta[name="keywords"]');
          if (keywordsMeta) {
            const content = keywordsMeta.getAttribute('content')?.trim();
            if (content) {
              return content
                .split(',')
                .map((tag) => tag.trim())
                .filter((t) => t);
            }
          }

          return [];
        },
      },
    },
    'noormags.ir': {
      name: 'Noormags',
      selectors: {
        title:
          'meta[name="citation_title"], h1, .article-title, .title, .article-header h1',
        authors:
          'meta[name="citation_author"], .article-creator span[itemprop="name"], .author, .authors .author-name, .author-list .author, .article-author, .author-name',
        year: 'meta[name="citation_date"], meta[name="citation_publication_date"], .year, .publication-date, .date, .article-date, .publication-year',
        journal:
          'meta[name="citation_journal_title"], .journal-title, .magazine-title, .journal, .article-journal, .magazine-name',
        volume: 'meta[name="citation_volume"], .volume, .magazine-volume',
        issue: 'meta[name="citation_issue"], .issue, .magazine-issue',
        firstPage: 'meta[name="citation_firstpage"], .first-page, .start-page',
        lastPage: 'meta[name="citation_lastpage"], .last-page, .end-page',
        abstract:
          'meta[property="og:description"], meta[name="description"], #abstractfa .p-summary, p[property="description"].p-summary-m, .p-summary-m, .abstract, .summary, .description, .article-abstract, .article-summary, .article-content, .content, .text, .article-text, .main-content, .article-body',
        keywords:
          'meta[name="keywords"], .keyword-item span, .keyword-list-wrapper .keyword-item, .keywords, .tags, .key-words, .article-keywords, .article-tags, .keyword-list',
      },
      extractors: {
        title: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            'h1',
            '.article-title',
            '.title',
            '.article-header h1',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }
          return null;
        },
        authors: (elements) => {
          // Check if elements is a NodeList or array
          if (elements && elements.length > 0) {
            return Array.from(elements)
              .map((el) => ({
                name: convertAuthorName(el.textContent?.trim()),
              }))
              .filter((a) => a.name);
          }

          // Check if single element has content attribute
          if (elements && typeof elements.getAttribute === 'function') {
            const content = elements.getAttribute('content')?.trim();
            if (content) {
              // Handle Noormags format: "احمدحسینی,‌سید‌نصیر"
              const cleanContent = content
                .replace(/&zwnj;/g, '')
                .replace(/&nbsp;/g, ' ');
              return cleanContent
                .split(',')
                .map((name) => ({ name: convertAuthorName(name.trim()) }))
                .filter((a) => a.name);
            }
          }

          // Try to extract from meta tags directly
          const authorMeta = document.querySelector(
            'meta[name="citation_author"]'
          );
          if (authorMeta) {
            const content = authorMeta.getAttribute('content')?.trim();
            if (content) {
              const cleanContent = content
                .replace(/&zwnj;/g, '')
                .replace(/&nbsp;/g, ' ');
              return cleanContent
                .split(',')
                .map((name) => ({ name: convertAuthorName(name.trim()) }))
                .filter((a) => a.name);
            }
          }

          // Try structured data extraction
          const structuredData = document.querySelector(
            'script[type="application/ld+json"]'
          );
          if (structuredData) {
            try {
              const data = JSON.parse(structuredData.textContent);
              if (data.author) {
                const authors = Array.isArray(data.author)
                  ? data.author
                  : [data.author];
                return authors
                  .map((author) => ({ name: convertAuthorName(author.trim()) }))
                  .filter((a) => a.name);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            '.article-creator span[itemprop="name"]',
            '.author',
            '.authors .author-name',
            '.author-list .author',
            '.article-author',
            '.author-name',
          ];
          for (const selector of domSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              return Array.from(elements)
                .map((el) => ({
                  name: convertAuthorName(el.textContent?.trim()),
                }))
                .filter((a) => a.name);
            }
          }

          // Try text patterns
          const pageText = document.body.textContent;
          const authorPatterns = [
            /نویسنده[گان]?\s*:?\s*([^\n\r]+)/i,
            /Author[s]?\s*:?\s*([^\n\r]+)/i,
            /تألیف\s*:?\s*([^\n\r]+)/i,
            /پدیدآورنده[گان]?\s*:?\s*([^\n\r]+)/i,
          ];

          for (const pattern of authorPatterns) {
            const match = pageText.match(pattern);
            if (match && match[1] && typeof match[1] === 'string') {
              const authors = match[1]
                .split(/[،,;؛]/)
                .map((name) => ({ name: convertAuthorName(name.trim()) }))
                .filter((a) => a.name);
              if (authors.length > 0) {
                return authors;
              }
            }
          }
          return [];
        },
        year: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) {
              // Extract year from date format (e.g., "1385/04/01" or "2006/06/22")
              const yearMatch = content.match(/(\d{4})/);
              if (yearMatch) {
                const year = parseInt(yearMatch[1], 10);
                // Convert Persian year to Gregorian if needed
                if (year > 1000 && year < 2000) {
                  return year + 621; // Approximate conversion
                }
                return year;
              }
            }
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            '.year',
            '.publication-date',
            '.date',
            '.article-date',
            '.publication-year',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              const text = el.textContent?.trim();
              const yearMatch = text.match(/\d{4}/);
              if (yearMatch) return parseInt(yearMatch[0], 10);
            }
          }

          // Try text patterns
          const pageText = document.body.textContent;
          const yearPatterns = [
            /سال\s*:?\s*(\d{4})/gi,
            /Year\s*:?\s*(\d{4})/gi,
            /تاریخ\s*:?\s*(\d{4})/gi,
          ];

          for (const pattern of yearPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              return parseInt(match[1], 10);
            }
          }
          return null;
        },
        journal: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            '.journal-title',
            '.magazine-title',
            '.journal',
            '.article-journal',
            '.magazine-name',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }

          // Try text patterns
          const pageText = document.body.textContent;
          const journalPatterns = [
            /مجله\s*:?\s*([^\n\r]+)/gi,
            /Journal\s*:?\s*([^\n\r]+)/gi,
            /ژورنال\s*:?\s*([^\n\r]+)/gi,
          ];

          for (const pattern of journalPatterns) {
            const match = pageText.match(pattern);
            if (match) {
              return match[1].trim();
            }
          }
          return null;
        },
        volume: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = ['.volume', '.magazine-volume'];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }

          return null;
        },
        issue: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = ['.issue', '.magazine-issue'];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              return el.textContent.trim();
            }
          }

          return null;
        },
        pages: (firstPage, lastPage) => {
          // Check if elements are single elements (not NodeList)
          let first = null;
          let last = null;

          if (firstPage && typeof firstPage.getAttribute === 'function') {
            first = firstPage.getAttribute('content')?.trim();
          }

          if (lastPage && typeof lastPage.getAttribute === 'function') {
            last = lastPage.getAttribute('content')?.trim();
          }

          if (first && last) return `${first}-${last}`;

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            '.first-page',
            '.start-page',
            '.last-page',
            '.end-page',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              const text = el.textContent.trim();
              const pageMatch = text.match(/(\d+)/);
              if (pageMatch) {
                if (selector.includes('first') || selector.includes('start')) {
                  first = pageMatch[1];
                } else if (
                  selector.includes('last') ||
                  selector.includes('end')
                ) {
                  last = pageMatch[1];
                }
              }
            }
          }

          return first || last || null;
        },
        abstract: (element) => {
          // Check if element is a single element (not NodeList)
          if (element && typeof element.getAttribute === 'function') {
            const content = element.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Try to extract from meta tags directly
          const abstractMeta = document.querySelector(
            'meta[property="og:description"]'
          );
          if (abstractMeta) {
            const content = abstractMeta.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Try description meta tag
          const descMeta = document.querySelector('meta[name="description"]');
          if (descMeta) {
            const content = descMeta.getAttribute('content')?.trim();
            if (content) return content;
          }

          // Try structured data extraction
          const structuredData = document.querySelector(
            'script[type="application/ld+json"]'
          );
          if (structuredData) {
            try {
              const data = JSON.parse(structuredData.textContent);
              if (data.description) {
                return (
                  data.description.substring(0, 500) +
                  (data.description.length > 500 ? '...' : '')
                );
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }

          // Try to extract from specific Noormags structure - چکیده فارسی
          const abstractSelectors = [
            '#abstractfa',
            '.p-summary',
            '.abstract',
            '.article-abstract',
            '.tab-pane .panel-body .p-summary',
            '.tab-content .p-summary',
          ];

          for (const selector of abstractSelectors) {
            const abstractElement = document.querySelector(selector);
            if (abstractElement) {
              // Look for all paragraphs inside the element
              const paragraphs = abstractElement.querySelectorAll('p');
              for (const paragraph of paragraphs) {
                const text = paragraph.textContent.trim();
                // Skip paragraphs that contain "چکیده:" or are too short
                if (text && text.length > 50 && !text.includes('چکیده:')) {
                  return (
                    text.substring(0, 500) + (text.length > 500 ? '...' : '')
                  );
                }
              }

              // If no suitable paragraph found, try to get text from the element itself
              const text = abstractElement.textContent.trim();
              if (text && text.length > 20) {
                // Remove "چکیده:" prefix if present and get the actual content
                const cleanText = text.replace(/^چکیده\s*:?\s*/g, '').trim();
                if (cleanText.length > 20) {
                  return (
                    cleanText.substring(0, 500) +
                    (cleanText.length > 500 ? '...' : '')
                  );
                }
              }
            }
          }

          // Try to find abstract by looking for text patterns in the page
          const pageTextForAbstract = document.body.textContent;
          const abstractPatternsForSearch = [
            /چکیده\s*:?\s*([^\n\r]{50,1000})/gi,
            /خلاصه\s*:?\s*([^\n\r]{50,500})/gi,
            /Abstract\s*:?\s*([^\n\r]{50,500})/gi,
          ];

          for (const pattern of abstractPatternsForSearch) {
            const match = pageTextForAbstract.match(pattern);
            if (match) {
              const abstract = match[1].trim();
              if (abstract.length > 20) {
                return (
                  abstract.substring(0, 500) +
                  (abstract.length > 500 ? '...' : '')
                );
              }
            }
          }

          // Try to extract from خلاصه ماشینی
          const summaryElement = document.querySelector(
            'p[property="description"].p-summary-m'
          );
          if (summaryElement) {
            const text = summaryElement.textContent.trim();
            if (text && text.length > 20) {
              // Remove "خلاصه ماشینی:" prefix if present
              const cleanText = text
                .replace(/^خلاصه ماشینی\s*:?\s*/g, '')
                .trim();
              return (
                cleanText.substring(0, 500) +
                (cleanText.length > 500 ? '...' : '')
              );
            }
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            '.p-summary-m',
            '.abstract',
            '.summary',
            '.description',
            '.article-abstract',
            '.article-summary',
            '.article-content',
            '.content',
            '.text',
            '.article-text',
            '.main-content',
            '.article-body',
          ];
          for (const selector of domSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              const text = el.textContent.trim();
              // Take first paragraph or limit length
              const paragraphs = text
                .split('\n')
                .filter((p) => p.trim().length > 20);
              if (paragraphs.length > 0) {
                return (
                  paragraphs[0].substring(0, 500) +
                  (paragraphs[0].length > 500 ? '...' : '')
                );
              }
            }
          }

          // Try to extract from page text patterns
          const pageTextForFallback = document.body.textContent;
          const abstractPatternsForFallback = [
            /خلاصه ماشینی\s*:?\s*([^\n\r]{50,1000})/gi,
            /چکیده\s*:?\s*([^\n\r]{50,500})/gi,
            /خلاصه\s*:?\s*([^\n\r]{50,500})/gi,
            /Abstract\s*:?\s*([^\n\r]{50,500})/gi,
            /Summary\s*:?\s*([^\n\r]{50,500})/gi,
          ];

          for (const pattern of abstractPatternsForFallback) {
            const match = pageTextForFallback.match(pattern);
            if (match) {
              const abstract = match[1].trim();
              if (abstract.length > 20) {
                return (
                  abstract.substring(0, 500) +
                  (abstract.length > 500 ? '...' : '')
                );
              }
            }
          }

          return null;
        },
        keywords: (elements) => {
          // Check if elements is a NodeList or array
          if (elements && elements.length > 0) {
            return Array.from(elements)
              .map((el) => el.textContent?.trim())
              .filter((t) => t);
          }

          // Check if single element has content attribute
          if (elements && typeof elements.getAttribute === 'function') {
            const content = elements.getAttribute('content')?.trim();
            if (content) {
              return content
                .split(',')
                .map((tag) => tag.trim())
                .filter((t) => t);
            }
          }

          // Try to extract from meta tags directly
          const keywordsMeta = document.querySelector('meta[name="keywords"]');
          if (keywordsMeta) {
            const content = keywordsMeta.getAttribute('content')?.trim();
            if (content) {
              return content
                .split(',')
                .map((tag) => tag.trim())
                .filter((t) => t);
            }
          }

          // Try structured data extraction
          const structuredData = document.querySelector(
            'script[type="application/ld+json"]'
          );
          if (structuredData) {
            try {
              const data = JSON.parse(structuredData.textContent);
              if (data.keywords) {
                return data.keywords
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter((t) => t);
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }

          // Try to extract from specific Noormags keyword structure
          const keywordElements =
            document.querySelectorAll('.keyword-item span');
          if (keywordElements.length > 0) {
            const keywords = Array.from(keywordElements)
              .map((el) => el.textContent?.trim())
              .filter((t) => t);
            // Remove duplicates
            return [...new Set(keywords)];
          }

          // Try to extract from keyword list wrapper
          const keywordListWrapper = document.querySelector(
            '.keyword-list-wrapper'
          );
          if (keywordListWrapper) {
            const keywordItems =
              keywordListWrapper.querySelectorAll('.keyword-item');
            if (keywordItems.length > 0) {
              const keywords = Array.from(keywordItems)
                .map((el) => el.textContent?.trim())
                .filter((t) => t);
              // Remove duplicates
              return [...new Set(keywords)];
            }
          }

          // Fallback to DOM selectors specific to Noormags
          const domSelectors = [
            '.keywords',
            '.tags',
            '.key-words',
            '.article-keywords',
            '.article-tags',
            '.keyword-list',
          ];
          for (const selector of domSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              return Array.from(elements)
                .map((el) => el.textContent?.trim())
                .filter((t) => t);
            }
          }

          return [];
        },
      },
    },
  };

  // Get current site configuration
  function getCurrentSiteConfig() {
    const hostname = window.location.hostname.toLowerCase();

    for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
      if (hostname.includes(domain)) {
        return { domain, ...config };
      }
    }

    return null;
  }

  // Check if page requires login or has restricted content
  function isRestrictedPage() {
    const restrictedIndicators = [
      'برای مشاهده متن مقاله',
      'لازم است وارد پایگاه شوید',
      'You need Sign in to view',
      'برای مشاهده صفحات بیشتر',
      'حساب خود را شارژ نمایید',
    ];

    const pageText = document.body.textContent;
    return restrictedIndicators.some((indicator) =>
      pageText.includes(indicator)
    );
  }

  // Extract source information from current page
  function extractSourceInfo() {
    const siteConfig = getCurrentSiteConfig();
    if (!siteConfig) {
      return null;
    }

    // Check if page is restricted
    if (isRestrictedPage()) {
      console.log(
        'Page appears to be restricted, attempting limited extraction'
      );
    }

    const sourceInfo = {
      title: null,
      authors: [],
      year: null,
      type: 'article',
      publicationDetails: {
        journal: null,
        publisher: null,
        volume: null,
        issue: null,
        pages: null,
      },
      identifiers: {
        url: window.location.href,
      },
      abstract: null,
      tags: [],
    };

    try {
      // Extract title
      if (siteConfig.selectors.title) {
        const titleElement = document.querySelector(siteConfig.selectors.title);
        sourceInfo.title = siteConfig.extractors.title(titleElement);
      }

      // Extract authors
      if (siteConfig.selectors.authors) {
        const authorElements = document.querySelectorAll(
          siteConfig.selectors.authors
        );
        sourceInfo.authors = siteConfig.extractors.authors(authorElements);
      }

      // Extract year
      if (siteConfig.selectors.year) {
        const yearElement = document.querySelector(siteConfig.selectors.year);
        sourceInfo.year = siteConfig.extractors.year(yearElement);
      }

      // Extract journal
      if (siteConfig.selectors.journal) {
        const journalElement = document.querySelector(
          siteConfig.selectors.journal
        );
        sourceInfo.publicationDetails.journal =
          siteConfig.extractors.journal(journalElement);
      }

      // Extract volume
      if (siteConfig.selectors.volume) {
        const volumeElement = document.querySelector(
          siteConfig.selectors.volume
        );
        sourceInfo.publicationDetails.volume =
          siteConfig.extractors.volume(volumeElement);
      }

      // Extract issue
      if (siteConfig.selectors.issue) {
        const issueElement = document.querySelector(siteConfig.selectors.issue);
        sourceInfo.publicationDetails.issue =
          siteConfig.extractors.issue(issueElement);
      }

      // Extract pages
      if (siteConfig.selectors.firstPage && siteConfig.selectors.lastPage) {
        const firstPageElement = document.querySelector(
          siteConfig.selectors.firstPage
        );
        const lastPageElement = document.querySelector(
          siteConfig.selectors.lastPage
        );
        sourceInfo.publicationDetails.pages = siteConfig.extractors.pages(
          firstPageElement,
          lastPageElement
        );
      }

      // Extract abstract
      if (siteConfig.selectors.abstract) {
        const abstractElement = document.querySelector(
          siteConfig.selectors.abstract
        );
        sourceInfo.abstract = siteConfig.extractors.abstract(abstractElement);

        // If abstract is null and page is restricted, try to extract from title or meta description
        if (!sourceInfo.abstract && isRestrictedPage()) {
          // Try to get description from meta tags
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            const desc = metaDesc.getAttribute('content')?.trim();
            if (desc && desc.length > 20) {
              sourceInfo.abstract =
                desc.substring(0, 500) + (desc.length > 500 ? '...' : '');
            }
          }

          // If still no abstract, try to extract from title
          if (!sourceInfo.abstract && sourceInfo.title) {
            sourceInfo.abstract = `مقاله: ${sourceInfo.title}`;
          }
        }
      }

      // Extract keywords/tags
      if (siteConfig.selectors.keywords) {
        const keywordElements = document.querySelectorAll(
          siteConfig.selectors.keywords
        );
        sourceInfo.tags = siteConfig.extractors.keywords(keywordElements);
      }

      // Clean up data
      sourceInfo.title = sourceInfo.title || 'عنوان یافت نشد';
      sourceInfo.authors =
        sourceInfo.authors.length > 0
          ? sourceInfo.authors
          : [{ name: 'نویسنده نامشخص' }];

      return sourceInfo;
    } catch (error) {
      console.error('Error extracting source info:', error);
      return null;
    }
  }

  // Add floating action button
  function addFloatingButton() {
    // Remove existing button if any
    const existingButton = document.getElementById('fishchi-extract-btn');
    if (existingButton) {
      existingButton.remove();
    }

    const button = document.createElement('div');
    button.id = 'fishchi-extract-btn';
    button.innerHTML = `
            <div class="fishchi-btn-content">
                <img src="${chrome.runtime.getURL(
                  'images/icon16.png'
                )}" alt="فیشچی" class="fishchi-btn-icon">
                <span class="fishchi-btn-text">استخراج منبع</span>
            </div>
        `;

    button.addEventListener('click', () => {
      const sourceInfo = extractSourceInfo();
      if (sourceInfo) {
        // Send message to background script
        chrome.runtime.sendMessage({
          action: 'extractSource',
          sourceInfo: sourceInfo,
          url: window.location.href,
        });
      } else {
        alert('خطا در استخراج اطلاعات منبع');
      }
    });

    document.body.appendChild(button);
  }

  // Initialize content script
  function init() {
    console.log('Fishchi content script initialized on:', window.location.href);
    console.log('Document ready state:', document.readyState);
    console.log('Current site config:', getCurrentSiteConfig());
    console.log(
      'Chrome runtime available:',
      typeof chrome !== 'undefined' && chrome.runtime
    );
    console.log(
      'Chrome runtime onMessage available:',
      typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.onMessage
    );

    // Check if chrome.runtime is available
    if (
      typeof chrome === 'undefined' ||
      !chrome.runtime ||
      !chrome.runtime.onMessage
    ) {
      console.error('Chrome runtime or onMessage not available');
      return;
    }

    // Set up message listener immediately
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Content script received message:', request);

      try {
        if (request.action === 'getSourceInfo') {
          const sourceInfo = extractSourceInfo();
          console.log('Extracted source info:', sourceInfo);
          sendResponse({ success: true, sourceInfo });
        } else if (request.action === 'refreshSourceInfo') {
          const sourceInfo = extractSourceInfo();
          console.log('Refreshed source info:', sourceInfo);
          sendResponse({ success: true, sourceInfo });
        } else {
          sendResponse({ success: false, message: 'Unknown action' });
        }
      } catch (error) {
        console.error('Content script error:', error);
        sendResponse({ success: false, message: error.message });
      }

      return true; // Keep message channel open for async response
    });

    console.log('Message listener set up successfully');

    // Wait for page to load
    if (document.readyState === 'loading') {
      console.log('Document still loading, waiting for DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired, adding button');
        addFloatingButton();
      });
    } else {
      console.log('Document already loaded, adding button immediately');
      addFloatingButton();
    }
  }

  // Test function to verify content script is working
  function testContentScript() {
    console.log('Content script test function called');
    return {
      success: true,
      message: 'Content script is working',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      chromeRuntime: typeof chrome !== 'undefined' && chrome.runtime,
      chromeOnMessage:
        typeof chrome !== 'undefined' &&
        chrome.runtime &&
        chrome.runtime.onMessage,
      documentReady: document.readyState,
      buttonExists: !!document.getElementById('fishchi-extract-btn'),
    };
  }

  // Make test function available globally for debugging
  window.fishchiTest = testContentScript;

  // Start the content script with error handling
  try {
    console.log('Starting Fishchi content script...');
    init();
    console.log('Fishchi content script started successfully');
  } catch (error) {
    console.error('Error starting Fishchi content script:', error);
    console.error('Error stack:', error.stack);
  }

  console.log('Fishchi content script IIFE completed');
})();

console.log('Fishchi content script file execution completed');
