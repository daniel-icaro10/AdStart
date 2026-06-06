import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

// Handler do NextAuth para App Router. Reutiliza authOptions de @/lib/auth.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
