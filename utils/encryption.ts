import CryptoJS from 'crypto-js';
import { AES_SECRET_KEY } from '@/constants';

/**
 * Encrypts a password using AES-256-CBC encryption.
 * Matches the backend AES256Util.java implementation:
 * - Key: secret key as UTF-8 bytes
 * - IV: first 16 bytes of the key
 * - Output: Base64 encoded
 */
export function encryptPassword(password: string): string {
  if (!AES_SECRET_KEY) {
    throw new Error('AES_SECRET_KEY is not configured');
  }

  // Key as UTF-8 (matching Java: secretKey.getBytes(StandardCharsets.UTF_8))
  const key = CryptoJS.enc.Utf8.parse(AES_SECRET_KEY);

  // IV = first 16 bytes of the key (matching Java: System.arraycopy(keyBytes, 0, iv, 0, 16))
  const iv = CryptoJS.enc.Utf8.parse(AES_SECRET_KEY.substring(0, 16));

  // Encrypt using AES-256-CBC with PKCS7 padding (same as PKCS5 in Java)
  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  // Return as Base64 (matching Java: Base64.getEncoder().encodeToString())
  return encrypted.toString(); // CryptoJS.AES.encrypt.toString() returns Base64 by default
}