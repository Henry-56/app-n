"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Star, Activity } from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
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
        
        const customerMap: Record<string, any> = {};
        data.recentTransactions?.forEach((t: any) => {
            const name = t.data.Customer || "Consumidor Final";
            if (!customerMap[name]) {
                customerMap[name] = { 
                    name, 
                    totalRevenue: 0, 
                    transactionCount: 0,
                    avgTicket: 0
                };
            }
            customerMap[name].totalRevenue += Number(t.data.Sales || 0);
            customerMap[name].transactionCount += 1;
        });
        
        setCustomers(Object.values(customerMap).sort((a,b) => b.totalRevenue - a.totalRevenue));
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
        title="Cartera de Clientes"
        icon={<Users className="w-10 h-10" />}
        description="Fidelización y rentabilidad de tu base de clientes."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard 
            title="Socio Estratégico" 
            value={customers[0]?.name || "N/A"} 
            desc={`${customers[0]?.transactionCount || 0} compras recurrentes`}
            icon={<UserCheck className="text-indigo-600" />} 
         />
         <StatsCard 
            title="CLV Promedio" 
            value={`$${(customers.reduce((acc, c) => acc + c.totalRevenue, 0) / (customers.length || 1)).toLocaleString()}`} 
            desc="Valor de vida del cliente"
            icon={<Star className="text-amber-600" />} 
         />
         <StatsCard 
            title="Actividad Semanal" 
            value="+12%" 
            desc="Tasa de retención"
            icon={<Activity className="text-emerald-600" />} 
         />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px] text-slate-400 font-bold">Cargando base de clientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Frecuencia</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ticket Promedio</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">LTV (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-800">{c.name}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase">
                          {c.transactionCount} Transacciones
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-400">
                       ${(c.totalRevenue / c.transactionCount).toFixed(0)}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">
                       ${c.totalRevenue.toLocaleString()}
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
