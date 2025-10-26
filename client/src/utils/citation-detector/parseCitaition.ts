interface Author {
  lastName: string;
  firstName?: string;
}

interface CitationParts {
  language: 'FA' | 'EN';
  style: 'APA' | 'Chicago' | 'Vancouver' | 'Harvard' | 'Unknown';
  authors?: Author[];
  year?: string;
  date?: string;
  title?: string;
  journalOrBook?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  place?: string;
  publisher?: string;
  url?: string;
  doi?: string;
  isbn?: string;
}

// --- ماژول نویسندگان فارسی ---
function splitAuthorsFA(raw: string): Author[] {
  const suffixes = [
    'زاده',
    'پور',
    'نیا',
    'یان',
    'لو',
    'چی',
    'بیگی',
    'خواه',
    'گر',
    'کار',
    'فر',
    'آذر',
    'آزاد',
  ];

  // تقسیم نویسندگان با جداکننده‌های رایج
  const candidates = raw
    .split(/،| و |؛/)
    .map((p) => p.trim())
    .filter(Boolean);

  return candidates.map((name) => {
    // اگر فرمت "نام خانوادگی، نام" باشد
    if (name.includes('،')) {
      const [last, first] = name.split('،').map((p) => p.trim());
      return { lastName: last, firstName: first };
    }

    const parts = name.split(' ').filter(Boolean);

    // بررسی پسوندهای ترکیبی
    for (let i = 1; i < parts.length; i++) {
      if (suffixes.includes(parts[i])) {
        return {
          lastName: parts[i - 1] + parts[i],
          firstName: parts.slice(i + 1).join(' ') || undefined,
        };
      }
    }

    // حالت عادی
    return {
      lastName: parts[0],
      firstName: parts.slice(1).join(' ') || undefined,
    };
  });
}

// --- ماژول نویسندگان انگلیسی ساده ---
function splitAuthorsEN(raw: string): Author[] {
  const list = raw.replace(/\s+and\s+/gi, ';').split(/[;,]/);
  return list
    .map((a) => {
      const parts = a.trim().split(' ');
      return { lastName: parts.pop() || '', firstName: parts.join(' ') };
    })
    .filter((a) => a.lastName.length > 0);
}

// --- استخراج بخش نویسندگان ---
function extractAuthorsSegment(s: string): string | undefined {
  const m = s.match(/^(.+?)\s*\.\s*\(/); // Authors. (Year)
  if (m) return m[1];
  const h = s.match(/^(.+?)\s*,\s*\d{4}/); // Authors, Year
  if (h) return h[1];
  return undefined;
}

enum Style {
  APA = 'APA',
  Chicago = 'Chicago',
  Vancouver = 'Vancouver',
  Harvard = 'Harvard',
  Unknown = 'Unknown',
}

function detectCitationStyleScored(s: string): Style {
  let scores: Record<Style, number> = {
    APA: 0,
    Harvard: 0,
    Vancouver: 0,
    Chicago: 0,
    Unknown: 0,
  };

  // APA
  if (/\(\d{4}(-\d{1,2}-\d{1,2})?\)/.test(s)) scores.APA += 2;
  if (/^[^,]+?\.\s*\(\d{4}/.test(s)) scores.APA += 2;
  if (/\d+\(\d+\),\s*\d+(-\d+)?/.test(s)) scores.APA += 1;

  // Harvard
  if (/,\s*(\d{4}|13\d{2}|14\d{2})/.test(s) && !/\(\d{4}\)/.test(s))
    scores.Harvard += 2;
  if (/\bpp?\.\s*\d+(-\d+)?|\bص\.?\s*\d+(-\d+)?/.test(s)) scores.Harvard += 1;

  // Vancouver
  if (/^\s*(\[\d+\]|\d+\.)\s/.test(s)) scores.Vancouver += 3;
  if (/;\s*\d+\(\d+\):\d+(-\d+)?/.test(s)) scores.Vancouver += 2;

  // Chicago
  if (/".+?"/.test(s)) scores.Chicago += 2;
  if (/[A-Za-zآ-ی\s]+:\s*[A-Za-zآ-ی\s]+,\s*(\d{4}|13\d{2}|14\d{2})/.test(s))
    scores.Chicago += 2;

  // انتخاب بیشترین امتیاز
  let best = 'Unknown';
  let maxScore = 0;
  for (let k in scores) {
    if (scores[k as Style] > maxScore) {
      maxScore = scores[k as Style];
      best = k as Style;
    }
  }
  return best as Style;
}

// --- الگوریتم اصلی ---
export function parseCitation(raw: string): CitationParts {
  const s = raw.trim();
  const language: 'FA' | 'EN' = /[\u0600-\u06FF]/.test(s) ? 'FA' : 'EN';
  const style = detectCitationStyleScored(s);
  const parts: CitationParts = { language, style }; // ساده‌سازی برای نمونه

  const authorsSeg = extractAuthorsSegment(s);
  if (authorsSeg) {
    parts.authors =
      language === 'FA'
        ? splitAuthorsFA(authorsSeg)
        : splitAuthorsEN(authorsSeg);
  }

  // سال
  const year = s.match(/(1[89]\d{2}|20\d{2}|13\d{2}|14\d{2})/);
  if (year) parts.year = year[1];

  // عنوان
  const afterYear = s.match(/\)\.\s*([^\.]+)\./);
  if (afterYear) parts.title = afterYear[1].trim();

  // نشریه
  const journal = s.match(/\. ([آ-یA-Za-z\s]+)،?\s*\d+\(/);
  if (journal) parts.journalOrBook = journal[1].trim();

  // جلد و شماره
  const vip = s.match(/(\d+)\s*\(\s*(\d+)\s*\)/);
  if (vip) {
    parts.volume = vip[1];
    parts.issue = vip[2];
  }

  // صفحات
  const pages = s.match(/(\d+-\d+)/);
  if (pages) parts.pages = pages[1];

  // ناشر
  const publisher = s.match(/\b(SID|انتشارات\s?[آ-ی]+)\b/);
  if (publisher) parts.publisher = publisher[1];

  // URL
  const url = s.match(/https?:\/\/\S+/);
  if (url) parts.url = url[0];

  return parts;
}

// --- تست ---
const sample =
  'نبی زاده، امیرحسین. (1401). هوش مصنوعی در حوزه سلامت. انفورماتیک سلامت و زیست پزشکی، 9(3 )، 193-195. SID. https://sid.ir/paper/1135836/fa';

console.log(parseCitation(sample));
