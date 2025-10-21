# راهنمای تنظیم API Token برای خلاصه‌سازی

## مشکل فعلی

خطای 502 Bad Gateway در خلاصه‌سازی به دلیل عدم تنظیم API Token رخ می‌دهد.

## راه‌حل

### 1. دریافت API Token از Hugging Face

1. به [Hugging Face Settings](https://huggingface.co/settings/tokens) بروید
2. یک token جدید ایجاد کنید
3. token را کپی کنید

### 2. تنظیم Environment Variable

در فایل `.env` در پوشه `server` خط زیر را اضافه کنید:

```bash
HF_API_TOKEN=your_token_here
```

### 3. راه‌اندازی مجدد سرور

```bash
cd server
pnpm run dev
```

## خلاصه‌سازی بدون API Token

در صورت عدم تنظیم API Token، سیستم از خلاصه‌سازی ساده استفاده می‌کند که:

- جملات مهم را انتخاب می‌کند
- خلاصه‌ای با کیفیت متوسط تولید می‌کند
- همچنان قابل استفاده است

## تست عملکرد

1. یک فیش ایجاد کنید
2. روی دکمه خلاصه‌سازی کلیک کنید
3. خلاصه باید نمایش داده شود
