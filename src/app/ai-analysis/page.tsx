"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BrainCircuit, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Truck, 
  Megaphone, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function AIAnalysisPage() {
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncAttempted = useRef(false);

  const fetchData = async () => {
    try {
      const datasetId = typeof window !== "undefined" ? localStorage.getItem("selectedDatasetId") : null;
      const url = datasetId 
        ? `/api/dashboard?datasetId=${datasetId}&t=${Date.now()}` 
        : `/api/dashboard?t=${Date.now()}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.activeDatasetId && typeof window !== "undefined") {
          localStorage.setItem("selectedDatasetId", data.activeDatasetId);
      }
      
      const foundConsultation = data.stats.analysis?.findings?.strategicConsultation;
      if (!foundConsultation && data.activeDatasetId && !syncAttempted.current) {
          console.log("No analysis found, auto-syncing once...");
          syncAttempted.current = true;
          await handleSyncInternal(data.activeDatasetId);
      } else {
          setConsultation(foundConsultation || null);
          setLoading(false);
      }
    } catch (e: any) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncInternal = async (id: string) => {
    setSyncing(true);
    try {
        await fetch("/api/analytics/reanalyze", {
            method: "POST",
            body: JSON.stringify({ datasetId: id })
        });
        // Re-fetch everything after sync
        const res = await fetch(`/api/dashboard?datasetId=${id}`);
        const data = await res.json();
        setConsultation(data.stats.analysis?.findings?.strategicConsultation || null);
    } catch (e: any) {
        console.error(e);
    } finally {
        setSyncing(false);
        setLoading(false);
    }
  };

  const handleSync = () => {
      const id = localStorage.getItem("selectedDatasetId");
      if (id) handleSyncInternal(id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
            <ModuleHeader 
                title="Inteligencia Estratégica IA"
                icon={<BrainCircuit className="w-10 h-10" />}
                description="Sugerencias y consultoría avanzada basada en el motor predictivo de Gemini."
            />
        </div>
        <button 
            onClick={handleSync}
            disabled={syncing}
            className={`mb-10 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all shadow-lg active:scale-95
                ${syncing 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100 shadow-indigo-100/50"}`}
        >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Inteligencia"}
        </button>
      </div>

      {!consultation && !loading ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Lightbulb className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-black text-slate-900">Sin Consultoría Estratégica</h2>
           <p className="text-slate-500 mt-2 max-w-md mx-auto font-medium">Por favor genera un nuevo análisis desde el Dashboard para activar las sugerencias de la IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Marketing */}
          <StrategyCard 
            title="Sugerencia de Marketing"
            icon={<Megaphone className="text-indigo-600" />}
            topic="MARKETING"
            badge={consultation?.marketing?.priority}
            content={consultation?.marketing?.suggestion}
            metricLabel="Canal Objetivo"
            metricValue={consultation?.marketing?.targetChannel}
            loading={loading}
          />

          {/* Card: Winning Product */}
          <StrategyCard 
            title="Producto Ganador"
            icon={<TrendingUp className="text-emerald-600" />}
            topic="PRODUCTO"
            content={consultation?.product?.suggestion}
            metricLabel="Top SKU"
            metricValue={consultation?.product?.winningProduct}
            reason={consultation?.product?.reason}
            loading={loading}
          />

          {/* Card: Best Supplier */}
          <StrategyCard 
            title="Mejor Proveedor"
            icon={<Truck className="text-amber-600" />}
            topic="PROVEEDORES"
            content={consultation?.supplier?.suggestion}
            metricLabel="Aliado Clave"
            metricValue={consultation?.supplier?.topSupplier}
            impact={consultation?.supplier?.impact}
            loading={loading}
          />

          {/* Card: Best Customer */}
          <StrategyCard 
            title="Segmento de Valor"
            icon={<Users className="text-blue-600" />}
            topic="CLIENTES"
            content={consultation?.customer?.suggestion}
            metricLabel="Cliente VIP"
            metricValue={consultation?.customer?.topCustomer}
            strategy={consultation?.customer?.loyaltyStrategy}
            loading={loading}
          />
        </div>
      )}

      {consultation && (
        <div className="bg-slate-900 p-12 rounded-[3rem] text-white overflow-hidden relative group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -mr-32 -mt-32 group-hover:bg-indigo-600/40 transition-all duration-700"></div>
           <h3 className="text-2xl font-black mb-4 relative z-10">¿Deseas profundizar en este análisis?</h3>
           <p className="text-slate-400 max-w-xl font-medium relative z-10">Nuestro motor puede generar un reporte ejecutivo personalizado con proyecciones a 12 meses y planes de acción específicos para tu industria.</p>
           <button className="mt-8 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all flex items-center gap-3 relative z-10 active:scale-95 shadow-xl shadow-indigo-500/20">
              Generar Reporte Premium
              <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      )}
    </div>
  );
}

function StrategyCard({ title, icon, topic, badge, content, metricLabel, metricValue, reason, impact, strategy, loading }: any) {
    if (loading) return <div className="h-80 bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"></div>;

    return (
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col h-full">
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                        {icon}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{topic}</p>
                        <h3 className="text-xl font-black text-slate-900 mt-1">{title}</h3>
                    </div>
                </div>
                {badge && (
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider
                        ${badge === 'ALTA' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        Prioridad {badge}
                    </span>
                )}
            </div>

            <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8 flex-grow">
                "{content}"
            </p>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 shadow-inner">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{metricLabel}:</span>
                    <span className="text-sm font-black text-slate-900">{metricValue}</span>
                </div>
                {(reason || impact || strategy) && (
                    <div className="pt-4 border-t border-slate-200">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Impacto / Estrategia</p>
                        <p className="text-xs font-bold text-indigo-600 italic">
                           {reason || impact || strategy}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

