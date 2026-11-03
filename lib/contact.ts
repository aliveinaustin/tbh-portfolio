import { z } from "zod";

export const topicLabels = {
    role: "Full-time role",
    email: "Email / SFMC project",
    display: "HTML5 display project",
    web: "Front-end project",
    other: "Something else",
} as const;

export const contactSchema = z.object({
    name: z.string().trim().min(1, "Please add your name."),
    email: z.string().trim().email("That email address doesn't look right."),
    topic: z.enum(["role", "email", "display", "web", "other"], { message: "Please choose a topic." }),
    message: z.string().trim().min(20, "A little more detail helps, at least 20 characters."),
});

export type ContactField = keyof z.infer<typeof contactSchema>;

export type ContactState = {
    status: "idle" | "error" | "success";
    message?: string;
    fieldErrors?: Partial<Record<ContactField, string[]>>;
    values?: Partial<Record<ContactField, string>>;
};