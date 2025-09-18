import React from "react";

export function Input({ className, ...props }) {
  return (
    <input
      className={`border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full ${className}`}
      {...props}
    />
  );
}
