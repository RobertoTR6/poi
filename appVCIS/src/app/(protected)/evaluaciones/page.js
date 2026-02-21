'use client';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';
import { Map, ChevronRight } from 'lucide-react';

export default function EvaluacionesIndexPage() {
  const { currentUser, getAssignedRIS } = useAppContext();
  
  const periodo = '2026-T1'; // Could be dynamic or selectable
  const assignedRis = getAssignedRIS(currentUser?.id, periodo);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mis Asignaciones</h1>
        <p className="text-slate-500">Seleccione la RIS que desea evaluar para el período {periodo}.</p>
      </div>

      {assignedRis.length === 0 ? (
         <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">No tiene ninguna RIS asignada para evaluar en este momento.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedRis.map(ris => (
            <Link 
              key={ris.id} 
              href={`/evaluacion/${ris.id}/${periodo}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all flex flex-col items-start group"
            >
              <div className="flex w-full justify-between items-center mb-4">
                <div className="p-3 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Map size={24} />
                </div>
                <ChevronRight className="text-slate-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">{ris.nombre}</h2>
              <p className="text-sm font-medium text-slate-500">{ris.diresa}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
