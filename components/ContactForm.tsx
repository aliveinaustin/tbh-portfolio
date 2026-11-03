"use client";

import { useActionState } from "react";
import { sendContact } from "@/app/actions/contact";
import type { ContactField, ContactState } from "@/lib/contact";
import Button from "@/components/ui/Button";

const initial: ContactState = { status: "idle" };

const fieldClasses =
    "w-full rounded-md border border-border bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint aria-invalid:border-error";

export default function ContactForm() {
    const [state, formAction, pending] = useActionState(sendContact, initial);

    if (state.status === "success") {
        return (
            <div role="status" className="flex flex-col gap-3 lg:border-l lg:border-border lg:p-12">
                <h3 className="text-subhead">Message sent</h3>
                <p className="text-body text-text-muted">Thanks. I'll reply within one business day.</p>
            </div>
        );
    }

    const error = (f: ContactField) => state.fieldErrors?.[f]?.[0];
    const errorProps = (f: ContactField) =>
        error(f) ? { "aria-invalid": true, "aria-describedby": `${f}-error` } : {};

    return (
        <form action={formAction} noValidate className="flex flex-col gap-6 lg:border-l lg:border-border lg:p-12">
            {state.status === "error" && state.message && (
                <p role="alert" className="rounded-md border border-error px-4 py-3 text-body-sm text-error">
                    {state.message}
                </p>
            )}

            <Field id="name" label="Name" error={error("name")}>
                <input id="name" name="name" type="text" autoComplete="name" defaultValue={state.values?.name}
                    className={fieldClasses} {...errorProps("name")} />
            </Field>

            <Field id="email" label="Email" error={error("email")}>
                <input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
                    className={fieldClasses} {...errorProps("email")} />
            </Field>

            <Field id="topic" label="What's it about?" error={error("topic")}>
                <select id="topic" name="topic" defaultValue={state.values?.topic ?? ""}
                    className={fieldClasses} {...errorProps("topic")}>
                    <option value="" disabled>Choose one</option>
                    <option value="role">Full-time role</option>
                    <option value="email">Email / SFMC project</option>
                    <option value="display">HTML5 display project</option>
                    <option value="web">Front-end project</option>
                    <option value="other">Something else</option>
                </select>
            </Field>

            <Field id="message" label="Message" error={error("message")}>
                <textarea id="message" name="message" rows={5} defaultValue={state.values?.message}
                    className={fieldClasses} {...errorProps("message")} />
            </Field>

            {/* Honeypot */}
            <div aria-hidden="true" className="hidden">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Sending…" : "Send message"}
            </Button>
        </form>
    );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-label text-text-muted">{label}</label>
            {children}
            {error && <p id={`${id}-error`} className="text-body-sm text-error">{error}</p>}
        </div>
    );
}