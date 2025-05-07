const TextArea = ({
  className = "",
  cols = "30",
  rows = "5",
  hasError = false,
  ...props
}) => {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border-[1.5px] border-gray-300 p-1.5 px-3 transition duration-300 focus:border-transparent focus:outline-none focus:ring-2 ${
        hasError ? "focus:ring-red-500" : "focus:ring-primary"
      } ${className}`}
      cols={cols}
      rows={rows}
    />
  );
};

export default TextArea;
