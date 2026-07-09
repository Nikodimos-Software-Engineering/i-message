import express from "express"
import User from "../models/User.js"
import { verifyWebhook } from "@clerk/express/webhooks"

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        // Convert raw buffer to string
        const payload = req.body.toString();
        
        console.log("Webhook received");

        // Create a Request object with the payload
        const request = new Request("http://internal/webhooks/clerk", {
            method: "POST",
            headers: new Headers(req.headers),
            body: payload
        });

        // Verify using Clerk's verifyWebhook
        const evt = await verifyWebhook(request, { 
            signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET 
        });

        console.log("Webhook verified, type:", evt.type);

        // Handle user.created and user.updated
        if (evt.type === "user.created" || evt.type === "user.updated") {
            const u = evt.data;
            const email = u.email_addresses?.find((e) => e.id === u.primary_email_address_id)?.email_address ?? u.email_addresses?.[0]?.email_address;

            const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || email?.split("@")[0];

            console.log("Processing user:", { clerkId: u.id, email, fullName });

            await User.findOneAndUpdate(
                { clerkId: u.id },
                { 
                    clerkId: u.id, 
                    email, 
                    fullName, 
                    profilePic: u.image_url 
                },
                { new: true, upsert: true, setDefaultOnInsert: true }
            );
        }

        // Handle user.deleted
        if (evt.type === "user.deleted") {
            if (evt.data.id) {
                await User.findOneAndDelete({ clerkId: evt.data.id });
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error in Clerk Webhook: ", error);
        res.status(400).json({ 
            message: "Webhook verification failed",
            error: error.message 
        });
    }
});

export default router;