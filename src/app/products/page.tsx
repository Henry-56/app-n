"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, Zap, Target } from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
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
        
        // Aggregate products from transactions
        const prodMap: Record<string, any> = {};
        data.recentTransactions?.forEach((t: any) => {
            const name = t.data.Product || "Unknown";
            if (!prodMap[name]) {
                prodMap[name] = { 
                    name, 
                    totalSales: 0, 
                    count: 0, 
                    category: t.data.Category || "Otros" 
                };
            }
            prodMap[name].totalSales += Number(t.data.Sales || 0);
            prodMap[name].count += Number(t.data.Quantity || 1);
        });
        
        setProducts(Object.values(prodMap).sort((a,b) => b.totalSales - a.totalSales));
      } catch (e: any) {
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
        title="Catálogo de Productos"
        icon={<Package className="w-10 h-10" />}
        description="Rendimiento detallado por SKU y categoría."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard 
            title="Producto Top" 
            value={products[0]?.name || "N/A"} 
            desc="Líder en facturación"
            icon={<TrendingUp className="text-emerald-600" />} 
         />
         <StatsCard 
            title="Ventas Totales" 
            value={products.reduce((acc, p) => acc + p.count, 0).toString()} 
            desc="Unidades desplazadas"
            icon={<Zap className="text-amber-600" />} 
         />
         <StatsCard 
            title="Eficiencia" 
            value="84%" 
            desc="Margen estimado"
            icon={<Target className="text-indigo-600" />} 
         />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px] text-slate-400 font-bold">Analizando inventario...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Producto</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Unidades</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Facturación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-800">{p.name}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase">
                          {p.category}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center font-bold text-slate-500">
                       {p.count}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 md:group-hover:text-indigo-600 transition-colors">
                       ${p.totalSales.toLocaleString()}
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

function StatsCard({ title, value, desc, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}

