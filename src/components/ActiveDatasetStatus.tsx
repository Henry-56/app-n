"use client";

import { useEffect, useState, useRef } from "react";
import { Database, Activity } from "lucide-react";

export default function ActiveDatasetStatus() {
  const [datasetName, setDatasetName] = useState<string>("Cargando...");
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    const updateName = async () => {
        const id = localStorage.getItem("selectedDatasetId");
        
        // Loop Guard: Only fetch if the ID has changed to save resources
        if (id === lastId.current && datasetName !== "Cargando...") return;
        
        try {
            const res = await fetch(id ? `/api/datasets/active?datasetId=${id}` : "/api/datasets/active");
            const data = await res.json();
            setDatasetName(data.activeDatasetName || "Dataset General");
            lastId.current = id;
        } catch (e: any) {
            setDatasetName("Sin selección");
        }
    };
    updateName();
    
    // Refresh name less frequently (45 seconds) as it rarely changes
    const interval = setInterval(updateName, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-6 mb-6 p-4 bg-indigo-900 rounded-2xl border border-indigo-800 shadow-xl relative overflow-hidden group">
       <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
             <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">En Análisis</p>
          </div>
          <p className="text-xs font-bold text-white truncate max-w-full">{datasetName}</p>
       </div>
       <Database className="absolute -bottom-2 -right-2 w-12 h-12 text-white opacity-5 group-hover:opacity-10 transition-opacity" />
    </div>
  );
}

