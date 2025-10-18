# 🐟 Fishchi App - پلتفرم مدیریت پروژه نوین

## 📖 درباره پروژه

Fishchi App یک پلتفرم جامع مدیریت منابع تحقیق و فیش برداری و مدیریت فیش آنلاین است که با استفاده از فناوری‌های مدرن وب توسعه یافته است. این پروژه شامل یک معماری Full-Stack با استفاده از React در سمت کلاینت و Node.js در سمت سرور می‌باشد.

## ✨ ویژگی‌های کلیدی

- 🎨 رابط کاربری مدرن و واکنش‌گرا با React و TypeScript
- 🔐 سیستم احراز هویت و مجوزدهی کامل
- 📊 مدیریت پروژه‌ها با نمایش Grid و List
- 🔌 قابلیت افزودن افزونه‌های سفارشی (Fishchi Extensions)
- 🎯 معماری Monorepo با استفاده از pnpm workspaces
- 🚀 API های RESTful برای ارتباط Client-Server
- 📱 طراحی Responsive برای تمامی دستگاه‌ها

## 🏗️ ساختار پروژه

```
fishchi-app-main/
├── client/                  # اپلیکیشن React (Frontend)
│   ├── src/
│   │   ├── components/     # کامپوننت‌های قابل استفاده مجدد
│   │   ├── pages/          # صفحات اصلی اپلیکیشن
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── services/       # سرویس‌های API
│   │   ├── store/          # مدیریت State (Redux/Context)
│   │   └── utils/          # توابع کمکی
│   ├── public/             # فایل‌های استاتیک
│   └── package.json        # وابستگی‌های Frontend
│
├── server/                  # اپلیکیشن Node.js (Backend)
│   ├── src/
│   │   ├── controllers/    # کنترلرهای API
│   │   ├── models/         # مدل‌های دیتابیس
│   │   ├── routes/         # مسیرهای API
│   │   ├── middleware/     # میدلورها (احراز هویت، خطا و...)
│   │   ├── services/       # لایه سرویس و منطق کسب‌وکار
│   │   └── utils/          # توابع کمکی Backend
│   └── package.json        # وابستگی‌های Backend
│
├── fishchi-extentions/      # افزونه‌های سفارشی و توسعه‌پذیر
│   └── ...                 # ماژول‌های افزونه
│
├── .vscode/                # تنظیمات VSCode
├── package.json            # تنظیمات Workspace اصلی
├── pnpm-lock.yaml          # Lock file برای pnpm
├── .gitignore              # فایل‌های ignored توسط Git
└── PROGRESS_STRATEGY.md    # استراتژی و روندنمای توسعه
```

## 🛠️ فناوری‌های استفاده شده

### Frontend (Client)
- **React 19** - کتابخانه UI
- **TypeScript** - برای Type Safety
- **React Router** - مدیریت روت‌ها
- **Axios** - برای درخواست‌های HTTP
- **Material-UI** - برای استایل‌دهی
- **Redux Toolkit / Context API** - مدیریت State
- **React Query** - کش و مدیریت Server State
- **Vite / Webpack** - Build Tool

### Backend (Server)
- **Node.js** - محیط اجرای JavaScript
- **Express.js** - فریمورک وب
- **TypeScript** - برای Type Safety
- **MongoDB / PostgreSQL** - پایگاه داده
- **Mongoose / Prisma** - ORM
- **JWT** - احراز هویت
- **bcrypt** - رمزنگاری رمز عبور
- **Express Validator** - اعتبارسنجی داده‌ها
- **Passport** احراز هویت و ورود با حساب کاربری گوگل یا گیت هاب

### ابزارها و DevOps
- **pnpm** - مدیریت پکیج‌ها (Monorepo)
- **ESLint & Prettier** - کیفیت و فرمت کد
- **Git** - کنترل نسخه


## 📦 نصب و راه‌اندازی

### پیش‌نیازها

