// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// PAKSA NEXT.JS UNTUK TIDAK MELAKUKAN STATIC RENDERING PADA SISTEM AUTH
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };