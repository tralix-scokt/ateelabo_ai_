const paths = {
  plus: "M12 5v14M5 12h14",
  chat: "M4 4h16v12H9l-5 4V4Z",
  search: "m16 16 4 4M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  file: "M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6M9 16h6",
  copy: "M8 8h12v12H8V8ZM4 16V4h12",
  settings:
    "m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3H9ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
};
export default function Icon({ name, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.plus} />
    </svg>
  );
}
