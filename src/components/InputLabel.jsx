const InputLabel = ({
  value,
  className = "",
  children,
  required = false,
  ...props
}) => {
  return (
    <label {...props} className={`inline-block text-gray-500 ` + className}>
      {required ? <span className="text-red-600">* </span> : null}
      {value ? value : children}
    </label>
  );
};

export default InputLabel;
