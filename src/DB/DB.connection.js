import mongoose from "mongoose";


export default async function DBConnection() {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("DB connection DONE");
        return mongoose.connection.db
    } catch (error) {
        console.log("DB connection Faild", error);
    }
}