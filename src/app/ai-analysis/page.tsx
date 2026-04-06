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
  RefreshCw,
  Search,
  Sparkles,
  Target,
  MessageSquare,
  Zap,
  Loader2
} from "lucide-react";
import ModuleHeader from "@/components/ModuleHeader";

export default function AIAnalysisPage() {
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncAttempted = useRef(false);

  // New States for Product Strategy
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productStrategy, setProductStrategy] = useState<any>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

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
      
      // Extract products for the new dropdown
      if (data.charts?.categories) {
          setProducts(data.charts.categories.map((c: any) => c.name));
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

  const handleProductStrategy = async () => {
    if (!selectedProduct) return;
    setLoadingStrategy(true);
    setProductStrategy(null);
    try {
        const id = localStorage.getItem("selectedDatasetId");
        const res = await fetch("/api/analytics/product-strategy", {
            method: "POST",
            body: JSON.stringify({ productName: selectedProduct, datasetId: id })
        });
        const data = await res.json();
        setProductStrategy(data);
    } catch (e: any) {
        console.error(e);
    } finally {
        setLoadingStrategy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 md:px-0">
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

      {/* --- SECCIÓN NUEVA: CONSULTORÍA POR PRODUCTO --- */}
      <div className="pt-20 border-t border-slate-200">
          <div className="mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Nueva: Consultoría por Producto</h3>
                  <p className="text-slate-500 font-medium">Selecciona un artículo en particular para recibir una estrategia de marketing a medida.</p>
              </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 mb-10">
              <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <select 
                      value={selectedProduct}
                      onChange={(e) => {
                          const newProduct = e.target.value;
                          setSelectedProduct(newProduct);
                          // Automatic Trigger
                          if (newProduct) {
                              setLoadingStrategy(true);
                              setProductStrategy(null);
                              const id = localStorage.getItem("selectedDatasetId");
                              fetch("/api/analytics/product-strategy", {
                                  method: "POST",
                                  body: JSON.stringify({ productName: newProduct, datasetId: id })
                              }).then(res => res.json()).then(data => {
                                  setProductStrategy(data);
                                  setLoadingStrategy(false);
                              }).catch(err => {
                                  console.error(err);
                                  setLoadingStrategy(false);
                              });
                          }
                      }}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                      <option value="">Selecciona un producto del catálogo...</option>
                      {products.map(p => (
                          <option key={p} value={p}>{p}</option>
                      ))}
                  </select>
                  {loadingStrategy && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    </div>
                  )}
              </div>
          </div>

          {productStrategy && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white md:col-span-2 relative overflow-hidden group">
                    <Lightbulb className="w-14 h-14 text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                    <h4 className="text-2xl font-black mb-2">Visión Estratégica</h4>
                    <p className="text-slate-400 font-medium text-lg italic leading-relaxed">"{productStrategy.reason}"</p>
                </div>

                <StrategyInfoCard 
                    title="Canal Recomendado"
                    icon={<Target className="w-6 h-6 text-indigo-600" />}
                    val={productStrategy.channel}
                    bg="bg-indigo-50"
                />
                <StrategyInfoCard 
                    title="Audiencia Objetivo"
                    icon={<Users className="w-6 h-6 text-emerald-600" />}
                    val={productStrategy.targetAudience}
                    bg="bg-emerald-50"
                />
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 md:col-span-2 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mensaje Sugerido (Copy)</p>
                        <p className="text-2xl font-black text-slate-900 line-clamp-2 italic">"{productStrategy.messaging}"</p>
                    </div>
                </div>

                <div className="bg-indigo-600 p-10 rounded-[3rem] text-white md:col-span-2 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Paso a seguir
                        </div>
                        <h4 className="text-3xl font-black mb-2">Acción Inmediata</h4>
                        <p className="text-indigo-100 font-medium text-lg">{productStrategy.action}</p>
                    </div>
                    <button className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-3">
                        Implementar ahora <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
          )}
      </div>

      {consultation && (
        <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white overflow-hidden relative group shadow-2xl shadow-slate-300">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -mr-32 -mt-32 group-hover:bg-indigo-600/40 transition-all duration-700"></div>
           <h3 className="text-3xl font-black mb-4 relative z-10">¿Deseas profundizar en este análisis?</h3>
           <p className="text-slate-400 max-w-xl font-medium text-lg leading-relaxed relative z-10">Nuestro motor puede generar un reporte ejecutivo personalizado con proyecciones a 12 meses y planes de acción específicos para tu industria.</p>
           <button className="mt-8 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all flex items-center gap-3 relative z-10 active:scale-95 shadow-xl shadow-indigo-500/30">
              Generar Reporte Premium
              <ArrowRight className="w-5 h-5 font-bold" />
           </button>
        </div>
      )}
    </div>
  );
}

function StrategyInfoCard({ title, icon, val, bg }: any) {
    return (
        <div className={`${bg} p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col justify-between`}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">{val}</p>
            </div>
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

