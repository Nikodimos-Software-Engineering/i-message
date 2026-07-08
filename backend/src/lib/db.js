import mongoose from "mongoose";

async function connectDb() {
    try {
        const database_url = process.env.DATABASE_URL;
        if (!database_url){
            throw new Error("URL is needed for connection!");
        }

        const conn = await mongoose.connect(database_url);
        console.log("Connected: ", conn.connection.host);
    } catch (error) {
        console.error("Connection error: ", error.message);
        process.exit(1);
    }
}

export default connectDb;