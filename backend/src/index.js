import express from "express"
import "dotenv/config"
import connectDb from "./lib/db.js"
import {clerkMiddleware} from "@clerk/express"
import cors from "cors";
import fs from "fs";
import path from "path";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhook.js"

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

app.use(express.json())
app.use(cors({origin: FRONTEND_URL, credentials:true}))
app.use(clerkMiddleware())

app.use("/api/webhooks/clerk", express.raw({type: "application/json"}), clerkWebhook);

app.get("/health", (req, res) => {
    res.status(200).json({ok: true})
})

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir))
    app.get("/*splat", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
});
}

app.listen(PORT, () => {
    connectDb();
    console.log("Server is up and running on port: ", PORT)
    if(process.env.NODE_ENV === "production") job.start();
})