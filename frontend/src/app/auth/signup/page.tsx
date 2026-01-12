"use client";

import SignUpForm from "@/components/auth/SignUpForm";
import { AuthCard, AuthCardFooter } from "@/components/auth/AuthCard";
import { SocialAuthButton, SocialAuthDivider } from "@/components/auth/SocialAuthButton";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Get Started"
      subtitle="Create your account and start organizing"
      icon={
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      }
      footer={
        <AuthCardFooter>
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </AuthCardFooter>
      }
    >
      <SignUpForm
        onSuccess={() => {
          window.location.href = "/auth/signin";
        }}
      />

      {/* Optional: Social Auth Section */}
      {/* Uncomment to enable social authentication */}
      {/*
      <SocialAuthDivider />
      <div className="space-y-3">
        <SocialAuthButton provider="google" onClick={() => console.log('Google auth')} />
        <SocialAuthButton provider="github" onClick={() => console.log('GitHub auth')} />
      </div>
      */}
    </AuthCard>
  );
}
