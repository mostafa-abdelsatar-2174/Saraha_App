import CryptoJS from "crypto-js";

export const generateEncryption = ({plainText="", encryptKey=process.env.ENCRYPT_PHONE_KEY}={})=>{
    const theEncrypt = CryptoJS.AES.encrypt(plainText, encryptKey).toString()
    return theEncrypt
}


export const generateDecryption = ({cipherText="", encryptKey=process.env.ENCRYPT_PHONE_KEY}={})=>{
    const theDecrypt = CryptoJS.AES.decrypt(cipherText, encryptKey).toString(CryptoJS.enc.Utf8)
    return theDecrypt
}