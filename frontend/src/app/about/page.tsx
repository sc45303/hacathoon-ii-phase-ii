'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function AboutPage() {
  const missionRef = useRef(null);
  const howItWorksRef = useRef(null);
  const whyChooseRef = useRef(null);

  const isMissionInView = useInView(missionRef, { once: true, margin: '-100px' });
  const isHowItWorksInView = useInView(howItWorksRef, { once: true, margin: '-100px' });
  const isWhyChooseInView = useInView(whyChooseRef, { once: true, margin: '-100px' });

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds with just your email. No credit card required, no complicated setup.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Add Your Tasks',
      description: 'Start adding tasks immediately. Organize them with descriptions, set priorities, and track progress.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Stay Organized',
      description: 'Filter, sort, and manage your tasks effortlessly. Focus on what matters and get things done.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const benefits = [
    {
      title: 'Simple & Intuitive',
      description: 'Clean interface designed for ease of use. No learning curve, just start organizing.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Fast & Reliable',
      description: 'Built with modern technology for instant updates and zero lag.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Secure by Default',
      description: 'Your data is encrypted and protected. We take your privacy seriously.',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Always Free',
      description: 'Core features are free forever. No hidden costs, no premium tiers.',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-6"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
              About TaskFlow
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe productivity should be simple, not complicated. TaskFlow helps you organize your life without the overwhelm.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section ref={missionRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isMissionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-100"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              TaskFlow was created to solve a simple problem: task management tools are often too complex. We wanted to build something different—a tool that gets out of your way and lets you focus on what matters.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our mission is to help people stay organized and productive without adding stress or complexity to their lives. Whether you're managing personal tasks or professional projects, TaskFlow adapts to your workflow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHowItWorksInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isHowItWorksInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                className="relative"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                  <div className="text-6xl font-bold text-blue-100 mb-4">{step.number}</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section ref={whyChooseRef} className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isWhyChooseInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose TaskFlow?</h2>
            <p className="text-xl text-gray-600">Built with your productivity in mind</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isWhyChooseInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl mb-4 shadow-md`}></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-12 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Organized?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of productive people using TaskFlow today.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
