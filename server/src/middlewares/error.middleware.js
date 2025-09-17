const notFound = (req, res, next) => {
  const error = new Error(`مسیر یافت نشد - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  res.status(statusCode).json({
    status: 'error',
    message: message,
    // نمایش stack trace فقط در حالت توسعه برای دیباگ کردن آسان‌تر
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
export { notFound, errorHandler };
