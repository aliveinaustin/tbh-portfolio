type FieldType = "text" | "email" | "textarea" | "select";
type FormFieldProps = {
    id: string;
    label: string;
    type?: FieldType;
    required?: boolean;
    placeholder?: string;
    error?: string;
    options?: { value: string; label: string }[];
};

export default function FormField({ id, label, type = "text", required = false, placeholder, error, options, }: FormFieldProps) {
    const errorId = error ? `${id}-error` : undefined;

    const shared = {
        id,
        name: id,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": errorId,
        className: `w-full rounded-lg border bg-surface-low px-3.5 py-2.5 text-code text-text placeholder:text-text-faint transition-colors ${error ? "border-error" : "border-border-dim"
            }`,
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-code font-semibold text-text-muted">
                {label}
                {required && (
                    <span aria-hidden="true" className="ml-1 text-error">
                        *
                    </span>
                )}
            </label>

            {type === "textarea" ? (
                <textarea {...shared} rows={4} placeholder={placeholder} />
            ) : type === "select" ? (
                <select {...shared}>
                    {options?.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input {...shared} type={type} placeholder={placeholder} />
            )}

            {error && (
                <p id={errorId} className="text-code text-error">
                    {error}
                </p>
            )}
        </div>
    );
}