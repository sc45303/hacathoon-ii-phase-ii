// "use client";

// import { useEffect, useRef } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { gsap } from "gsap";

// export default function Hero() {
//   const bgRef = useRef<HTMLDivElement>(null);
//   const titleRef = useRef<HTMLHeadingElement>(null);
//   const sceneRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!sceneRef.current) return;

//     const cards = sceneRef.current.querySelectorAll(".todo-card");

//     gsap.fromTo(
//       cards,
//       {
//         rotateY: -25,
//         rotateX: 15,
//         y: 40,
//         opacity: 0,
//       },
//       {
//         rotateY: 0,
//         rotateX: 0,
//         y: 0,
//         opacity: 1,
//         stagger: 0.2,
//         duration: 1,
//         ease: "power3.out",
//       }
//     );

//     gsap.to(cards, {
//       y: "-=20",
//       rotateY: "+=5",
//       duration: 3,
//       repeat: -1,
//       yoyo: true,
//       ease: "sine.inOut",
//       stagger: {
//         each: 0.3,
//         yoyo: true,
//       },
//     });
//     /* ===== Background Gradient Motion ===== */
//     if (bgRef.current) {
//       gsap.to(bgRef.current, {
//         backgroundPosition: "200% 200%",
//         duration: 20,
//         repeat: -1,
//         yoyo: true,
//         ease: "linear",
//       });
//     }

//     /* ===== Typewriter + Reveal ===== */
//     if (titleRef.current) {
//       const text = titleRef.current.innerText;
//       titleRef.current.innerHTML = "";

//       text.split("").forEach((char, i) => {
//         const span = document.createElement("span");
//         span.innerText = char === " " ? "\u00A0" : char;
//         span.style.opacity = "0";
//         titleRef.current?.appendChild(span);

//         gsap.to(span, {
//           opacity: 1,
//           y: 0,
//           delay: i * 0.04,
//           duration: 0.3,
//           ease: "power2.out",
//         });
//       });
//     }
//   }, []);

//   return (
//     <section className="relative min-h-screen overflow-hidden flex items-center">
//       {/* ===== Animated Background ===== */}
//       <div
//         ref={bgRef}
//         className="absolute inset-0 bg-[length:300%_300%] bg-gradient-to-br
//         from-indigo-500/30 via-purple-500/30 to-cyan-400/30
//         dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-cyan-900/40"
//       />

//       {/* Glow blobs */}
//       <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/40 blur-3xl rounded-full animate-pulse" />
//       <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/40 blur-3xl rounded-full animate-pulse delay-1000" />

//       {/* ===== Content ===== */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//         {/* LEFT */}
//         <div className="space-y-8">
//           <motion.span
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="inline-block px-4 py-2 rounded-full
//             bg-white/70 dark:bg-white/10 backdrop-blur
//             text-sm font-semibold text-foreground"
//           >
//             🚀 Next-Gen Task Management
//           </motion.span>

//           <h1
//             ref={titleRef}
//             className="text-4xl sm:text-5xl xl:text-6xl font-extrabold
//             text-foreground leading-tight"
//           >
//             Focus Smarter. <br /> Achieve Faster.
//           </h1>

//           <p className="text-lg text-muted-foreground max-w-xl">
//             Plan, track, and complete tasks with a clean workflow designed for
//             focus and speed. No clutter. Just productivity.
//           </p>

//           <div className="flex flex-wrap gap-4">
//             <Link
//               href="/auth/signup"
//               className="px-8 py-4 rounded-xl bg-indigo-600 text-white
//               font-semibold shadow-lg hover:scale-105 transition"
//             >
//               Start Free
//             </Link>

//             <Link
//               href="/auth/signin"
//               className="px-8 py-4 rounded-xl border border-border
//               bg-background text-foreground font-semibold
//               hover:bg-muted transition"
//             >
//               Sign In
//             </Link>
//           </div>
//         </div>

//         {/* RIGHT – Visual Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="relative"
//         >
//           <div
//             className="rounded-2xl p-6 bg-white/70 dark:bg-white/10
//             backdrop-blur-xl shadow-2xl border border-white/20"
//           >
//             {/* ===== 3D TODO SCENE ===== */}
//             <div
//               ref={sceneRef}
//               className="relative perspective-[1200px] w-full h-[420px]"
//             >
//               {/* Card 1 */}
//               <div
//                 className="todo-card absolute top-0 left-12 w-72 p-5 rounded-2xl
//     bg-white/80 dark:bg-white/10 backdrop-blur-xl
//     shadow-2xl border border-white/20
//     transform-style-preserve-3d"
//               >
//                 <h4 className="font-semibold text-foreground mb-3">
//                   Today’s Tasks
//                 </h4>

