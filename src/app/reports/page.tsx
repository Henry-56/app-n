"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Loader2, 
  FileSpreadsheet, 
  File as FileIcon,
  Calendar,
  Search,
  CheckCircle2,
  ExternalLink,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  dataset: { name: string };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const router = useRouter();

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data);
    } catch (e: any) {
      console.error("Error fetching reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // For demo: Generate initial reports if empty or show a placeholder
  }, []);

  const exportToPDF = async (reportData: any, name: string) => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("SME Analytics - Reporte Ejecutivo", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Datasets de origen: ${name}`, 14, 37);

    // AI Summary
    doc.setFontSize(16);
    doc.setTextColor(30);
    doc.text("Insights Estratégicos", 14, 50);
    
    doc.setFontSize(10);
    const insights = reportData?.findings?.insights || ["No hay insights disponibles."];
    let y = 60;
    insights.forEach((insight: string) => {
      const splitText = doc.splitTextToSize(`• ${insight}`, 180);
      doc.text(splitText, 14, y);
      y += (splitText.length * 5) + 2;
    });

    // Stats Table
    doc.autoTable({
      startY: y + 10,
      head: [['Métrica', 'Valor']],
      body: [
        ['Ventas Totales', reportData?.stats?.totalSales || "$0.00"],
        ['Predicción Próx. Mes', reportData?.predictions?.projectedSales ? `$${reportData.predictions.projectedSales}` : "N/A"],
        ['Crecimiento Proyectado', reportData?.predictions?.growthTrend ? `${reportData.predictions.growthTrend}%` : "0%"],
        ['Ticket Promedio', reportData?.stats?.avgTicket || "$0.00"]
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`${name.replace(/\.[^/.]+$/, "")}_Reporte.pdf`);
  };

  const exportToExcel = (reportData: any, name: string) => {
    const wsData = [
      ["Reporte Ejecutivo - SME Analytics"],
      [`Fecha: ${new Date().toLocaleString()}`],
      [`Dataset: ${name}`],
      [],
      ["Métricas Clave"],
      ["Ventas Totales", reportData?.stats?.totalSales],
      ["Predicción Próx. Mes", reportData?.predictions?.projectedSales],
      ["Crecimiento Proyectado", `${reportData?.predictions?.growthTrend}%`],
      [],
      ["Insights de IA"],
      ...(reportData?.findings?.insights || []).map((i: string) => [i])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${name.replace(/\.[^/.]+$/, "")}_Datos.xlsx`);
  };

  const handleManualExport = async (type: 'PDF' | 'EXCEL') => {
    const datasetId = localStorage.getItem("selectedDatasetId");
    if (!datasetId) {
      alert("Por favor selecciona un dataset en el Dashboard primero.");
      return;
    }

    setExporting(type);
    try {
        const res = await fetch(`/api/dashboard?datasetId=${datasetId}`);
        const data = await res.json();
        
        if (type === 'PDF') {
            await exportToPDF(data.stats, data.company.name);
        } else {
            exportToExcel(data.stats, data.company.name);
        }

        // Save report history
        await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                name: `${data.company.name} - ${type}`,
                type,
                datasetId
            })
        });
        fetchReports();
    } catch (e: any) {
        alert("Error al exportar");
    } finally {
        setExporting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 py-12">
      <button 
        onClick={() => router.push("/dashboard")}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver al Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-10 h-10 text-indigo-600" />
            Centro de Reportes
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Genera y descarga análisis estratégicos en formatos profesionales.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={!!exporting}
            onClick={() => handleManualExport('PDF')}
            className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-900 font-black rounded-2xl hover:border-indigo-200 transition-all flex items-center gap-3 shadow-sm active:scale-95"
          >
            {exporting === 'PDF' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileIcon className="w-5 h-5 text-indigo-500" />}
            Exportar PDF
          </button>
          <button 
            disabled={!!exporting}
            onClick={() => handleManualExport('EXCEL')}
            className="px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-200 active:scale-95"
          >
            {exporting === 'EXCEL' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="p-32 text-center">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Cargando historial de reportes...</p>
            </div>
        ) : reports.length === 0 ? (
            <div className="p-32 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Historial vacío</h3>
                <p className="text-slate-500 mt-3 max-w-sm mx-auto text-lg">Aún no has generado reportes. Haz clic en los botones superiores para crear el primero.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Nombre del Reporte</th>
                            <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Dataset Origen</th>
                            <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Formato</th>
                            <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                            <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm
                                            ${report.type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {report.type === 'PDF' ? <FileIcon className="w-6 h-6" /> : <FileSpreadsheet className="w-6 h-6" />}
                                        </div>
                                        <span className="font-black text-slate-800 text-lg">{report.name}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                                        <Database className="w-4 h-4" /> {report.dataset.name}
                                    </div>
                                </td>
                                <td className="px-10 py-6">
                                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black
                                        ${report.type === 'PDF' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {report.type}
                                    </span>
                                </td>
                                <td className="px-10 py-6 text-slate-500 font-bold">
                                    {new Date(report.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </td>
                                <td className="px-10 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-sm">
                                        <CheckCircle2 className="w-5 h-5" /> Generado
                                    </div>
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

