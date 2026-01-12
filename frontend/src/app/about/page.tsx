"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function AboutPage() {
  const missionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const whyChooseRef = useRef(null);

  const isMissionInView = useInView(missionRef, {
    once: true,
    margin: "-100px",
  });
  const isHowItWorksInView = useInView(howItWorksRef, {
    once: true,
    margin: "-100px",
  });
  const isWhyChooseInView = useInView(whyChooseRef, {
    once: true,
    margin: "-100px",
  });

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ===== Animated Gradient Background (Theme Match) ===== */}
      <div
        className="absolute inset-0 bg-[length:300%_300%]
        bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-cyan-400/20
        animate-gradient-move"
      />

      {/* Glow blobs */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-indigo-500/30 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-purple-500/30 blur-3xl rounded-full animate-pulse delay-1000" />

      {/* ===== HERO ===== */}
      <section className="relative z-10 py-24 text-center px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="max-w-4xl mx-auto space-y-6"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur border border-white/20 font-semibold">
            ✨ About TaskFlow
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground">
            Built for Focus. <br /> Designed for Flow.
          </h1>

          <p className="text-xl text-muted-foreground">
            TaskFlow removes clutter and helps you focus on what truly matters —
            without complexity.
          </p>
        </motion.div>
      </section>

      {/* ===== MISSION ===== */}
      <section ref={missionRef} className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            animate={
              isMissionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
            }
            transition={{ duration: 0.7 }}
            className="bg-white/70 dark:bg-white/10 backdrop-blur-xl
            rounded-3xl p-10 border border-white/20 shadow-2xl"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Productivity tools shouldn’t slow you down. TaskFlow exists to
              simplify task management so you can stay focused, calm, and in
              control — every single day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={howItWorksRef} className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            animate={
              isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
            }
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-16"
          >
            How It Works
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isHowItWorksInView ? "visible" : "hidden"}
            className="grid md:grid-cols-3 gap-8"
          >
            {["Create", "Plan", "Execute"].map((step, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -8, rotateX: 6 }}
                className="relative perspective-[1000px]"
              >
                <div
                  className="bg-white/70 dark:bg-white/10 backdrop-blur-xl
                  rounded-3xl p-8 border border-white/20 shadow-xl
                  transform-style-preserve-3d"
                >
                  <div className="text-6xl font-extrabold text-indigo-400/30 mb-4">
                    0{i + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step}</h3>
                  <p className="text-muted-foreground">
                    Simple steps that keep you moving forward without friction.
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== WHY CHOOSE ===== */}
      <section ref={whyChooseRef} className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            animate={
              isWhyChooseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
            }
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Why TaskFlow?
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isWhyChooseInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              "Minimal & Clean",
              "Fast & Reliable",
              "Secure by Design",
              "Always Free",
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ scale: 1.04 }}
                className="bg-white/70 dark:bg-white/10 backdrop-blur-xl
                rounded-2xl p-6 border border-white/20 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-2">{item}</h3>
                <p className="text-muted-foreground">
                  Designed to feel effortless, fast, and calm — every time.
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center
          bg-gradient-to-r from-indigo-600 to-purple-600
          rounded-3xl p-14 shadow-2xl"
        >
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Start using TaskFlow and feel the difference today.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-10 py-4 bg-white text-indigo-600
            font-semibold rounded-xl shadow-lg hover:scale-105 transition"
          >
            Get Started Free
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
