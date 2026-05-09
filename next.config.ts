import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

const { combinedEnv } = loadEnvConfig(
  process.cwd(),
  process.env.NODE_ENV !== "production"
);

const supabaseUrl =
  combinedEnv.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "";
const supabaseAnon =
  combinedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/**
 * Edge Middleware no recibe `.env.local` igual que el runtime Node.
 * Pasar estas claves vía `env` (valores resueltos al cargar este archivo en Node)
 * hace que `process.env.NEXT_PUBLIC_*` exista también en el bundle del middleware.
 */
const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnon,
  },
};

export default nextConfig;