```bash
Node.js >= 19.x
pnpm >= 8.x
MongoDB یا PostgreSQL (بسته به تنظیمات پروژه)
```

### مراحل نصب

1. **کلون کردن مخزن:**
```bash
git clone https://github.com/saeed-dev-nex/fishchi-app-main.git
cd fishchi-app-main
```

2. **نصب وابستگی‌ها:**
```bash
pnpm install
```

این دستور تمامی وابستگی‌های client، server و extensions را به صورت خودکار نصب می‌کند.

3. **تنظیم متغیرهای محیطی:**

در پوشه `server/`، یک فایل `.env` ایجاد کنید:
```env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/fishchi
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

در پوشه `client/`، یک فایل `.env` ایجاد کنید:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

4. **اجرای پروژه در حالت Development:**

```bash
# اجرای همزمان Client و Server
pnpm dev

# یا به صورت جداگانه:
# اجرای Server
pnpm dev:server

# اجرای Client
pnpm dev:client
```

5. **دسترسی به اپلیکیشن:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🎯 هدف و کاربرد پوشه‌ها

### 📁 Client
شامل تمامی کدهای Frontend و رابط کاربری. این بخش مسئول:
- نمایش داشبورد و صفحات کاربری
- مدیریت پروژه‌ها با نمایش Grid/List
- فرم‌های ایجاد و ویرایش پروژه
- احراز هویت و مدیریت کاربران
- تعامل با API های Backend

### 📁 Server
شامل Backend API و منطق کسب‌وکار. این بخش مسئول:
- مدیریت CRUD پروژه‌ها
- احراز هویت و مجوزدهی کاربران
- اعتبارسنجی داده‌ها
- ارتباط با پایگاه داده
- ارائه API های RESTful

### 📁 Fishchi-Extensions
سیستم افزونه‌های قابل توسعه که امکان اضافه کردن قابلیت‌های سفارشی به پلتفرم را فراهم می‌کند. این بخش:
- معماری Plugin-based
- امکان توسعه ماژول‌های مستقل
- یکپارچه‌سازی با Client و Server

### 📁 .vscode
تنظیمات و پیکربندی‌های VSCode برای یکسان‌سازی محیط توسعه تیمی.

### 📄 PROGRESS_STRATEGY.md
سند راهبردی و نقشه راه توسعه پروژه که شامل:
- فیچرهای برنامه‌ریزی شده
- اولویت‌های توسعه
- وضعیت پیشرفت کار

## 📝 اسکریپت‌های مفید

```bash
# اجرای در حالت Development
pnpm dev

# ساخت نسخه Production
pnpm build

# اجرای تست‌ها
pnpm test

# بررسی کیفیت کد (Linting)
pnpm lint

# فرمت کردن کد
pnpm format

# پاک‌سازی و نصب مجدد وابستگی‌ها
pnpm clean-install
```

## 🤝 مشارکت در پروژه

برای مشارکت در این پروژه:

1. این مخزن را Fork کنید
2. یک Branch جدید برای فیچر خود ایجاد کنید (`git checkout -b feature/AmazingFeature`)
3. تغییرات خود را Commit کنید (`git commit -m 'Add some AmazingFeature'`)
4. Branch خود را Push کنید (`git push origin feature/AmazingFeature`)
5. یک Pull Request ایجاد کنید

## 📄 لایسنس

این پروژه تحت لایسنس [MIT](LICENSE) منتشر شده است.

## 👨‍💻 توسعه‌دهنده

**Saeed Dev Nex**
- GitHub: [@saeed-dev-nex](https://github.com/saeed-dev-nex)

## 📞 پشتیبانی

برای گزارش مشکلات یا پیشنهادات، لطفاً از بخش [Issues](https://github.com/saeed-dev-nex/fishchi-app-main/issues) استفاده کنید.

---

⭐ اگر این پروژه برای شما مفید بود، لطفاً یک ستاره به آن بدهید!
