export const activationEmailTemplate = (name, email, activationcode) => {
  return `
    <html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activation Code Email Template</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
            direction: rtl;
        }
        
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        
        .header {
            background-color: #4a6cf7;
            color: white;
            text-align: center;
            padding: 30px 20px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .code-container {
            background-color: #f8f9ff;
            border: 1px solid #e0e6ff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        
        .activation-code {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 4px;
            color: #4a6cf7;
            background-color: white;
            padding: 15px 20px;
            border-radius: 6px;
            display: inline-block;
            box-shadow: 0 2px 8px rgba(74, 108, 247, 0.15);
        }
        
        .instructions {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
            margin-top: 20px;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
        }
        
        .button {
            display: inline-block;
            background-color: #4a6cf7;
            color: white;
            padding: 12px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
            margin-top: 25px;
        }
        
        .button:hover {
            background-color: #3a5ce5;
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>فعال‌سازی حساب کاربری</h1>
        </div>
        
        <div class="content">
            <p class="greeting">سلام ${name}،</p>
            
            <p>به پلتفرم ما خوش آمدید! برای تکمیل ثبت‌نام خود، لطفاً از کد فعال‌سازی زیر استفاده کنید:</p>
            
            <div class="code-container">
                <div class="activation-code">${activationcode}</div>
            </div>
            
            <p class="instructions">
                این کد را در صفحه فعال‌سازی وارد کنید تا حساب کاربری خود را تأیید کرده و از خدمات ما استفاده کنید.
                اگر این کد را درخواست نکرده‌اید، لطفاً این ایمیل را نادیده بگیرید یا با تیم پشتیبانی ما تماس بگیرید.
            </p>
            
            <a href="#" class="button">فعال‌سازی حساب من</a>
        </div>
        
        <div class="footer">
            <p>اگر سؤالی دارید، به راحتی به این ایمیل پاسخ دهید.</p>
            <p>&copy; ۱۴۰۴ سایت فیشچی. تمامی حقوق محفوظ است.</p>
        </div>
    </div>
</body>
</html>
    `;
};
