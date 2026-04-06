"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Target, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  Search,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  ArrowRight
} from "lucide-react";

interface ProductStrategy {
    channel: string;
    targetAudience: string;
    messaging: string;
    action: string;
    reason: string;
}

export default function AIStrategyPage() {
    const [products, setProducts] = useState<string[]>([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [strategy, setStrategy] = useState<ProductStrategy | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingProducts, setFetchingProducts] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const datasetId = localStorage.getItem("selectedDatasetId");
                const res = await fetch(datasetId ? `/api/dashboard?datasetId=${datasetId}` : "/api/dashboard");
                const data = await res.json();
                
                if (data.charts?.categories) {
                    const productList = data.charts.categories.map((c: any) => c.name);
                    setProducts(productList);
                }
            } catch (e) {
                console.error("Error loading products");
            } finally {
                setFetchingProducts(false);
            }
        };
        loadProducts();
    }, []);

    const handleApplyStrategy = async () => {
        if (!selectedProduct) return;
        setLoading(true);
        setStrategy(null);

        try {
            const datasetId = localStorage.getItem("selectedDatasetId");
            const res = await fetch("/api/analytics/product-strategy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productName: selectedProduct, datasetId })
            });
            const data = await res.json();
            setStrategy(data);
        } catch (e) {
            alert("Error al generar estrategia");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 py-12">
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black mb-4 animate-bounce">
                    <Sparkles className="w-4 h-4" /> Nueva Función: Consultoría IA
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
                    Estrategia de Crecimiento
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                    Selecciona un producto de tu catálogo y deja que nuestra IA diseñe la mejor estrategia de marketing basada en tus datos reales.
                </p>
            </div>

            <div className="max-w-3xl mx-auto mb-16">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <select 
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                        >
                            <option value="">{fetchingProducts ? "Cargando productos..." : "Selecciona un producto..."}</option>
                            {products.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleApplyStrategy}
                        disabled={!selectedProduct || loading}
                        className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                        Diseñar Estrategia
                    </button>
                </div>
            </div>

            {loading && (
                <div className="space-y-8 animate-pulse max-w-4xl mx-auto">
                    <div className="h-40 bg-slate-100 rounded-[2rem]"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-32 bg-slate-100 rounded-[2rem]"></div>
                        <div className="h-32 bg-slate-100 rounded-[2rem]"></div>
                    </div>
                </div>
            )}

            {strategy && !loading && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl mx-auto">
                    {/* Main Insight Box */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <Lightbulb className="w-16 h-16 text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-500" />
                        <h2 className="text-3xl font-black mb-4">¿Por qué esta estrategia?</h2>
                        <p className="text-slate-400 text-xl leading-relaxed font-medium">{strategy.reason}</p>
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles className="w-32 h-32" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Marketing Channel */}
                        <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 hover:scale-[1.02] transition-transform shadow-sm">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                                <Target className="w-7 h-7" />
                            </div>
                            <h3 className="text-indigo-900 text-sm font-black uppercase tracking-widest mb-2">Canal Ideal</h3>
                            <p className="text-indigo-950 text-2xl font-black">{strategy.channel}</p>
                        </div>

                        {/* Audience */}
                        <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 hover:scale-[1.02] transition-transform shadow-sm">
                            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-emerald-900 text-sm font-black uppercase tracking-widest mb-2">Público Objetivo</h3>
                            <p className="text-emerald-950 text-2xl font-black">{strategy.targetAudience}</p>
                        </div>

                        {/* Messaging */}
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 md:col-span-2 group">
                            <div className="flex items-start gap-8">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-slate-400 text-sm font-black uppercase tracking-widest mb-2">Mensaje Sugerido (Copy)</h3>
                                    <p className="text-slate-900 text-2xl font-black italic">"{strategy.messaging}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Immediate Action */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white md:col-span-2 shadow-xl shadow-indigo-100 relative overflow-hidden group">
                           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                        <Zap className="w-3 h-3 fill-amber-400" /> Próximo Paso
                                    </div>
                                    <h3 className="text-3xl font-black mb-2">Acción Inmediata</h3>
                                    <p className="text-indigo-100 text-lg font-medium">{strategy.action}</p>
                                </div>
                                <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-100 transition-all self-start">
                                    Ejecutar Ahora <ChevronRight className="w-5 h-5 font-bold" />
                                </button>
                           </div>
                           <Zap className="absolute -bottom-4 -left-4 w-32 h-32 text-white opacity-5 group-hover:scale-125 transition-transform duration-700" />
                        </div>
                    </div>

                    <div className="p-8 bg-indigo-50/30 rounded-[2rem] border border-dashed border-indigo-200 text-center">
                        <p className="text-indigo-600 font-bold flex items-center justify-center gap-2">
                            ¿Quieres probar con otro producto? <ArrowRight className="w-4 h-4" /> Sube en la página
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
