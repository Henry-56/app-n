"use client";

import { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  Download, 
  AlertCircle, 
  Brain, 
  Target, 
  Loader2,
  Database,
  Megaphone,
  Truck
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
} from "recharts";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const syncAttempted = useRef(false);
  const router = useRouter();

  const fetchData = async () => {
    const datasetId = typeof window !== "undefined" ? localStorage.getItem("selectedDatasetId") : null;
    try {
      const url = datasetId ? `/api/dashboard?datasetId=${datasetId}` : "/api/dashboard";
      const res = await fetch(url);
      const d = await res.json();
      setData(d);
      if (d.activeDatasetId && typeof window !== "undefined") {
        localStorage.setItem("selectedDatasetId", d.activeDatasetId);
        
        // Auto-Sync Trigger: If Analysis is missing, trigger it once in background
        if (!d.stats?.analysis && !syncAttempted.current) {
            console.log("Dashboard: No analysis found, auto-syncing in background...");
            syncAttempted.current = true;
            fetch("/api/analytics/reanalyze", {
                method: "POST",
                body: JSON.stringify({ datasetId: d.activeDatasetId })
            }); // Automatic sync, UI will update on next regular flow or manual navigation
        }
      }
    } catch (e: any) {
      console.error("Error fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="relative">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-400" />
            </div>
        </div>
        <p className="text-slate-500 font-bold mt-6 animate-pulse">Sincronizando con el motor de IA...</p>
      </div>
    );
  }

  if (!data?.activeDatasetId && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
          <Database className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Ecosistema sin datos</h2>
        <p className="text-slate-500 mt-3 max-w-md text-lg">Para activar la inteligencia predictiva, selecciona o sube un dataset en el gestor.</p>
        <button 
          onClick={() => router.push("/datasets")}
          className="mt-10 px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 active:scale-95"
        >
          Gestionar Datasets <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const { stats, charts } = data;
  const analysis = stats.analysis;
  const predictions = stats.predictions;
  const COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"];

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" /> Motor Predictivo Activo
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
            Análisis de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{data.company.name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
             <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3 h-3 text-indigo-400" />
                Dataset: {data.activeDatasetName}
             </div>
             <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border
                ${stats.isDeterministic 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {stats.isDeterministic ? 'Modo Determinístico' : 'IA Gemini Activa'}
             </div>
          </div>
          <p className="mt-4 text-slate-400 text-lg font-medium">
             Visualiza el rendimiento histórico y las proyecciones de demanda.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => router.push("/datasets")}
            className="flex-1 lg:flex-none px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl hover:border-indigo-200 transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            Historial de Datos
          </button>
          <button 
            onClick={() => router.push("/reports")}
            className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
          >
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" /> Exportar Reporte
          </button>
        </div>
      </div>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <KPIBox 
          icon={<DollarSign className="w-7 h-7" />}
          title="Ventas Totales"
          value={stats.totalSales}
          trend={stats.aiTopChannel ? `Canal: ${stats.aiTopChannel}` : "Sincronizado"}
          variant="indigo"
        />
        <KPIBox 
          icon={<TrendingUp className="w-7 h-7" />}
          title="Segmento Estrella"
          value={stats.aiWinnerProduct || "General"}
          variant="emerald"
          trend={stats.topProductImpact || "Líder de Ventas"}
        />
      </div>

      {/* AI Strategic Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StrategicPill 
            title="Marketing" 
            value={stats.strategicConsultation?.marketing?.targetChannel || "Pendiente"} 
            icon={<Megaphone className="w-4 h-4" />}
            color="indigo" 
        />
        <StrategicPill 
            title="Producto Top" 
            value={stats.strategicConsultation?.product?.winningProduct || "Pendiente"} 
            icon={<TrendingUp className="w-4 h-4" />}
            color="emerald" 
        />
        <StrategicPill 
            title="Socio Clave" 
            value={stats.strategicConsultation?.supplier?.topSupplier || "Pendiente"} 
            icon={<Truck className="w-4 h-4" />}
            color="amber" 
        />
        <StrategicPill 
            title="Cliente VIP" 
            value={stats.strategicConsultation?.customer?.topCustomer || "Pendiente"} 
            icon={<Users className="w-4 h-4" />}
            color="blue" 
        />
      </div>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        {/* Sales Area Chart */}
        <div className="xl:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
            <div>
              <h4 className="text-2xl font-black text-slate-900">Evolución y Predicción</h4>
              <p className="text-slate-400 font-medium mt-1">Comparativa de ventas reales vs proyecciones inteligentes.</p>
            </div>
            <div className="flex items-center gap-6">
                <LegendItem color="#6366f1" label="Historial" />
                <LegendItem color="#c7d2fe" label="Proyección" />
            </div>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.trend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                    dy={15}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  formatter={(value: any, name: any, props: any) => {
                    const isPred = props.payload.isPrediction || name === "Proyección IA";
                    return [
                        `$${value.toLocaleString()}`, 
                        isPred ? "Proyección IA" : "Ventas Reales"
                    ];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="salesReal" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="salesProjected" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Bar Chart */}
        <div className="xl:col-span-2 bg-indigo-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-12">
                <h4 className="text-2xl font-black text-white">Demanda Esperada</h4>
                <p className="text-indigo-200 font-medium mt-1">Categorías con mayor potencial de rotación.</p>
            </div>
            <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.demandProjection.length > 0 ? charts.demandProjection : charts.categories.slice(0, 5)}>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#818cf8', fontSize: 11, fontWeight: 700}} 
                    />
                    <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ borderRadius: '20px', border: 'none', background: '#1e1b4b', color: '#fff' }} 
                    />
                    <Bar dataKey={charts.demandProjection.length > 0 ? "quantity" : "value"} radius={[15, 15, 15, 15]} barSize={40}>
                        {charts.categories.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5 text-indigo-300" />
                    </div>
                    <p className="text-indigo-100 text-sm italic leading-relaxed">
                        "Optimiza el stock de <span className="font-black text-white">{charts.demandProjection[0]?.name || "tus productos top"}</span> basado en la tasa de aceleración detectada."
                    </p>
                </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 p-24 opacity-5 group-hover:scale-110 transition-transform duration-1000">
            <Database className="w-80 h-80 text-white" />
          </div>
        </div>
      </div>

      {/* AI Intelligence Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Automatic Insights */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl lg:col-span-1">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                <Brain className="w-7 h-7" />
             </div>
             <h4 className="text-2xl font-black text-slate-900">Insights IA</h4>
          </div>
          
          <div className="space-y-8">
            {analysis?.findings?.insights?.map((insight: string, i: number) => (
              <div key={i} className="flex gap-5 group items-start">
                <div className="mt-2 w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 group-hover:scale-150 transition-transform"></div>
                <p className="text-slate-600 text-lg font-medium leading-relaxed group-hover:text-slate-900 transition-colors">
                  {insight}
                </p>
              </div>
            )) || <p className="text-slate-400 italic text-center py-10">Generando inteligencia de negocios...</p>}
          </div>

          <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
            <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Justificación Basada en Datos</p>
            <p className="text-slate-300 text-sm leading-relaxed italic relative z-10">
              "{predictions?.justification || "Se han detectado patrones atípicos de compra. Gemine 2.0 recomienda supervisión de márgenes en categorías de alta rotación."}"
            </p>
            <Sparkles className="absolute -bottom-4 -right-4 w-20 h-20 text-white opacity-5 group-hover:opacity-10 transition-opacity" />
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <Target className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-black text-slate-900">Recomendaciones Estratégicas</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analysis?.recommendations?.map((rec: any, i: number) => (
              <div key={i} className="p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 hover:bg-slate-50 transition-all group flex flex-col justify-between">
                <div>
                  <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6
                    ${rec.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    Prioridad {rec.priority}
                  </div>
                  <h5 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{rec.title}</h5>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">{rec.description}</p>
                </div>
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Impacto</span>
                  <span className="text-sm font-bold text-indigo-600 px-4 py-1.5 bg-indigo-50 rounded-xl">{rec.impact}</span>
                </div>
              </div>
            )) || <p className="text-slate-400 italic text-center col-span-2 py-20">Analizando el mejor camino para tu negocio...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIBox({ icon, title, value, trend, variant }: { icon: any, title: string, value: string, trend: string, variant: string }) {
  const styles: any = {
    indigo: "bg-white border-slate-100 shadow-slate-200/40 text-slate-900 icon:bg-indigo-50 icon:text-indigo-600 trend:bg-emerald-50 trend:text-emerald-600",
    dark: "bg-slate-900 border-slate-800 shadow-slate-900/20 text-white icon:bg-white/10 icon:text-indigo-400 trend:bg-white/10 trend:text-indigo-300",
    emerald: "bg-white border-slate-100 text-slate-900 icon:bg-emerald-50 icon:text-emerald-600 trend:bg-emerald-50 trend:text-emerald-600",
    rose: "bg-white border-slate-100 text-slate-900 icon:bg-rose-50 icon:text-rose-600 trend:bg-rose-50 trend:text-rose-600",
    amber: "bg-white border-slate-100 text-slate-900 icon:bg-amber-50 icon:text-amber-600 trend:bg-amber-50 trend:text-amber-600",
  };

  const currentStyle = styles[variant] || styles.indigo;
  const isDark = variant === 'dark';

  return (
    <div className={`${currentStyle.split(' icon:')[0]} p-10 rounded-[2.5rem] border shadow-2xl transition-all hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentStyle.split('icon:')[1].split(' trend:')[0]}`}>
          {icon}
        </div>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentStyle.split('trend:')[1]}`}>
          {trend}
        </span>
      </div>
      <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold text-sm uppercase tracking-[0.1em]`}>{title}</p>
      <h3 className="text-4xl font-black mt-2 tracking-tight">{value}</h3>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
    );
}
function StrategicPill({ title, value, icon, color }: any) {
    const colors: any = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/30",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/30",
        amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/30",
        blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/30",
    };

    return (
        <div className={`px-6 py-4 rounded-2xl border flex items-center justify-between shadow-lg transition-all hover:scale-[1.02] ${colors[color] || colors.indigo}`}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
                    {icon}
                </div>
                <div className="overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{title}</p>
                    <p className="text-xs font-black truncate">{value}</p>
                </div>
            </div>
            <Sparkles className="w-3 h-3 opacity-30" />
        </div>
    );
}

