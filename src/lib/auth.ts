import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { checkLoginRateLimit } from "@/lib/rate-limit";

/** Extrai o IP do cliente a partir dos headers (proxy-aware). */
function getClientIp(req: { headers?: Record<string, string> } | undefined): string {
  const headers = req?.headers ?? {};
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers["x-real-ip"] ?? "unknown";
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        // 1. Rate limit por IP — barra força bruta antes de tocar o banco.
        const ip = getClientIp(req as { headers?: Record<string, string> });
        const rl = checkLoginRateLimit(ip);
        if (!rl.allowed) {
          throw new Error(
            `Muitas tentativas. Tente novamente em ${rl.retryAfterSeconds}s.`,
          );
        }

        // 2. Validação de entrada com Zod.
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // 3. Busca o usuário e compara o hash bcrypt.
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          // Compara contra um hash dummy para evitar timing attack (user enumeration).
          await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinv");
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "ADMIN";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
