import { withAuth } from "next-auth/middleware";

/**
 * Protege todas as rotas /admin/* exigindo um JWT de sessão válido.
 * Sem sessão → o NextAuth redireciona automaticamente para /login.
 * O matcher garante que apenas /admin/* passe pelo middleware.
 */
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
