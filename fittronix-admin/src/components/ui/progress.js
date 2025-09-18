// src/components/ui/progress.jsx
import React from "react";
import clsx from "clsx";

export function Progress({ value = 0, className, ...props }) {
  return (
    <div
      className={clsx("w-full bg-gray-200 rounded-full h-3", className)}
      {...props}
    >
      <div
        className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
