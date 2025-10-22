import React from "react";
import { motion } from "framer-motion";

const Button = ({ label, onClick, color, icon }) => {
  const isLightColor =
    color?.includes("yellow") || color?.includes("amber") || color?.includes("lime");

  return (
    <motion.button
      whileHover={{
        scale: 1.08,
        boxShadow: "0 0 20px rgba(0,0,0,0.15)",
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${color} ${
        isLightColor ? "text-gray-900" : "text-white"
      } shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {label}
    </motion.button>
  );
};

export default Button;
