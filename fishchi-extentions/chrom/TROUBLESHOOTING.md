# راهنمای عیب‌یابی افزونه فیشچی

## مشکلات رایج و راه‌حل‌ها

### 1. خطای "Auth check error" و "Load projects error"

**علت:** سرور در حال اجرا نیست یا به آن دسترسی ندارید.

**راه‌حل:**

1. مطمئن شوید سرور فیشچی روی پورت 3000 در حال اجرا است:

   ```bash
   cd server
   pnpm dev
   ```

2. بررسی کنید که سرور در دسترس است:

   - مرورگر را باز کنید و به `http://localhost:3000` بروید
   - باید پیام "Welcome to Fishchi API" را ببینید

3. اگر سرور روی پورت دیگری اجرا می‌شود، فایل `background.js` را ویرایش کنید:
   ```javascript
   const CONFIG = {
     API_BASE_URL: 'http://localhost:YOUR_PORT/api/v1',
     // ...
   };
   ```

### 2. خطای CORS

**علت:** سرور CORS را برای افزونه‌های کروم پشتیبانی نمی‌کند.

**راه‌حل:**

1. فایل `server/src/app.js` را بررسی کنید
2. مطمئن شوید که کد زیر وجود دارد:
   ```javascript
   app.use(
     cors({
       origin: function (origin, callback) {
         if (
           !origin ||
           allowedOrigins.indexOf(origin) !== -1 ||
           origin.startsWith('chrome-extension://')
         ) {
           callback(null, true);
         } else {
           callback(new Error('Not allowed by CORS'));
         }
       },
       credentials: true,
     })
   );
   ```

### 3. افزونه کار نمی‌کند

**راه‌حل:**

1. Developer Mode را فعال کنید:

   - به `chrome://extensions/` بروید
   - گزینه "Developer mode" را فعال کنید

2. افزونه را reload کنید:

   - روی دکمه "Reload" کلیک کنید

3. Console را بررسی کنید:
   - روی افزونه کلیک راست کنید
   - "Inspect popup" را انتخاب کنید
   - Console را باز کنید و خطاها را بررسی کنید

### 4. OAuth کار نمی‌کند

**علت:** تنظیمات OAuth در سرور درست نیست.

**راه‌حل:**

1. متغیرهای محیطی را بررسی کنید:

   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   CLIENT_URL=http://localhost:3000
   ```

2. URL های callback را بررسی کنید:
   - Google: `http://localhost:3000/api/v1/auth/google/callback`
   - GitHub: `http://localhost:3000/api/v1/auth/github/callback`

### 5. اطلاعات استخراج نمی‌شود

**راه‌حل:**

1. صفحه را refresh کنید
2. مطمئن شوید که در یکی از سایت‌های پشتیبانی شده هستید:

   - SID.ir
   - Civilica.com
   - Noormags.ir

3. Console را بررسی کنید:
   - F12 را فشار دهید
   - Console را باز کنید
   - خطاهای JavaScript را بررسی کنید

### 6. افزونه در سایت‌های پشتیبانی شده فعال نمی‌شود

**راه‌حل:**

1. فایل `manifest.json` را بررسی کنید:

   ```json
   "host_permissions": [
     "https://*.sid.ir/*",
     "https://*.civilica.com/*",
     "https://*.noormags.ir/*"
   ]
   ```

2. افزونه را reload کنید

### 7. خطای "Failed to fetch"

**علت:** مشکل شبکه یا سرور در دسترس نیست.

**راه‌حل:**

1. اتصال اینترنت را بررسی کنید
2. سرور را restart کنید
3. فایروال یا آنتی‌ویروس را بررسی کنید

## تست عملکرد

### تست سرور

```bash
curl -X GET http://localhost:3000/api/v1/users/profile
```

### تست OAuth

1. به `http://localhost:3000/api/v1/auth/test` بروید
2. وضعیت OAuth را بررسی کنید

### تست افزونه

1. افزونه را باز کنید
2. Console را بررسی کنید
3. پیام‌های خطا را بررسی کنید

## گزارش مشکل

اگر مشکل حل نشد:

1. Console را باز کنید و خطاها را کپی کنید
2. مراحل انجام شده را یادداشت کنید
3. نسخه Chrome و سیستم عامل را ذکر کنید
4. Issue در GitHub ایجاد کنید

## اطلاعات مفید

- **نسخه افزونه:** 1.1.0
- **پورت سرور:** 3000
- **سایت‌های پشتیبانی شده:** SID.ir, Civilica.com, Noormags.ir
- **مرورگرهای پشتیبانی شده:** Chrome, Edge, Brave

