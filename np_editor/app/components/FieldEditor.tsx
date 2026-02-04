// components/FieldEditor.tsx
interface FieldEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date" | "textarea";
  placeholder?: string;
  prefix?: string;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

export default function FieldEditor({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  prefix,
  multiline = false,
  maxLength,
  disabled = false,
}: FieldEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          rows={3}
          maxLength={maxLength}
        />
      ) : (
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {prefix}
            </span>
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
              prefix ? "pl-10" : ""
            }`}
            disabled={disabled}
            maxLength={maxLength}
          />
        </div>
      )}
    </div>
  );
}
