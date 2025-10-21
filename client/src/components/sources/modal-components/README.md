# AddSourceModal Components

این پوشه شامل کامپوننت‌های کوچک و مدولار برای `AddSourceModal` است که برای بهبود قابلیت نگهداری و خوانایی کد ایجاد شده‌اند.

## 📁 ساختار کامپوننت‌ها

### 1. **types.ts**

تایپ‌های مشترک TypeScript برای تمام کامپوننت‌ها:

- `ManualFormInputs` - تایپ فرم ورود دستی
- `DoiFormInputs` - تایپ فرم DOI

### 2. **BasicSourceFields.tsx**

فیلدهای اصلی و ضروری منبع:

- عنوان منبع
- نویسندگان
- سال انتشار
- نوع منبع (مقاله، کتاب، etc.)
- زبان منبع

**Props:**

```typescript
interface BasicSourceFieldsProps {
  register: UseFormRegister<ManualFormInputs>;
  error?: string;
}
```

### 3. **AdvancedSourceFields.tsx**

فیلدهای تکمیلی و اختیاری منبع:

- چکیده
- نام ژورنال/مجله
- ناشر
- جلد، شماره، صفحات
- DOI، ISBN، URL
- برچسب‌ها با قابلیت پیشنهاد خودکار AI

**Props:**

```typescript
interface AdvancedSourceFieldsProps {
  register: UseFormRegister<ManualFormInputs>;
  setValue: UseFormSetValue<ManualFormInputs>;
  watch: UseFormWatch<ManualFormInputs>;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInputValue: string;
  setTagInputValue: (value: string) => void;
  onSuggestTags: () => void;
  isSuggestingTags: boolean;
  tagSuggestionError: string | null;
}
```

### 4. **ManualSourceForm.tsx**

کامپوننت اصلی فرم دستی که `BasicSourceFields` و `AdvancedSourceFields` را ترکیب می‌کند.

**Props:**

```typescript
interface ManualSourceFormProps {
  register: UseFormRegister<ManualFormInputs>;
  setValue: UseFormSetValue<ManualFormInputs>;
  watch: UseFormWatch<ManualFormInputs>;
  error?: string;
  showAdvancedFields: boolean;
  onToggleAdvancedFields: () => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInputValue: string;
  setTagInputValue: (value: string) => void;
  onSuggestTags: () => void;
  isSuggestingTags: boolean;
  tagSuggestionError: string | null;
}
```

### 5. **DoiSourceForm.tsx**

فرم ساده برای وارد کردن منبع با DOI.

**Props:**

```typescript
interface DoiSourceFormProps {
  register: UseFormRegister<DoiFormInputs>;
}
```

### 6. **ParseCitationForm.tsx**

فرم برای استخراج اطلاعات از متن citation.

**Props:**

```typescript
interface ParseCitationFormProps {
  citationText: string;
  onCitationTextChange: (text: string) => void;
  onParseCitation: () => void;
  isLoading: boolean;
}
```

### 7. **LibrarySourceForm.tsx**

فرم برای انتخاب منابع از کتابخانه شخصی کاربر.

**Props:**

```typescript
interface LibrarySourceFormProps {
  librarySources: ISource[];
  availableLibrarySources: ISource[];
  selectedLibrary: string[];
  onLibrarySourceChange: (
    event: React.SyntheticEvent,
    newValue: ISource[]
  ) => void;
  isLoading: boolean;
}
```

### 8. **SourceModalTabs.tsx**

کامپوننت Tabs برای سوئیچ بین حالت‌های مختلف ورود منبع.

**Props:**

```typescript
interface SourceModalTabsProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  hasProjectId: boolean;
}
```

### 9. **index.ts**

فایل export مرکزی برای تمام کامپوننت‌ها و تایپ‌ها.

## 🎯 مزایای Refactoring

### 1. **Separation of Concerns**

هر کامپوننت یک مسئولیت خاص دارد:

- فیلدهای پایه جدا از فیلدهای پیشرفته
- هر تب در کامپوننت جداگانه
- Logic و UI جدا شده‌اند

