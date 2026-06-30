// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Tambahkan logika ekstra di sini jika kelak Anda butuh role "ADMIN"
    // Untuk saat ini, asalkan user sudah login, dia bisa masuk ke Terminal.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Jika token ada (user sudah login), izinkan akses (true)
        // Jika tidak ada, tolak (false) dan lempar ke halaman login
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    }
  }
);

// Tentukan rute mana saja yang dikunci secara absolut oleh middleware ini
export const config = {
  matcher: [
    "/terminal/:path*", // Kunci seluruh rute root access terminal
  ],
};