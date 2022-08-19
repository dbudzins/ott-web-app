import jwt from 'jsonwebtoken';

const Time = new Date();

// This is a runtime secret, not a vite secret,
// because it will be passed to the container in the cloud, not replaced at compile time
const { JW_API_SECRET } = process.env;

/**
 * Generatea a URL with signature.
 * @param {string} path
 * @param {string} host
 * @returns {string} signed URL
 */
const signUrl = (path: string, host = 'https://cdn.jwplayer.com') => {
  if (!JW_API_SECRET) {
    throw 'JW API Secret is missing';
  }

  const token = jwt.sign(
    {
      exp: Math.ceil((Time.getTime() + 3600) / 300) * 300, // Round to even 5 minutes for caching
      resource: path,
    },
    JW_API_SECRET,
  );

  return `${host}${path}?token=${token}`;
};

export default signUrl;
