import cryptojs from 'crypto-js';

// Secret key – in a real app, derive this using public-private key
const SECRET_KEY = "my_secret_key_123"; // keep same for both users for now

export const encryptMessage = (message) => {
    return cryptojs.AES.encrypt(message, SECRET_KEY).toString();
}

export const decryptMessage = (cipherText) => {
    try {
        const bytes = cryptojs.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(cryptojs.enc.Utf8) || cipherText;
    } catch (e) {
        return cipherText;
    }

};