### 2. **قابلیت استفاده مجدد**

کامپوننت‌ها می‌توانند در جاهای دیگر استفاده شوند:

```typescript
import { BasicSourceFields } from './modal-components';
```

### 3. **تست‌پذیری**

هر کامپوننت به صورت مستقل قابل تست است:

```typescript
describe('BasicSourceFields', () => {
  it('renders all required fields', () => {
    // test
  });
});
```

### 4. **نگهداری آسان**

- تغییر در یک بخش، بقیه را تحت تأثیر قرار نمی‌دهد
- کد خوانا و قابل فهم
- Debug کردن آسان‌تر

### 5. **کاهش حجم**

`AddSourceModal.tsx` از ~1055 خط به ~400 خط کاهش یافت (کاهش 62%)

## 📊 مقایسه قبل و بعد

| ویژگی                   | قبل      | بعد     |
| ----------------------- | -------- | ------- |
| **حجم فایل اصلی**       | ~1055 خط | ~400 خط |
| **تعداد کامپوننت**      | 1        | 8       |
| **قابلیت استفاده مجدد** | ❌       | ✅      |
| **تست‌پذیری**           | ⚠️ سخت   | ✅ آسان |
| **خوانایی**             | ⚠️ یچیده | ✅ ساده |
| **نگهداری**             | ⚠️ سخت   | ✅ آسان |

## 🚀 استفاده

### در AddSourceModal.tsx:

```typescript
import {
  ManualSourceForm,
  DoiSourceForm,
  ParseCitationForm,
  LibrarySourceForm,
  SourceModalTabs,
  type ManualFormInputs,
  type DoiFormInputs,
} from './modal-components';

// در کامپوننت
<ManualSourceForm
  register={registerManual}
  setValue={setValue}
  watch={watchManual}
  error={error}
  showAdvancedFields={showAdvancedFields}
  onToggleAdvancedFields={() => setShowAdvancedFields(!showAdvancedFields)}
  tags={tags}
  setTags={setTags}
  tagInputValue={tagInputValue}
  setTagInputValue={setTagInputValue}
  onSuggestTags={handleSuggestTags}
  isSuggestingTags={isSuggestingTags}
  tagSuggestionError={tagSuggestionError}
/>;
```

## 🎨 استایل و Design

تمام کامپوننت‌ها از Material-UI v7+ استفاده می‌کنند:

- ✅ Consistent styling
- ✅ RTL support برای فارسی
- ✅ Dark/Light mode support
- ✅ Responsive design
- ✅ Accessibility (a11y)

## 📝 نکات مهم

### 1. Type Safety

تمام کامپوننت‌ها با TypeScript نوشته شده‌اند:

```typescript
// تایپ‌ها را import کنید
import type { ManualFormInputs } from './modal-components';
```

### 2. Form Integration

کامپوننت‌ها با React Hook Form یکپارچه شده‌اند:

```typescript
const { register, setValue, watch } = useForm<ManualFormInputs>();
```

### 3. State Management

State به صورت prop drilling پاس داده می‌شود (ساده و واضح)

## 🔄 Future Improvements

پیشنهادات برای بهبود بیشتر:

- [ ] استفاده از Context برای کاهش prop drilling
- [ ] اضافه کردن unit tests
- [ ] اضافه کردن Storybook
- [ ] بهبود error handling
- [ ] اضافه کردن loading states

## 🐛 Troubleshooting

### مشکل: Import Error

**راه‌حل:**

```typescript
// صحیح
import { ManualSourceForm } from './modal-components';

// نادرست
import ManualSourceForm from './modal-components/ManualSourceForm';
```

### مشکل: Type Error در register

**راه‌حل:**
مطمئن شوید که تایپ‌های صحیح import شده‌اند:

```typescript
import type { ManualFormInputs } from './modal-components';
```

## 📚 منابع مرتبط

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Material-UI Components](https://mui.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

---

**نسخه:** 2.0  
**تاریخ:** 2025-01-20  
**وضعیت:** ✅ Production Ready
