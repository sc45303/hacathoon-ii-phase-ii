// "use client";

// import { motion, useInView } from "framer-motion";
// import { useEffect, useRef } from "react";
// import { gsap } from "gsap";
// import Link from "next/link";
// import { fadeInUp } from "../../lib/animations";

// export default function CallToAction() {
//   const sectionRef = useRef(null);
//   const blob1Ref = useRef(null);
//   const blob2Ref = useRef(null);
//   const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

//   useEffect(() => {
//     // Animate floating blobs
//     if (blob1Ref.current) {
//       gsap.to(blob1Ref.current, {
//         x: 50,
//         y: 30,
//         scale: 1.2,
//         duration: 12,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut",
//       });
//     }

//     if (blob2Ref.current) {
//       gsap.to(blob2Ref.current, {
//         x: -40,
//         y: -20,
//         scale: 1.1,
//         duration: 15,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut",
//       });
//     }
//   }, []);

//   return (
//     <section
//       ref={sectionRef}
//       className="relative py-28 overflow-hidden rounded-3xl"
//     >
//       {/* ===== Unique Background ===== */}
//       <div className="absolute inset-0 bg-black/90 z-0">
//         {/* Blob 1 */}
//         <div
//           ref={blob1Ref}
//           className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/40 blur-3xl rounded-full"
//         />
//         {/* Blob 2 */}
//         <div
//           ref={blob2Ref}
//           className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/40 blur-3xl rounded-full"
//         />
//         {/* Subtle radial gradient overlay */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#7f5af0,_transparent_70%)] mix-blend-overlay" />
//       </div>

//       {/* ===== Content ===== */}
//       <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.7 }}
//           className="space-y-8"
//         >
//           {/* Badge */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={
//               isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
//             }
//             transition={{ duration: 0.5 }}
//             className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
//           >
//             <span className="text-sm font-semibold text-white">
//               🚀 Ready to boost your productivity?
//             </span>
//           </motion.div>

//           {/* Heading */}
//           <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
//             Start Organizing Your Tasks Today
//           </h2>

//           {/* Description */}
//           <p className="text-lg text-white/90 max-w-2xl mx-auto">
//             Join thousands of productive people who trust TaskFlow to manage
//             their daily tasks and achieve their goals.
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
//             <Link
//               href="/auth/signup"
//               className="px-8 py-4 bg-white text-purple-600 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
//             >
//               Get Started Free
//             </Link>
//             <Link
//               href="/about"
//               className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white hover:bg-white/10 transform hover:scale-105 transition-all duration-200"
//             >
//               Learn More
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { fadeInUp } from "../../lib/animations";

export default function CallToAction() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  /* ===== GSAP GRADIENT MOTION ===== */
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
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* ===== Animated Gradient BG (Hero style) ===== */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[length:300%_300%]
        bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-cyan-400/40
        dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-cyan-900/50"
      />

      {/* Glow blobs */}
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-indigo-500/40 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-purple-500/40 blur-3xl rounded-full" />

      {/* ===== Content Card ===== */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="rounded-3xl p-12 sm:p-16
          bg-white/70 dark:bg-white/10
          backdrop-blur-xl border border-white/20
          shadow-2xl text-center space-y-8"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4 }}
            className="inline-flex px-5 py-2 rounded-full
            bg-indigo-500/10 text-indigo-600 dark:text-indigo-300
            text-sm font-semibold"
          >
            🚀 Ready to boost your productivity?
          </motion.span>

          {/* Heading */}
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl
            font-extrabold text-foreground leading-tight"
          >
            Start Organizing <br className="hidden sm:block" />
            Your Tasks Today
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of focused people using{" "}
            <span className="font-semibold">TaskFlow</span> to plan better, work
            smarter, and achieve more every day.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-4">
            <Link
              href="/auth/signup"
              className="px-10 py-4 rounded-xl
              bg-indigo-600 text-white text-lg font-semibold
              shadow-xl hover:shadow-2xl
              hover:scale-105 transition"
            >
              Get Started Free
            </Link>

            <Link
              href="/about"
              className="px-10 py-4 rounded-xl
              border border-border bg-background/80
              text-foreground text-lg font-semibold
              hover:bg-muted hover:scale-105 transition"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 pt-6 text-sm text-muted-foreground"
          >
            <span>✓ No credit card required</span>
            <span>✓ Free forever</span>
            <span>✓ Setup in 30 seconds</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
