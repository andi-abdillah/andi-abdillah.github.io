import { forwardRef, useEffect, useRef } from "react";

const TextInput = forwardRef(
  ({ type = "text", className = "", isFocused = false, ...props }, ref) => {
    const inputRef = useRef();

    useEffect(() => {
      if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    useEffect(() => {
      if (isFocused) {
        inputRef.current.focus();
      }
    }, [isFocused]);

    return (
      <input
        {...props}
        type={type}
        className={`block h-10 w-full rounded-lg border-[1.5px] border-gray-300 px-3 py-1.5 transition duration-300 focus:border-transparent focus:outline-none focus:ring focus:ring-2 focus:ring-primary ${className}`}
        ref={inputRef}
      />
    );
  },
);

export default TextInput;
