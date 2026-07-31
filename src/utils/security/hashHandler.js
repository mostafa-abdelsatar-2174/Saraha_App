import bcrypt from "bcrypt"

export const generateHash = ({plainText='', salt=process.env.PASS_HASH_SALT}={})=>{
    const theHashed = bcrypt.hashSync(plainText, parseInt(salt))
    return theHashed
}


export const compareHash = ({ plainText='', hashedText=''}={})=>{
    const compareResult = bcrypt.compareSync(plainText, hashedText)
    return compareResult
}