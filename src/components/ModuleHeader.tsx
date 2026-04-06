"use client";

import { useEffect, useState } from "react";
import { Database, Sparkles } from "lucide-react";

interface ModuleHeaderProps {
  title: string;
  icon: React.ReactNode;
  description: string;
}

export default function ModuleHeader({ title, icon, description }: ModuleHeaderProps) {
  const [datasetName, setDatasetName] = useState<string>("Sincronizando...");

  useEffect(() => {
    // Listen for dataset changes in localStorage or fetch from API
    const updateName = async () => {
        const id = localStorage.getItem("selectedDatasetId");
        try {
            const res = await fetch(id ? `/api/datasets/active?datasetId=${id}` : "/api/datasets/active");
            const data = await res.json();
            setDatasetName(data.activeDatasetName || "Dataset General");
        } catch (e: any) {
            setDatasetName("Dataset Default");
        }
    };
    updateName();
    
    // Simple event listener for storage changes if multiple tabs are open (optional)
    window.addEventListener('storage', updateName);
    return () => window.removeEventListener('storage', updateName);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-50">
          {icon}
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {title}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
         <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" />
         </div>
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dataset Analizado</p>
            <p className="text-sm font-black text-slate-800 flex items-center gap-2">
               {datasetName}
               <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </p>
         </div>
      </div>
    </div>
  );
}

