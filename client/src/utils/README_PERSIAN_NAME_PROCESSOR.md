# راهنمای استفاده از Persian Name Processor

## 📖 مقدمه

این utility برای parse کردن صحیح نام‌های نویسندگان فارسی و انگلیسی از citation های علمی طراحی شده است.

## 🚀 استفاده سریع

### Import

```typescript
import { parseAuthors, formatAuthors } from '@/utils/persianNameProcessor';
```

### مثال 1: Parse کردن نام‌های فارسی

```typescript
const persianCitation = "ربیعی، لیلا، یوسفی خواه، سارا";
const authors = parseAuthors(persianCitation);

console.log(authors);
// Output:
// [
//   { firstname: "لیلا", lastname: "ربیعی" },
//   { firstname: "سارا", lastname: "یوسفی خواه" }
// ]

console.log(formatAuthors(authors));
// Output: "لیلا ربیعی, سارا یوسفی خواه"
```

### مثال 2: Parse کردن نام‌های انگلیسی

```typescript
const englishCitation = "Smith, John, Johnson, Mary";
const authors = parseAuthors(englishCitation);

console.log(authors);
// Output:
// [
//   { firstname: "John", lastname: "Smith" },
//   { firstname: "Mary", lastname: "Johnson" }
// ]
```

### مثال 3: استفاده در Form Submit

```typescript
// در AddSourceModal.tsx
const onManualSubmit = async (data) => {
  const processedData = {
    title: data.title,
    authors: data.authors ? parseAuthors(data.authors) : [],
    // ... سایر فیلدها
  };
  
  await dispatch(createSource(processedData));
};
```

## 📚 API Reference

### `parseAuthors(authorText: string): Author[]`

استخراج نام‌های نویسندگان از متن.

**Parameters:**
- `authorText`: رشته حاوی نام نویسندگان

**Returns:**
- Array از objects با ساختار `{ firstname: string, lastname: string }`

**مثال:**
```typescript
parseAuthors("ربیعی، لیلا، گرزین، سارا")
// => [
//   { firstname: "لیلا", lastname: "ربیعی" },
//   { firstname: "سارا", lastname: "گرزین" }
// ]
```

---

### `formatAuthors(authors: Author[]): string`

فرمت کردن نام‌ها برای نمایش.

**Parameters:**
- `authors`: Array از Author objects

**Returns:**
- رشته فرمت شده: `"نام نام‌خانوادگی, نام نام‌خانوادگی"`

**مثال:**
```typescript
const authors = [
  { firstname: "لیلا", lastname: "ربیعی" },
  { firstname: "سارا", lastname: "گرزین" }
];

formatAuthors(authors)
// => "لیلا ربیعی, سارا گرزین"
```

---

### `formatAuthorsForCitation(authors: Author[]): string`

فرمت کردن نام‌ها به فرمت citation.

**Parameters:**
- `authors`: Array از Author objects

**Returns:**
- رشته فرمت شده به صورت citation

**مثال:**
```typescript
const authors = [
  { firstname: "لیلا", lastname: "ربیعی" }
];

formatAuthorsForCitation(authors)
// فارسی => "ربیعی، لیلا"
// انگلیسی => "John Smith"
```

---

### `splitAuthorString(authorText: string): string[]`

جداسازی رشته نویسندگان به parts.

**Parameters:**
- `authorText`: رشته حاوی نام نویسندگان

**Returns:**
- Array از strings

---

### `isValidAuthor(author: Author): boolean`

بررسی معتبر بودن یک Author object.

**Parameters:**
- `author`: Author object

**Returns:**
- `true` اگر معتبر باشد، در غیر این صورت `false`

## 🎯 فرمت‌های پشتیبانی شده

### فارسی
- ✅ `"نام خانوادگی، نام"`
- ✅ `"نام خانوادگی، نام، نام خانوادگی، نام"`
- ✅ نام‌های چند کلمه‌ای: `"یوسفی خواه، سارا"`
- ✅ استفاده از "و": `"ربیعی، لیلا و گرزین، سارا"`

### انگلیسی
- ✅ APA: `"Lastname, F."`
- ✅ MLA: `"Lastname, Firstname"`
- ✅ Chicago: `"Lastname, Firstname"`
- ✅ Vancouver: `"Lastname F"`

## ⚠️ نکات مهم

### 1. فرمت ورودی
- **فارسی:** حتماً از کاما فارسی (،) استفاده کنید
- **انگلیسی:** از کاما انگلیسی (,) استفاده کنید

### 2. جداکننده‌ها
جداکننده‌های پشتیبانی شده:
- کاما: `,` یا `،`
- Pipe: `|`
- Semicolon: `;`
- Ampersand: `&`
- کلمه "و" در فارسی

### 3. نام‌های چند کلمه‌ای
✅ **درست:**
```typescript
parseAuthors("یوسفی خواه، سارا")
// => { firstname: "سارا", lastname: "یوسفی خواه" }
```

❌ **نادرست:**
```typescript
parseAuthors("یوسفی,خواه,سارا")
// نتیجه نادرست
```

## 🐛 عیب‌یابی

### مشکل: نام‌ها به درستی parse نمی‌شوند

**راه‌حل:**
1. فرمت citation را بررسی کنید
2. مطمئن شوید که کاما فارسی (،) استفاده شده
3. از فرمت `"نام خانوادگی، نام"` پیروی کنید

### مشکل: برخی نام‌ها skip می‌شوند

**راه‌حل:**
کلمات رایج (و، در، به، ...) به عنوان نام شناسایی نمی‌شوند.

## 📝 مثال‌های واقعی

### مثال کامل: Citation Parser در Modal

```typescript
// در AddSourceModal.tsx

const handleParseCitation = async () => {
  const response = await fetch('/api/v1/sources/parse-citation', {
    method: 'POST',
    body: JSON.stringify({ citation: citationText }),
  });

  const result = await response.json();
  const parsedData = result.data;

  // استفاده از formatAuthors برای نمایش در form
  setValue(
    'authors',
    parsedData.authors && parsedData.authors.length > 0
      ? formatAuthors(parsedData.authors)
      : ''
  );
};

const onManualSubmit = async (data) => {
  const processedData = {
    // استفاده از parseAuthors برای تبدیل به format صحیح
    authors: data.authors ? parseAuthors(data.authors) : [],
  };
  
  await dispatch(createSource(processedData));
};
```

## 🧪 تست

```typescript
import { testPersianNameProcessor } from '@/utils/persianNameProcessor';

// اجرای تست‌ها
testPersianNameProcessor();
```

## 🔗 منابع مرتبط

- [Citation Parser Backend](../../../server/src/utils/citationParser.js)
- [مستندات کامل](../../../CITATION_PARSER_IMPROVEMENTS.md)
- [تست فایل](../../../server/src/utils/citationParser.test.js)
