"use client";

import SignInForm from "@/components/auth/SignInForm";
import { AuthCard, AuthCardFooter } from "@/components/auth/AuthCard";
import { SocialAuthButton, SocialAuthDivider } from "@/components/auth/SocialAuthButton";
import Link from "next/link";

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your tasks"
      icon={
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      footer={
        <AuthCardFooter>
          <p>
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </AuthCardFooter>
      }
    >
      <SignInForm
        onSuccess={() => {
          window.location.href = "/";
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
