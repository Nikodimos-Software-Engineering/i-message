import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";


const job = new CronJob("*/14 * * * *", function () {
    const base = process.env.FRONTEND_URL;
    if(!base) return;
    const url = new URL("/health", base).href;
    const client = url.startsWith("https:") ? https : http;

    client.get(url, (rest)=> {
        if(rest.statusCode === 200) console.log("Get Request Sent Successfully");
        else console.log("GET request failed", rest.statusCode);
    }).on("error", (e) => console.error("Error while sending request", e));
});


export default job;