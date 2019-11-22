import jwt from 'jsonwebtoken-promisified';


// Note: this is not an example of expected usage. Encrpytion secret should never
// be stored in plain text
const ENCRYPTION_SECRET = 'TEST_ENCRYPTION_SECRET';

export const createAuthKey = async (email: string) => (
  jwt.signAsync(
    {
      email,
      exp: Math.floor(Date.now() / 1000) + (60 * 10), // 10 minute expiry
    },
    ENCRYPTION_SECRET,
    { algorithm: 'RS256' },
  ));

export const verifyAuthKey = async (token: string) => (
  jwt.verifyAsync(
    token,
    ENCRYPTION_SECRET,
    { algorithm: 'RS256' },
  ));
