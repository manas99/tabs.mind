export function Input({ value, onChange, placeholder }: any) {
    return (
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-md bg-neutral-800 dark:bg-neutral-900 text-neutral-100 placeholder:text-neutral-500 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 transition"
        />
    );
}
