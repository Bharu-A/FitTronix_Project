// src/components/ui/card.jsx
import React from "react";
import clsx from "clsx";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-md border border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx("p-4", className)} {...props}>
      {children}
    </div>
  );
}
