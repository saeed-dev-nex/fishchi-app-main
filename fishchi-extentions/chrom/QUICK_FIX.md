# راهنمای سریع حل مشکل "Receiving end does not exist"

## مشکل

خطای "Could not establish connection. Receiving end does not exist" در افزونه کروم

## علت

Background script در حال اجرا نیست یا مشکل دارد.

## راه‌حل سریع

### مرحله 1: بررسی افزونه

1. به `chrome://extensions/` بروید
2. افزونه فیشچی را پیدا کنید
3. روی دکمه "Reload" کلیک کنید

### مرحله 2: بررسی Console

1. روی افزونه کلیک راست کنید
2. "Inspect popup" را انتخاب کنید
3. Console را باز کنید
4. باید پیام "Fishchi background script loaded successfully" را ببینید

### مرحله 3: اگر مشکل ادامه دارد

1. افزونه را حذف کنید
2. دوباره نصب کنید:
   - "Load unpacked" کلیک کنید
   - پوشه `fishchi-extentions/chrom` را انتخاب کنید

### مرحله 4: بررسی سرور

1. مطمئن شوید سرور در حال اجرا است:

   ```bash
   cd server
   pnpm dev
   ```

2. به `http://localhost:3000` بروید
3. باید پیام "Welcome to Fishchi API" را ببینید

## تست عملکرد

1. افزونه را باز کنید
2. باید پیام "Background script is running" را ببینید
3. اگر خطا می‌بینید، مراحل بالا را تکرار کنید

## نکات مهم

- همیشه افزونه را reload کنید بعد از تغییرات
- Console را بررسی کنید برای خطاها
- سرور باید روی پورت 3000 در حال اجرا باشد

