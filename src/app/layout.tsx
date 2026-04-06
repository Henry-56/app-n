import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Predictive SME Analytics | AI Business Intelligence",
  description: "Sistema de analítica predictiva basado en Gemini para optimizar pymes.",
};

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  Megaphone, 
  BrainCircuit, 
  Database, 
  FileText,
  Menu,
  X
} from "lucide-react";
import ActiveDatasetStatus from "@/components/ActiveDatasetStatus";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex`} suppressHydrationWarning>
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-100 flex-col hidden lg:flex sticky top-0 h-screen">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">A</div>
              <span className="text-xl font-black tracking-tight text-slate-800">SME Analytics</span>
            </div>

            <nav className="space-y-1">
              <SidebarLink href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
              <div className="pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Análisis Modular</div>
              <SidebarLink href="/sales" icon={<ShoppingCart />} label="Ventas" />
              <SidebarLink href="/products" icon={<Package />} label="Productos" />
              <SidebarLink href="/customers" icon={<Users />} label="Clientes" />
              <SidebarLink href="/suppliers" icon={<Truck />} label="Proveedores" />
              <SidebarLink href="/marketing" icon={<Megaphone />} label="Marketing" />
              
              <div className="pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Inteligencia</div>
              <SidebarLink href="/ai-analysis" icon={<BrainCircuit />} label="IA Estrategia" highlight />
              
              <div className="pt-6 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Configuración</div>
              <SidebarLink href="/datasets" icon={<Database />} label="Datasets" />
              <SidebarLink href="/reports" icon={<FileText />} label="Reportes" />
            </nav>
          </div>

          <ActiveDatasetStatus />

          <div className="mt-auto p-8 border-t border-slate-50">
             <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">H</div>
                <div>
                   <p className="text-xs font-black text-slate-900">Henry Admin</p>
                   <p className="text-[10px] text-slate-400">Premium Plan</p>
                </div>
             </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
           <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8 lg:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <span className="text-lg font-bold tracking-tight">SME Analytics</span>
              </div>
              <Menu className="w-6 h-6 text-slate-600" />
           </header>
           <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label, highlight = false }: { href: string, icon: React.ReactNode, label: string, highlight?: boolean }) {
  return (
    <a 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
        ${highlight 
          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
    >
      <span className="w-5 h-5">{icon}</span>
      {label}
    </a>
  );
}
