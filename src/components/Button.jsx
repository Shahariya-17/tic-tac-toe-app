import React from "react";
import { motion } from "framer-motion";


const Button = ({ label, onClick, color = "bg-indigo-600 hover:bg-indigo-700", icon, disabled = false }) => {
  const isLightColor =
    color?.includes("yellow") ||
    color?.includes("amber") ||
    color?.includes("lime") ||
    color?.includes("white") ||
    color?.includes("gray-100");

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, boxShadow: "0 8px 24px rgba(15,23,42,0.12)" } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors duration-150 ${color} ${isLightColor ? "text-gray-900" : "text-white"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-400`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  );
};

export default Button;
