import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-ready deployment — no static export
  // Can run locally with `npm run dev` or deploy to Vercel/Railway/any Node.js host
  images: {
    unoptimized: true,
  },
  // Environment variables that must be set for production
  // NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
  // NEXT_PUBLIC_SUPABASE_ANON_KEY - Supabase anon/public key
  // STRIPE_SECRET_KEY - Stripe secret key (server-side only)
  // STRIPE_WEBHOOK_SECRET - Stripe webhook signing secret
  // NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY - Stripe publishable key
};

export default nextConfig;
