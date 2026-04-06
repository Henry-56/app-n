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
import autoTable from "jspdf-autotable";
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

  const exportToPDF = async (fullData: any, name: string) => {
    try {
        const doc = new jsPDF() as any;
        const stats = fullData?.stats || {};
        const charts = fullData?.charts || {};
        const strategic = stats?.strategicConsultation || {};
        
        // Header
        doc.setFontSize(26);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text("SME Analytics", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Business Intelligence & Predictive AI Strategy", 14, 28);
        
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(14, 35, 196, 35);

        // Metadata
        doc.setFontSize(12);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.text(`Empresa: ${fullData.company?.name || name}`, 14, 45);
        doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, 140, 45);

        // --- SECCIÓN 1: MÉTRICAS CLAVE ---
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.roundedRect(14, 55, 182, 25, 3, 3, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text("VENTAS TOTALES", 20, 63);
        doc.text("TICKET PROMEDIO", 65, 63);
        doc.text("PREDICCIÓN PRÓX. MES", 110, 63);
        doc.text("CRECIMIENTO", 160, 63);

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text(stats.totalSales || "$0.00", 20, 72);
        doc.text(stats.avgTicket || "$0.00", 65, 72);
        doc.text(stats.predictions?.projectedSales ? `$${stats.predictions.projectedSales}` : "N/A", 110, 72);
        doc.text(stats.predictions?.growthTrend ? `+${stats.predictions.growthTrend}%` : "0%", 160, 72);

        // --- SECCIÓN 2: ESTRATEGIA IA ---
        doc.setFontSize(16);
        doc.setTextColor(79, 70, 229);
        doc.text("Estrategia IA: 4 Pilares de Crecimiento", 14, 95);
        
        // Rows for Pillars
        doc.setFillColor(238, 242, 255); // Marketing
        doc.roundedRect(14, 100, 88, 35, 4, 4, 'F');
        doc.setFontSize(10);
        doc.setTextColor(67, 56, 202);
        doc.text("1. Marketing & Canales", 18, 107);
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(doc.splitTextToSize(strategic.marketing?.suggestion || "Análisis en curso.", 80), 18, 114);

        doc.setFillColor(236, 253, 245); // Product
        doc.roundedRect(108, 100, 88, 35, 4, 4, 'F');
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(10);
        doc.text("2. Producto & Catálogo", 112, 107);
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(doc.splitTextToSize(strategic.product?.suggestion || "Análisis en curso.", 80), 112, 114);

        doc.setFillColor(255, 251, 235); // Supplier
        doc.roundedRect(14, 140, 88, 35, 4, 4, 'F');
        doc.setTextColor(180, 83, 9);
        doc.setFontSize(10);
        doc.text("3. Proveedores & Suministro", 18, 147);
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(doc.splitTextToSize(strategic.supplier?.suggestion || "Análisis en curso.", 80), 18, 154);

         doc.setFillColor(254, 242, 242); // Customer
         doc.roundedRect(108, 140, 88, 30, 4, 4, 'F');
         doc.setTextColor(185, 28, 28);
         doc.setFontSize(10);
         doc.text("4. Clientes & Fidelización", 112, 147);
         doc.setFontSize(8);
         doc.setTextColor(71, 85, 105);
         doc.text(doc.splitTextToSize(strategic.customer?.suggestion || "Análisis en curso.", 80), 112, 154);
 
         // --- SECCIÓN 3: SINERGIA GANADORA (PRODUCT + CHANNEL) ---
         if (strategic.product?.winningProduct && strategic.product?.bestChannel) {
             doc.setFillColor(30, 41, 59); // Slate 800
             doc.roundedRect(14, 175, 182, 35, 6, 6, 'F');
             
             doc.setTextColor(255, 255, 255);
             doc.setFontSize(12);
             doc.text("Sinergia Ganadora (Target #1)", 20, 184);
             
             doc.setFontSize(9);
             doc.setTextColor(203, 213, 225); // Slate 300
             doc.text(`PRODUCTO: ${strategic.product.winningProduct}`, 20, 192);
             doc.text(`CANAL: ${strategic.product.bestChannel}`, 20, 197);
             
             doc.setFontSize(9);
             doc.setTextColor(255, 255, 255);
             const synergyTxt = `Combo de alto rendimiento detectado. El ROI se maximiza impulsando este producto vía ${strategic.product.bestChannel}.`;
             doc.text(doc.splitTextToSize(synergyTxt, 170), 20, 204);
         }

         // New Page for Charts
         doc.addPage();
         
         // --- SECCIÓN 4: RENDIMIENTO VISUAL (DASHBOARD-STYLING) ---
         doc.setFontSize(18);
         doc.setTextColor(15, 23, 42);
         doc.text("Análisis de Rendimiento Visual", 14, 20);
         
         // 4.1 Categorías (Bars) - High Fidelity
         doc.setFontSize(14);
         doc.setTextColor(79, 70, 229); // Indigo 600
         doc.text("Distribución por Producto (Top 5)", 14, 35);
         
         const topCats = (charts.categories || []).slice(0, 5);
         let barY = 55;
         const maxVal = Math.max(...topCats.map((c: any) => Number(c.value)), 1);
         
         // Draw Chart Area
         doc.setDrawColor(241, 245, 249);
         doc.setLineWidth(0.1);
         for(let i=0; i<=4; i++) {
            const gx = 45 + (i * 35);
            doc.line(gx, 45, gx, 115); // Light vertical grid
         }

         topCats.forEach((c: any) => {
             const val = Number(c.value);
             const barWidth = (val / maxVal) * 140;
             
             // Bar Label
             doc.setFontSize(7);
             doc.setTextColor(100);
             doc.text(doc.splitTextToSize(c.name, 28), 14, barY + 1);
             
             // Bar Background
             doc.setFillColor(248, 250, 252);
             doc.roundedRect(45, barY - 4, 140, 7, 2, 2, 'F'); 
             
             // Main Bar (Indigo)
             doc.setFillColor(79, 70, 229);
             doc.roundedRect(45, barY - 4, barWidth, 7, 2, 2, 'F');
             
             // Value
             doc.setFontSize(8);
             doc.setTextColor(15, 23, 42);
             doc.text(`$${val.toLocaleString()}`, 190, barY + 1, { align: 'right' });
             
             barY += 14;
         });

         // 4.2 Tendencia (Trend Line Visualization - Dashboard Style)
         doc.setFontSize(14);
         doc.setTextColor(16, 185, 129); // Emerald 600
         doc.text("Tendencia de Crecimiento & Predictivo", 14, barY + 20);
         
         const trendData = (charts.trend || []).slice(-12);
         if (trendData.length > 0) {
            const chartX = 25; // Shift right for Y-axis labels
            const chartY = barY + 85; 
            const chartW = 171; // Adjust width for labels
            const chartH = 45;
            
            // Background Card look
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(14, barY + 28, 182, chartH + 25, 4, 4, 'D');

            // Legend
            doc.setFontSize(6);
            doc.setTextColor(100);
            // Real Legend
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(0.5);
            doc.line(160, barY + 35, 165, barY + 35);
            doc.text("Histórico", 167, barY + 36);
            // Proj Legend
            doc.setLineDash([1, 1], 0);
            doc.line(160, barY + 39, 165, barY + 39);
            doc.text("IA Proyección", 167, barY + 40);
            doc.setLineDash([], 0); // Reset dash

            const maxTrendRaw = Math.max(...trendData.map((t: any) => Math.max(Number(t.salesReal || 0), Number(t.salesProjected || 0))), 1);
            const maxTrendScale = Math.ceil(maxTrendRaw / 500) * 500; // Round up for scale

            // Grid Lines (Horizontal) and Y-Axis Labels
            doc.setDrawColor(241, 245, 249);
            doc.setLineWidth(0.1);
            doc.setFontSize(6);
            doc.setTextColor(148, 163, 184);

            for(let j=0; j<=4; j++) {
                const gy = chartY - (j * (chartH / 4));
                const val = (maxTrendScale / 4) * j;
                doc.line(chartX, gy, chartX + chartW, gy);
                doc.text(`$${val}`, chartX - 2, gy + 1, { align: 'right' });
            }
            
            let prevPoint: any = null;
            
            trendData.forEach((t: any, i: number) => {
                const x = chartX + (i * (chartW / (trendData.length - 1)));
                const val = Number(t.salesReal || t.salesProjected);
                const y = chartY - ((val / maxTrendScale) * chartH);
                const isProjected = !t.salesReal && t.salesProjected;
                
                // Set Dash if projected
                if (isProjected) {
                    doc.setLineDash([2, 1], 0);
                } else {
                    doc.setLineDash([], 0);
                }

                doc.setDrawColor(16, 185, 129);
                doc.setLineWidth(1.2);
                if (prevPoint) doc.line(prevPoint.x, prevPoint.y, x, y);
                
                // Data Point
                doc.setFillColor(16, 185, 129);
                doc.circle(x, y, 1, 'F');
                prevPoint = { x, y };

                // Date Label
                doc.setLineDash([], 0); // Reset for text
                doc.setFontSize(5);
                doc.setTextColor(100);
                const dateLbl = t.name.includes('-') ? t.name.split('-').pop() : t.name;
                // Only show labels every 2 points if crowded
                if (trendData.length <= 6 || i % 2 === 0 || i === trendData.length - 1) {
                    doc.text(dateLbl, x, chartY + 6, { align: 'center' });
                }
            });
            doc.setLineDash([], 0); // Final reset
         }

         doc.save(`${name.replace(/\.[^/.]+$/, "")}_Report_Predictivo.pdf`);
     } catch (e: any) {
         console.error("PDF Fail:", e);
         alert(`Error al generar el PDF: ${e.message}`);
     }
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
            await exportToPDF(data, data.company.name);
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

