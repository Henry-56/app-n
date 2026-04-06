"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Search, Filter } from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function SalesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const datasetId = localStorage.getItem("selectedDatasetId");
        const url = datasetId ? `/api/dashboard?datasetId=${datasetId}` : "/api/dashboard";
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.activeDatasetId) {
            localStorage.setItem("selectedDatasetId", data.activeDatasetId);
        }
        
        setTransactions(data.recentTransactions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ModuleHeader 
        title="Módulo de Ventas"
        icon={<ShoppingCart className="w-10 h-10" />}
        description="Analiza cada transacción histórica del dataset seleccionado."
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                 type="text" 
                 placeholder="Buscar venta..." 
                 className="pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none w-64 shadow-sm"
              />
           </div>
           <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px] text-slate-400 font-bold">Cargando transacciones...</div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
             <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
             <p className="font-bold">No hay transacciones disponibles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Producto</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{t.data.Date || "Sin fecha"}</td>
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-800">{t.data.Product}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                          {t.data.Category || "General"}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{t.data.Customer || "Consumidor Final"}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">
                       ${Number(t.data.Sales).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
