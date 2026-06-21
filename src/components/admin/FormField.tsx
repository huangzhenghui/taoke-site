type SelectOption = {
  label: string;
  value: string;
};

type FormFieldProps = {
  label: string;
  name: string;
  defaultValue?: string | number;
  placeholder?: string;
  type?: "text" | "number" | "url" | "datetime-local";
  textarea?: boolean;
  options?: SelectOption[];
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400";

export function FormField({
  label,
  name,
  defaultValue = "",
  placeholder,
  type = "text",
  textarea = false,
  options,
}: FormFieldProps) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      {options ? (
        <select
          className={fieldClassName}
          defaultValue={String(defaultValue)}
          name={name}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          className={`${fieldClassName} min-h-28 resize-y leading-6`}
          defaultValue={String(defaultValue)}
          name={name}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={fieldClassName}
          defaultValue={String(defaultValue)}
          name={name}
          placeholder={placeholder}
          type={type}
        />
      )}
    </label>
  );
}
