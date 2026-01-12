// "use client";

// import { motion } from "framer-motion";
// import { useInView } from "framer-motion";
// import { useRef } from "react";
// import { staggerContainer, staggerItem } from "../../lib/animations";
// const features = [
//   {
//     icon: (
//       <svg
//         className="w-8 h-8"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
//         />
//       </svg>
//     ),
//     title: "Smart Task Management",
//     description:
//       "Create, organize, and prioritize your tasks with an intuitive interface designed for maximum productivity.",
//     gradient: "from-blue-500 to-indigo-600",
//   },
//   {
//     icon: (
//       <svg
//         className="w-8 h-8"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
//         />
//       </svg>
//     ),
//     title: "Advanced Filtering",
//     description:
//       "Filter and sort your tasks by status, date, or priority to focus on what matters most right now.",
//     gradient: "from-purple-500 to-pink-600",
//   },
//   {
//     icon: (
//       <svg
//         className="w-8 h-8"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M13 10V3L4 14h7v7l9-11h-7z"
//         />
//       </svg>
//     ),
//     title: "Lightning Fast",
//     description:
//       "Built with modern technology for instant updates and seamless performance across all your devices.",
//     gradient: "from-green-500 to-emerald-600",
//   },
//   {
//     icon: (
//       <svg
//         className="w-8 h-8"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//         />
//       </svg>
//     ),
//     title: "Secure & Private",
//     description:
//       "Your data is encrypted and protected with industry-standard security measures. Your tasks stay private.",
//     gradient: "from-red-500 to-orange-600",
//   },
// ];

// export default function Features() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-100px" });

//   return (
//     <section ref={ref} className="py-20 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Section Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
//             Everything You Need to Stay Organized
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Powerful features designed to help you manage tasks efficiently and
//             achieve your goals faster.
//           </p>
//         </motion.div>

//         {/* Features Grid */}
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           animate={isInView ? "visible" : "hidden"}
//           className="grid grid-cols-1 md:grid-cols-2 gap-8"
//         >
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               variants={staggerItem}
//               whileHover={{ scale: 1.03, y: -5 }}
//               className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
//             >
//               <div
//                 className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 shadow-md`}
//               >
//                 {feature.icon}
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-3">
//                 {feature.title}
//               </h3>
//               <p className="text-gray-600 leading-relaxed">
//                 {feature.description}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Additional Info */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           className="mt-16 text-center"
//         >
//           <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200">
//             <svg
//               className="w-5 h-5 text-blue-600 mr-2"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span className="text-sm font-semibold text-gray-700">
//               Free to use • No credit card required • Start in seconds
//             </span>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// --- next ui --- //

"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { staggerContainer, staggerItem } from "../../lib/animations";

const features = [
  {
    title: "Smart Task Management",
    description:
      "Create, organize, and prioritize your tasks with an intuitive workflow.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    title: "Advanced Filtering",
    description:
      "Filter tasks by priority, status, or deadline and stay focused.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    title: "Lightning Fast",
    description: "Instant updates and smooth performance across all devices.",
    gradient: "from-cyan-500 to-indigo-600",
  },
  {
    title: "Secure & Private",
    description:
      "Industry-standard security keeps your tasks safe and private.",
    gradient: "from-indigo-500 to-cyan-500",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  /* ===== GSAP BACKGROUND + FLOATING CARDS ===== */
  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        backgroundPosition: "200% 200%",
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "linear",
      });
    }

    if (cardsRef.current) {
      gsap.to(cardsRef.current.children, {
        y: -20,
        rotateY: 6,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.3,
      });
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* ===== Animated Gradient Background (Hero style) ===== */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[length:300%_300%]
        bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-cyan-400/30
        dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-cyan-900/40"
      />

      {/* Glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/40 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/40 blur-3xl rounded-full" />

      {/* ===== Content ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4">
            Powerful Features for Maximum Focus
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage tasks efficiently — clean, fast and
            distraction-free.
          </p>
        </motion.div>

        {/* ===== 3D FEATURES GRID ===== */}
        <motion.div
          ref={cardsRef}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 perspective-[1200px]"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              whileHover={{
                rotateX: -6,
                rotateY: 6,
                scale: 1.05,
              }}
              className="relative rounded-3xl p-8
              bg-white/70 dark:bg-white/10 backdrop-blur-xl
              border border-white/20 shadow-2xl
              transform-style-preserve-3d"
            >
              {/* Gradient Icon Orb */}
              <div
                className={`w-16 h-16 rounded-2xl mb-6
                bg-gradient-to-br ${feature.gradient}
                flex items-center justify-center
                text-white text-2xl font-bold shadow-xl`}
              >
                ✓
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Glow edge */}
              <div
                className={`absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition
                bg-gradient-to-br ${feature.gradient} blur-xl -z-10`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
