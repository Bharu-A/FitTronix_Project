// src/components/ui/tabs.js
import React from "react";
import { motion } from 'framer-motion';

export const TabsContext = React.createContext();

export function Tabs({ value, onValueChange, className, children }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div className={`inline-flex h-12 items-center justify-center rounded-lg bg-gray-800/50 backdrop-blur-md border border-cyan-500/20 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className, children }) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        selectedValue === value
          ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg shadow-cyan-500/30"
          : "text-gray-400 hover:text-cyan-300 hover:bg-gray-700/50"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function TabsContent({ value, className, children }) {
  const { value: selectedValue } = React.useContext(TabsContext);
  
  if (selectedValue !== value) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}