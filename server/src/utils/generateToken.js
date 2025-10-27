// In: server/src/utils/generateToken.js

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT, sets it as an httpOnly cookie, and returns the token.
 * This version is modified for HTTPS cross-origin development (e.g., Word Add-in).
 * @param {object} res - Express response object.
 * @param {string} userId - User's MongoDB ID.
 * @param {boolean} [rememberMe=false] - Whether to set a long-lived cookie.
 * @returns {string} The generated JWT.
 */
const generateToken = (res, userId, rememberMe = false) => {
  const expiresInDays = rememberMe ? 30 : 1;
  const expiresInMs = expiresInDays * 24 * 60 * 60 * 1000;
  const expiresInJwtString = `${expiresInDays}d`; // Original logic

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expiresInJwtString,
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + expiresInMs), // Use the correct ms value
    secure: true,
    sameSite: 'none',
  };

  res.cookie('jwt', token, cookieOptions);
  return token;
};

export default generateToken;
