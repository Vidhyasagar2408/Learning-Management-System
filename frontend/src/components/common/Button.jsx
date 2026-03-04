export default function Button({ children, ...props }) {
  return <button className="rounded bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-60" {...props}>{children}</button>;
}