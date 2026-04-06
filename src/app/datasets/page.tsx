"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
  Database,
  Sparkles
} from "lucide-react";

interface Dataset {
  id: string;
  name: string;
  fileSize: number;
  fileType: string;
  status: string;
  createdAt: string;
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [previewDataset, setPreviewDataset] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const router = useRouter();

  const fetchDatasets = async () => {
    try {
      const res = await fetch("/api/datasets");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDatasets(data);
      } else {
        console.error("Expected array from /api/datasets but got:", data);
        setDatasets([]);
      }
    } catch (e: any) {
      console.error("Error fetching datasets:", e);
      setDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handlePreview = async (id: string) => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/datasets/${id}`);
      const data = await res.json();
      setPreviewDataset(data);
    } catch (e: any) {
      alert("Error al cargar la previsualización");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => {
      formData.append("file", file);
    });

    try {
      const res = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        await fetchDatasets();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      alert("Error al subir archivos");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este dataset?")) return;
    
    try {
      const res = await fetch(`/api/datasets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDatasets(datasets.filter(d => d.id !== id));
      }
    } catch (e: any) {
      alert("Error al eliminar");
    }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    try {
      const res = await fetch("/api/analytics/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: id }),
      });
      if (res.ok) {
        localStorage.setItem("selectedDatasetId", id);
        router.push("/dashboard");
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e: any) {
      alert("Error al iniciar el análisis");
    } finally {
      setAnalyzingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 py-12">
      {/* Modal Previsualización */}
      {previewDataset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Vista Previa: {previewDataset.name}</h3>
                <p className="text-slate-500 font-medium">Mostrando los primeros 10 registros del archivo.</p>
              </div>
              <button 
                onClick={() => setPreviewDataset(null)}
                className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {previewDataset.records[0] && Object.keys(previewDataset.records[0].data).map(key => (
                      <th key={key} className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {previewDataset.records.map((rec: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      {Object.values(rec.data).map((val: any, j: number) => (
                        <td key={j} className="px-4 py-3 text-sm text-slate-600 font-medium">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setPreviewDataset(null)}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Database className="w-10 h-10 text-indigo-600" />
            Gestión de Datos
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Sube, organiza y selecciona tus datasets para el análisis predictivo.</p>
        </div>

        <div className="relative">
          <input 
            type="file" 
            id="multi-upload" 
            multiple 
            accept=".csv,.xlsx" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label 
            htmlFor="multi-upload"
            className={`flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer ${uploading ? 'opacity-50' : ''}`}
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Subir Archivos
          </label>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Cargando historial...</p>
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No hay datasets cargados</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Comienza subiendo tus archivos de ventas en formato CSV o Excel.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Dataset</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Tamaño</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {datasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs">
                          {(ds.fileType || 'csv').toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700">{ds.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-500 font-medium lowercase">.{ds.fileType}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-500 font-medium">{formatSize(ds.fileSize)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-500 font-medium">
                        {new Date(ds.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {ds.status === 'PROCESSED' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-4 h-4" /> Listo
                        </div>
                      ) : ds.status === 'ERROR' ? (
                        <div className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-full w-fit">
                          <AlertCircle className="w-4 h-4" /> Error
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full w-fit">
                          <Clock className="w-4 h-4" /> Pendiente
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handlePreview(ds.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => handleAnalyze(ds.id)}
                          disabled={analyzingId === ds.id}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl font-bold text-sm transition-all shadow-sm"
                        >
                          {analyzingId === ds.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                          Analizar
                        </button>
                        <button 
                          onClick={() => handleDelete(ds.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <Sparkles className="w-12 h-12 text-indigo-400 mb-4 opacity-50 group-hover:scale-110 transition-transform" />
          <h4 className="text-xl font-bold mb-2">Análisis Predictivo AI</h4>
          <p className="text-slate-400 text-sm leading-relaxed">Gemini analiza cada dataset individualmente para proyectar tendencias de ventas y demanda del próximo mes.</p>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Database className="w-24 h-24" />
          </div>
        </div>
        
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <Plus className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-2">Multiformato</h4>
          <p className="text-slate-500 text-sm leading-relaxed">Soporte completo para archivos Excel (.xlsx) y CSV. Solo asegúrate de incluir encabezados claros.</p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">¿Listo para reportes?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Una vez completado el análisis, podrás exportar PDF estratégicos desde el Dashboard.</p>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="mt-4 flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all"
          >
            Ir al Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

