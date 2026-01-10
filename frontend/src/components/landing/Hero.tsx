"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { fadeInUp } from "../../lib/animations";
export default function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const floatingRef1 = useRef<HTMLDivElement>(null);
  const floatingRef2 = useRef<HTMLDivElement>(null);
  const floatingRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP text reveal animation
    if (titleRef.current) {
      const chars = titleRef.current.textContent?.split("") || [];
      titleRef.current.innerHTML = chars
        .map(
          (char) =>
            `<span class="inline-block">${
              char === " " ? "&nbsp;" : char
            }</span>`
        )
        .join("");

      gsap.from(titleRef.current.children, {
        opacity: 0,
        y: 50,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: "back.out(1.7)",
      });
    }

    // Floating elements animation
    if (floatingRef1.current) {
      gsap.to(floatingRef1.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    if (floatingRef2.current) {
      gsap.to(floatingRef2.current, {
        y: -30,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 0.5,
      });
    }

    if (floatingRef3.current) {
      gsap.to(floatingRef3.current, {
        y: -25,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: 1,
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={floatingRef1}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <div
          ref={floatingRef2}
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <div
          ref={floatingRef3}
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-blue-200"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700">
              Simple. Powerful. Efficient.
            </span>
          </motion.div>

          {/* Main Heading */}
          <div>
            <h1
              ref={titleRef}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
            >
              Organize Your Life,
            </h1>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              One Task at a Time.
            </h1>
          </div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto"
          >
            Stay focused, boost productivity, and achieve your goals with our
            intuitive task management platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-wrap justify-center gap-8 pt-12"
          >
            {[
              { icon: "✓", text: "Easy to Use" },
              { icon: "⚡", text: "Lightning Fast" },
              { icon: "🔒", text: "Secure & Private" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-700"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center text-gray-600"
        >
          <span className="text-sm font-medium mb-2">Scroll to explore</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