//                 <ul className="space-y-3">
//                   <li className="flex items-center gap-2 text-sm">
//                     <span className="w-3 h-3 rounded-full bg-green-500" />
//                     100 Push Ups
//                   </li>
//                   <li className="flex items-center gap-2 text-sm">
//                     <span className="w-3 h-3 rounded-full bg-indigo-500" />
//                     10km Run
//                   </li>
//                   <li className="flex items-center gap-2 text-sm">
//                     <span className="w-3 h-3 rounded-full bg-gray-400" />
//                     100 Squats
//                   </li>
//                 </ul>
//               </div>

//               {/* Card 2 */}
//               <div
//                 className="todo-card absolute top-24 right-0 w-64 p-5 rounded-2xl
//     bg-white/70 dark:bg-white/5 backdrop-blur-xl
//     shadow-xl border border-white/20
//     rotate-[-6deg]"
//               >
//                 <h4 className="text-sm font-semibold text-foreground mb-2">
//                   Progress
//                 </h4>

//                 <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
//                   <div className="h-full w-[70%] bg-indigo-500 rounded-full" />
//                 </div>

//                 <p className="text-xs mt-2 text-muted-foreground">
//                   7 of 10 tasks completed
//                 </p>
//               </div>

//               {/* Floating Check */}
//               <div
//                 className="todo-card absolute bottom-4 left-1/2 -translate-x-1/2
//     w-40 h-40 rounded-full flex items-center justify-center
//     bg-gradient-to-br from-indigo-500 to-purple-600
//     text-white text-4xl font-bold shadow-2xl"
//               >
//                 ✓
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

//// other ui //////////

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    /* ===== GSAP Animated Gradient Background ===== */
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        backgroundPosition: "200% 200%",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "linear",
      });
    }

    /* ===== Title Type Reveal ===== */
    if (titleRef.current) {
      const text = titleRef.current.innerText;
      titleRef.current.innerHTML = "";

      text.split("").forEach((char, i) => {
        const span = document.createElement("span");
        span.innerText = char === " " ? "\u00A0" : char;
        span.style.opacity = "0";
        titleRef.current?.appendChild(span);

        gsap.to(span, {
          opacity: 1,
          delay: i * 0.04,
          duration: 0.25,
          ease: "power2.out",
        });
      });
    }

    /* ===== Task Flow Motion ===== */
    if (flowRef.current) {
      const items = flowRef.current.querySelectorAll(".flow-item");

      gsap.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 1,
          ease: "power3.out",
        }
      );

      gsap.to(items, {
        y: "-=14",
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.3,
          yoyo: true,
        },
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ===== GSAP BACKGROUND ===== */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[length:300%_300%] bg-gradient-to-br
        from-indigo-500/30 via-purple-500/30 to-cyan-400/30
        dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-cyan-900/40"
      />

      {/* Glow blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/40 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/40 blur-3xl rounded-full animate-pulse delay-1000" />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* LEFT */}
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur text-sm font-semibold">
            ⚡ Built for Focused Work
          </span>

          <h1
            ref={titleRef}
            className="text-5xl xl:text-6xl font-extrabold leading-tight text-foreground"
          >
            Turn Tasks <br /> Into Progress.
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            A modern task manager designed around clarity, flow, and execution —
            so you always know what to do next.
          </p>

          <div className="flex gap-4">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>

            <Link
              href="/auth/signin"
              className="px-8 py-4 rounded-xl border border-border bg-background font-semibold hover:bg-muted transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* RIGHT – TASK FLOW */}
        <div
          ref={flowRef}
          className="relative w-full max-w-md mx-auto space-y-6"
        >
          {[
            {
              title: "Plan Tasks",
              tag: "Focus",
              color: "bg-indigo-500",
              w: "30%",
            },
            {
              title: "Work Deeply",
              tag: "In Progress",
              color: "bg-purple-500",
              w: "60%",
            },
            {
              title: "Ship & Finish",
              tag: "Done",
              color: "bg-emerald-500",
              w: "100%",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flow-item p-6 rounded-2xl
              bg-white/70 dark:bg-white/10 backdrop-blur-xl
              border border-white/20 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${item.color}`}
                >
                  {item.tag}
                </span>
              </div>

              <div className="mt-4 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: item.w }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
