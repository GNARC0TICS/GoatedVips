import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM recommended IV length is 12, but 16 is common for AES block size if not using 96-bit (12-byte) for GCM specifically
const SALT_LENGTH = 16;
const KEY_LENGTH = 32; // For AES-256
const ITERATIONS = 100000; // Key derivation iterations

// Ensure PASSWORD_ENCRYPTION_KEY is set in your environment variables
const secretKey = process.env.PASSWORD_ENCRYPTION_KEY;
if (!secretKey || secretKey.length < 32) {
  console.error('FATAL ERROR: PASSWORD_ENCRYPTION_KEY environment variable is not set or is too short (min 32 chars recommended).');
  // In a real app, you might throw an error or exit, but for the assistant, log and continue cautiously.
  // throw new Error('PASSWORD_ENCRYPTION_KEY environment variable is not set or is too short.');
}

/**
 * Derives a key from the master secret key and a salt.
 * This helps in using different effective keys for encryption even with one master key.
 */
function deriveKey(salt: Buffer): Buffer {
  if (!secretKey) {
    // This should ideally not be reached if the initial check is effective.
    throw new Error('Encryption key is not available.');
  }
  return crypto.pbkdf2Sync(secretKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns an object containing the iv, salt, authTag, and encrypted text, all as hex strings.
 */
export function encryptPassword(plainText: string): {
  iv: string; 
  salt: string; 
  encryptedText: string; 
  authTag: string; 
} {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    encryptedText: encrypted,
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypts text encrypted with AES-256-GCM.
 * Expects iv, salt, authTag, and encryptedText as hex strings.
 */
export function decryptPassword(encryptedData: {
  iv: string; 
  salt: string; 
  encryptedText: string; 
  authTag: string; 
}): string | null {
  try {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    const key = deriveKey(salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData.encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null; // Or throw error, depending on desired error handling
  }
} 