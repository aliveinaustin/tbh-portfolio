"use server";

import { Resend } from "resend";
import { contactSchema, topicLabels, type ContactState } from "@/lib/contact";

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
    // Honeypot filled in: report success so the bot moves on, but send nothing
    if (formData.get("company")) return { status: "success" };

    const values = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        topic: String(formData.get("topic") ?? ""),
        message: String(formData.get("message") ?? ""),
    };

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
        return {
            status: "error",
            message: "Please fix the fields below.",
            fieldErrors: parsed.error.flatten().fieldErrors,
            values,
        };
    }

    const { name, email, topic, message } = parsed.data;
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO;

    if (!apiKey || !to) {
        console.error("Contact form: RESEND_API_KEY or CONTACT_TO is not set");
        return {
            status: "error",
            message: "Your message didn't send. Please try again, or email me directly.",
            values,
        };
    }

    try {
        const resend = new Resend(apiKey);
        const { error } = await resend.emails.send({
            from: "Portfolio <contact@thomasbrandonhays.com>",
            to,
            replyTo: email,
            subject: `[Portfolio] ${topicLabels[topic]} from ${name}`,
            text: `From: ${name} <${email}>\nTopic: ${topicLabels[topic]}\n\n${message}`,
        });
        if (error) throw error;
    } catch (err) {
        console.error("Contact form send failed:", err);
        return {
            status: "error",
            message: "Your message didn't send. Please try again, or email me directly.",
            values,
        };
    }

    return { status: "success" };
}