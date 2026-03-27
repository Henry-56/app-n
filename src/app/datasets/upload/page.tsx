"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, CheckCircle2, Loader2, ArrowLeft, Sparkles } from "lucide-react";

export default function DatasetUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const companyId = localStorage.getItem("companyId");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    try {
      const res = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        // After upload, trigger AI analysis automatically for the demo
        await fetch("/api/analytics/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datasetId: data.dataset.id }),
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al subir el archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 py-12">
      <button 
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
      </button>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Cargar Dataset</h1>
          <p className="text-slate-500 mt-2">Sube un archivo CSV con tus ventas históricas para generar insights.</p>
        </div>

        {success ? (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">¡Datos procesados!</h2>
            <p className="text-slate-500 mt-2">Gemini está analizando las tendencias. Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-8">
            <div 
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFile(e.dataTransfer.files[0]);
              }}
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileText className={`w-12 h-12 mx-auto mb-4 ${file ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="block text-lg font-semibold text-slate-700">
                  {file ? file.name : "Selecciona o arrastra tu archivo CSV"}
                </span>
                <span className="text-sm text-slate-400 mt-1 block">Máximo 10MB • Solo formato CSV admitido</span>
              </label>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
              <div className="bg-amber-500 text-white p-1 rounded-md mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Nota Técnica:</span> El sistema normalizará automáticamente los datos y los enviará a Gemini 2.0 Flash Lite para detectar patrones y generar proyecciones estratégicas.
              </p>
            </div>

            <button
              disabled={!file || loading}
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Procesar con IA <Sparkles className="w-5 h-5" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
