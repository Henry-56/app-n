"use client";

import { useState, useEffect } from "react";
import { Megaphone, BarChart3, PieChart, Coins } from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function MarketingPage() {
  const [channels, setChannels] = useState<any[]>([]);
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
        
        const getVal = (obj: any, key: string) => {
            const lowKey = key.toLowerCase();
            const foundKey = Object.keys(obj || {}).find(k => k.toLowerCase() === lowKey);
            return foundKey ? obj[foundKey] : undefined;
        };

        const channelMap: Record<string, any> = {};
        data.recentTransactions?.forEach((t: any) => {
            const rawData = t.data || {};
            const name = getVal(rawData, "MarketingChannel") || getVal(rawData, "Channel") || "Orgánico / Directo";
            const spend = Number(getVal(rawData, "MarketingSpend") || getVal(rawData, "Spend") || 0);
            const sales = Number(getVal(rawData, "Sales") || getVal(rawData, "Revenue") || 0);

            if (!channelMap[name]) {
                channelMap[name] = { 
                    name, 
                    totalSpend: 0, 
                    totalRevenue: 0,
                    conversionCount: 0
                };
            }
            channelMap[name].totalSpend += spend;
            channelMap[name].totalRevenue += sales;
            channelMap[name].conversionCount += 1;
        });
        
        setChannels(Object.values(channelMap).sort((a,b) => b.totalRevenue - a.totalRevenue));
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
        title="Rendimiento de Marketing"
        icon={<Megaphone className="w-10 h-10" />}
        description="Analiza la eficiencia de cada canal de adquisición del dataset."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatsCard 
            title="Canal más Rentable" 
            value={channels[0]?.name || "N/A"} 
            desc={`${channels[0]?.conversionCount || 0} conversiones logradas`}
            icon={<BarChart3 className="text-emerald-600" />} 
         />
         <StatsCard 
            title="Inversión Total" 
            value={`$${channels.reduce((acc, c) => acc + c.totalSpend, 0).toLocaleString()}`} 
            desc="Gasto en pauta publicitaria"
            icon={<Coins className="text-amber-600" />} 
         />
         <StatsCard 
            title="ROI Promedio" 
            value={channels.length > 0 ? `${(channels.reduce((acc, c) => acc + c.totalRevenue, 0) / (channels.reduce((acc, c) => acc + c.totalSpend, 0) || 1)).toFixed(1)}x` : "0x"} 
            desc="Retorno de inversión estimado"
            icon={<PieChart className="text-indigo-600" />} 
         />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-[500px] text-slate-400 font-bold">Calculando ROI por canal...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Canal</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Conversiones</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Inversión</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ingresos (Ventas)</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Eficiencia (ROI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {channels.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <span className="text-sm font-black text-slate-800">{c.name}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase">
                          {c.conversionCount} Ventas
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right text-slate-500 font-bold">${c.totalSpend.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">${c.totalRevenue.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                       <span className={`px-4 py-1.5 rounded-xl text-xs font-black
                          ${(c.totalRevenue / (c.totalSpend || 1)) >= 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {((c.totalRevenue / (c.totalSpend || 1))).toFixed(2)}x
                       </span>
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
