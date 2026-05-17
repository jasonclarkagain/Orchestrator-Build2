import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`p-6 max-w-7xl mx-auto ${className || ""}`}
    >
      {children}
    </motion.div>
  );
}
