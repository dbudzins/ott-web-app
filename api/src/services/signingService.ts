import jwt from 'jsonwebtoken';

const Time = new Date();

const API_SECRET = import.meta.env.APP_JW_API_SECRET;

/**
 * Generatea a URL with signature.
 * @param {string} path
 * @param {string} host
 * @returns {string} signed URL
 */
const signUrl = (path: string, host = 'https://cdn.jwplayer.com') => {
  const token = jwt.sign(
    {
      exp: Math.ceil((Time.getTime() + 3600) / 300) * 300, // Round to even 5 minutes for caching
      resource: path,
    },
    API_SECRET,
  );

  return `${host}${path}?token=${token}`;
};

export default signUrl;
