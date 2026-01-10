// 'use client';

// import { motion } from 'framer-motion';
// import { InputHTMLAttributes, useState } from 'react';

// interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
//   label: string;
//   error?: string;
// }

// export default function AnimatedInput({
//   label,
//   error,
//   id,
//   className = '',
//   ...props
// }: AnimatedInputProps) {
//   const [isFocused, setIsFocused] = useState(false);
//   const [hasValue, setHasValue] = useState(false);

//   const handleFocus = () => setIsFocused(true);
//   const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
//     setIsFocused(false);
//     setHasValue(e.target.value.length > 0);
//   };

//   const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

//   return (
//     <div className="relative">
//       <motion.input
//         id={inputId}
//         onFocus={handleFocus}
//         onBlur={handleBlur}
//         className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white peer ${
//           error
//             ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
//             : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
//         } ${className}`}
//         placeholder=" "
//         {...props}
//       />

//       {/* Floating Label */}
//       <motion.label
//         htmlFor={inputId}
//         className={`absolute left-4 transition-all duration-200 pointer-events-none ${
//           error ? 'text-red-600' : 'text-gray-600'
//         }`}
//         animate={{
//           top: isFocused || hasValue || props.value ? '0.25rem' : '0.75rem',
//           fontSize: isFocused || hasValue || props.value ? '0.75rem' : '1rem',
//           fontWeight: isFocused || hasValue || props.value ? 600 : 400,
//         }}
//         transition={{ duration: 0.2 }}
//       >
//         {label}
//       </motion.label>

//       {/* Error Message */}
//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mt-2 flex items-start"
//         >
//           <svg className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//           </svg>
//           <p className="text-sm text-red-600 font-medium">{error}</p>
//         </motion.div>
//       )}
//     </div>
//   );
// }

"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { useState } from "react";

interface AnimatedInputProps extends HTMLMotionProps<"input"> {
  label: string;
  error?: string;
}

export default function AnimatedInput({
  label,
  error,
  id,
  className = "",
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
  };

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="relative">
      <motion.input
        id={inputId}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 hover:bg-white peer ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        } ${className}`}
        placeholder=" "
        {...props}
      />

      {/* Floating Label */}
      <motion.label
        htmlFor={inputId}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          error ? "text-red-600" : "text-gray-600"
        }`}
        animate={{
          top: isFocused || hasValue || props.value ? "0.25rem" : "0.75rem",
          fontSize: isFocused || hasValue || props.value ? "0.75rem" : "1rem",
          fontWeight: isFocused || hasValue || props.value ? 600 : 400,
        }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.label>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-start"
        >
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </motion.div>
      )}
    </div>
  );
}
