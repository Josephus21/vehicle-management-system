import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing a value.
 *
 * @param {any} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {any} The debounced value.
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear the timeout if value changes before delay is over
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
