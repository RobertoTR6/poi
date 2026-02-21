'use client';

import { use, useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { VERIFICADORES } from '@/lib/verificadores';
import VerificadorCard from '@/components/verificador/VerificadorCard';
import { CheckCircle2, ChevronRight, Save, Loader2, AlertCircle } from 'lucide-react';

export default function EvaluacionPage({ params }) {
  // En Next 15 (o con --app dir), params debe ser unwrapped usando `use(params)` si es async,
  // pero como estamos en useClient podemos acceder a sus proopiedades si no hay suspense rules estrictas,
  // sin embargo es mejor usar React.use(params) o simplemente usar props.params directamente.
  const { ris_id, periodo } = use(params);
  
  const { 
    currentUser, ris, getEvaluacion, createEvaluacion, 
    calificaciones, evidencias, saveBatchCalificaciones, addEvidencia, removeEvidencia, asignaciones
  } = useAppContext();
  const router = useRouter();

  const [evaluacion, setEvaluacion] = useState(null);
  const [activeComponent, setActiveComponent] = useState(VERIFICADORES[0].componente);
  
  // Local state for auto-save buffer
  const [localCalificaciones, setLocalCalificaciones] = useState({});
  const [syncStatus, setSyncStatus] = useState('saved'); // saved | saving | error
  
  const bufferRef = useRef({});
  const timerRef = useRef(null);

  // Security Guard
  useEffect(() => {
    if (currentUser?.rol === 'monitor') {
      const isAssigned = asignaciones.some(a => a.usuario_id === currentUser.id && a.ris_id === ris_id);
      if (!isAssigned) {
        router.push('/evaluaciones');
      }
    }
  }, [currentUser, ris_id, asignaciones, router]);

  // Initialize evaluation
  useEffect(() => {
    let ev = getEvaluacion(ris_id, periodo);
    if (!ev && currentUser?.rol === 'admin') {
      ev = createEvaluacion(ris_id, periodo);
    } else if (!ev) {
       ev = createEvaluacion(ris_id, periodo);
    }
    setEvaluacion(ev);
  }, [ris_id, periodo]);

  // Sync state from context to local on load
  useEffect(() => {
    if (evaluacion) {
      const cals = calificaciones.filter(c => c.evaluacion_id === evaluacion.id);
      const dict = {};
      cals.forEach(c => dict[c.numero_verificador] = c);
      setLocalCalificaciones(dict);
    }
  }, [evaluacion, calificaciones]);

  // Group verificadores by component logic
  const components = useMemo(() => {
    const map = new Map();
    VERIFICADORES.forEach(v => {
      if (!map.has(v.componente)) map.set(v.componente, []);
      map.get(v.componente).push(v);
    });
    return Array.from(map.entries()).map(([name, verifs]) => ({ name, items: verifs }));
  }, []);

  const triggerSave = async () => {
    if (Object.keys(bufferRef.current).length === 0) return;
    
    setSyncStatus('saving');
    const batch = Object.values(bufferRef.current);
    try {
      if (evaluacion) {
        await saveBatchCalificaciones(evaluacion.id, batch);
        bufferRef.current = {}; // clear buffer
        setSyncStatus('saved');
      }
    } catch(e) {
      setSyncStatus('error');
    }
  };

  const handleUpdate = (numero_verificador, dataPart) => {
    setLocalCalificaciones(prev => {
       const curr = prev[numero_verificador] || { numero_verificador, puntaje: undefined, observacion: '' };
       const next = { ...curr, ...dataPart };
       
       // Add to buffer
       bufferRef.current[numero_verificador] = next;
       
       // Setup debounce
       if (timerRef.current) clearTimeout(timerRef.current);
       setSyncStatus('saving'); // UI feedback immediately
       timerRef.current = setTimeout(triggerSave, 4000); // 4 sec batching
       
       return { ...prev, [numero_verificador]: next };
    });
  };

  if (!evaluacion) return <div className="p-8">Cargando evaluación...</div>;

  const currentRIS = ris.find(r => r.id === ris_id);
  const activeComponentData = components.find(c => c.name === activeComponent);

  // Compute progress
  const totalVerifs = VERIFICADORES.length;
  const completedVerifs = Object.values(localCalificaciones).filter(c => c.puntaje !== undefined).length;
  const progressPct = Math.round((completedVerifs / totalVerifs) * 100);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{currentRIS?.nombre || ris_id}</h2>
            <span className="px-2.5 py-0.5 min-w-[50px] text-center rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {periodo}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${evaluacion.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {evaluacion.estado.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{currentRIS?.diresa} - {currentRIS?.region}</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
              <span>{completedVerifs} de {totalVerifs} verificadores</span>
              <span className="font-semibold">{progressPct}%</span>
            </div>
            <div className="w-48 bg-slate-200 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
          
          <div className="flex items-center w-32 justify-end">
            {syncStatus === 'saved' && <span className="text-xs text-green-600 flex items-center"><CheckCircle2 size={14} className="mr-1"/> Guardado</span>}
            {syncStatus === 'saving' && <span className="text-xs text-amber-600 flex items-center"><Loader2 size={14} className="mr-1 animate-spin"/> Guardando...</span>}
            {syncStatus === 'error' && <span className="text-xs text-red-600 flex items-center"><AlertCircle size={14} className="mr-1"/> Error</span>}
          </div>
          
          {evaluacion.estado === 'borrador' && (
             <button className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
               Cerrar Evaluación
             </button>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Components */}
        <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto shrink-0 hidden lg:block">
          <nav className="p-4 space-y-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Líneas de Intervención ({components.length})</h3>
            {components.map((comp) => {
              const isActive = activeComponent === comp.name;
              // Calc comp progress
              const itemsCount = comp.items.length;
              const itemsCompleted = comp.items.filter(i => localCalificaciones[i.numero]?.puntaje !== undefined).length;
              
              return (
                <button
                  key={comp.name}
                  onClick={() => setActiveComponent(comp.name)}
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors ${isActive ? 'bg-primary-50 border border-primary-100' : 'hover:bg-slate-50'}`}
                >
                  <div className={`mt-0.5 rounded-full p-1 ${isActive ? 'text-primary-600 bg-primary-100' : 'text-slate-400 bg-slate-100'}`}>
                    {itemsCompleted === itemsCount ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current"></div>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-medium leading-snug ${isActive ? 'text-primary-900' : 'text-slate-700'}`}>
                       {comp.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{itemsCompleted} / {itemsCount} verificadores</p>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Verificadores Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
           <div className="max-w-4xl mx-auto">
             <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">{activeComponentData?.name}</h3>
                <p className="text-sm text-slate-500">Evalúe los {activeComponentData?.items.length} verificadores correspondientes a este componente.</p>
             </div>
             
             {activeComponentData?.items.map(verif => {
               const calif = localCalificaciones[verif.numero];
               // filter evid from context
               const evids = evidencias.filter(e => e.calificacion_id === calif?.id || e.calificacion_id === `temp-${verif.numero}`);
               
               return (
                 <VerificadorCard 
                   key={verif.numero}
                   verificador={verif}
                   calificacion={calif}
                   evidencias={evids}
                   onUpdatePuntaje={(num, val) => handleUpdate(num, { puntaje: val })}
                   onUpdateObservacion={(num, val) => handleUpdate(num, { observacion: val })}
                   onAddEvidencia={addEvidencia}
                   onRemoveEvidencia={removeEvidencia}
                 />
               )
             })}
           </div>
        </div>
      </div>
    </div>
  );
}
