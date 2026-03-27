import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Predictive SME Analytics | AI Business Intelligence",
  description: "Sistema de analítica predictiva basado en Gemini para optimizar pymes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`} suppressHydrationWarning>
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-xl font-bold tracking-tight text-slate-800 underline decoration-indigo-500 decoration-2 underline-offset-4">SME Analytics</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors font-semibold">Dashboard Admin</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">© 2026 SME Analytics Prototype - Desarrollado para Tesis/Prototipo Profesional</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
