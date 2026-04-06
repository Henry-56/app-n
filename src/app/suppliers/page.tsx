"use client";

import { useState, useEffect } from "react";
import { Truck, ShieldCheck, Clock, Zap } from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
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
        
        const supplierMap: Record<string, any> = {};
        data.recentTransactions?.forEach((t: any) => {
            const name = t.data.Supplier || "Proveedor Genérico";
            if (!supplierMap[name]) {
                supplierMap[name] = { 
                    name, 
                    totalVolume: 0, 
                    transactionCount: 0,
                    categories: new Set()
                };
            }
            supplierMap[name].totalVolume += Number(t.data.Sales || 0);
            supplierMap[name].transactionCount += 1;
            if (t.data.Category) supplierMap[name].categories.add(t.data.Category);
        });
        
        setSuppliers(Object.values(supplierMap).sort((a,b) => b.totalVolume - a.totalVolume));
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
        title="Gestión de Proveedores"
        icon={<Truck className="w-10 h-10" />}
        description="Monitoriza el impacto de tu cadena de suministro en las ventas."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard 
            title="Proveedor Crítico" 
            value={suppliers[0]?.name || "N/A"} 
            desc={`${suppliers[0]?.transactionCount || 0} entregas procesadas`}
            icon={<ShieldCheck className="text-indigo-600" />} 
         />
         <StatsCard 
            title="Categorías Cubiertas" 
            value={suppliers.reduce((acc, s) => acc + s.categories.size, 0).toString()} 
            desc="Impacto en el inventario"
            icon={<Zap className="text-amber-600" />} 
         />
         <StatsCard 
            title="Nivel de Servicio" 
            value="98.5%" 
            desc="Cumplimiento estimado"
            icon={<Clock className="text-blue-600" />} 
         />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px] text-slate-400 font-bold">Cargando base de proveedores...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proveedor</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Especialidad</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Frecuencia</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Volumen de Compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {suppliers.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-800">{s.name}</span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">
                       {Array.from(s.categories).join(", ") || "General"}
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                          {s.transactionCount} Entregas
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">
                       ${s.totalVolume.toLocaleString()}
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
