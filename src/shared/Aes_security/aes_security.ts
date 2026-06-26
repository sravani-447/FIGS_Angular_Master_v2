import * as CryptoJS from 'crypto-js';


export function encrypt(plainText: string): string {

  const key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
  const iv = CryptoJS.enc.Utf8.parse('1234567890123456');

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
}

export function decrypt(cipherText: string): string {

  const key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
  const iv = CryptoJS.enc.Utf8.parse('1234567890123456');

  const bytes = CryptoJS.AES.decrypt(cipherText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return bytes.toString(CryptoJS.enc.Utf8);
}
