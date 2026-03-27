"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from "recharts";
import { 
  TrendingUp, Users, Database, Brain, AlertTriangle, CheckCircle2, Upload, Sparkles, Loader2, Trash2 
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="text-slate-500 font-medium">Cargando tu ecosistema de datos...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Ejecutivo</h1>
          <p className="text-slate-500">{data?.company?.name} • {data?.company?.industry || "Pyme General"}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
                if (!confirm("¿Estás seguro de resetear toda la data? Esta acción no se puede deshacer.")) return;
                setLoading(true);
                try {
                    await fetch("/api/dashboard/reset", { method: "POST" });
                    router.push("/datasets/upload");
                } catch (e) {
                    alert("Error al resetear la data");
                } finally {
                    setLoading(false);
                }
            }}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Reiniciar Datos
          </button>
          <button 
            onClick={() => router.push("/datasets/upload")}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Cargar Datos
          </button>
          <button 
            disabled={!data?.stats?.latestDatasetId || loading}
            onClick={async () => {
                if (!data?.stats?.latestDatasetId) return;
                setLoading(true);
                try {
                    await fetch("/api/analytics/analyze", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ datasetId: data.stats.latestDatasetId }),
                    });
                    // Reload data
                    const res = await fetch("/api/dashboard");
                    const newData = await res.json();
                    setData(newData);
                } catch (e) {
                    alert("Error al generar el análisis");
                } finally {
                    setLoading(false);
                }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Nuevo Análisis</>}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Database className="text-indigo-600"/>} title="Datasets" value={data?.stats?.datasets || 0} label="Archivos cargados" />
        <StatCard icon={<TrendingUp className="text-emerald-600"/>} title="Ventas Totales" value={data?.stats?.totalSales || "$0.00"} label="Acumulado histórico" />
        <StatCard icon={<Users className="text-blue-600"/>} title="Ticket Promedio" value={data?.stats?.avgTicket || "$0.00"} label="Por transacción" />
        <StatCard icon={<Brain className="text-purple-600"/>} title="Análisis IA" value={data?.stats?.latestAnalysis ? "Activo" : "Pendiente"} label={data?.stats?.latestAnalysis ? "Último hoy" : "Generar ahora"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" /> Tendencia de Ventas
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">DIARIO</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.charts?.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" /> Últimos Movimientos
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                            <th className="pb-3 px-2">Fecha</th>
                            <th className="pb-3 px-2">Producto</th>
                            <th className="pb-3 px-2">Categoría</th>
                            <th className="pb-3 px-2 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data?.recentTransactions?.map((tx: any, i: number) => (
                            <tr key={i} className="text-sm hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{tx.date}</td>
                                <td className="py-3 px-2 font-medium text-slate-700">{tx.product}</td>
                                <td className="py-3 px-2 text-slate-500">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] uppercase font-bold text-slate-500">
                                        {tx.category}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-right font-bold text-slate-900">${tx.sales}</td>
                            </tr>
                        )) || (
                            <tr><td colSpan={4} className="text-center py-8 text-slate-400">No hay datos recientes</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Distribución por Categoría
            </h3>
            <div className="h-[250px] w-full flex items-center justify-center">
                   {data?.charts?.categories?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.categories} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={80} />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                   ) : (
                       <p className="text-sm text-slate-400">Sin datos de categoría</p>
                   )}
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <Brain className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5 text-indigo-300" /> Hallazgos Clave IA
            </h3>
            <div className="space-y-4 relative z-10">
              {data?.stats?.latestAnalysis?.findings?.insights?.map((insight: string, i: number) => (
                <p key={i} className="text-sm text-indigo-100 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {insight}
                </p>
              )) || (
                <p className="text-sm text-indigo-200 opacity-70 italic">Esperando datos para generar insights estratégicos...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Recomendaciones Estratégicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.stats?.latestAnalysis?.recommendations?.map((rec: any, i: number) => (
            <div key={i} className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{rec.title}</h4>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{rec.description}</p>
                {rec.impact && <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">Impacto Proyectado</span>
                    <span className="text-xs font-bold text-indigo-600">{rec.impact}</span>
                </div>}
              </div>
            </div>
          )) || (
            <div className="col-span-full text-center py-10 text-slate-400">
              No hay recomendaciones generadas. Carga un dataset y ejecuta el análisis IA.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, label }: { icon: React.ReactNode, title: string, value: any, label: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
        <p className="text-xs text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

const mockChartData = [
  { name: 'Ene', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Abr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];
