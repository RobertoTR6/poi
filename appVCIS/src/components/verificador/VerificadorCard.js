'use client';
import { Paperclip, Loader2 } from 'lucide-react';

export default function VerificadorCard({ 
  verificador, 
  calificacion, 
  evidencias, 
  onUpdatePuntaje, 
  onUpdateObservacion, 
  onAddEvidencia, 
  onRemoveEvidencia 
}) {
  const isSaving = false; // Add local saving state if desired or pass from parent

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-semibold text-slate-900 w-3/4">
          <span className="text-slate-500 mr-2">{verificador.numero}.</span>
          {verificador.verificador}
        </h4>
        <div className="w-1/4 flex justify-end">
          <select
            className={`block w-full text-sm rounded-md border-slate-300 py-2 pl-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500
              ${calificacion?.puntaje === 2 ? 'bg-green-100 text-green-800 border-green-200' : ''}
              ${calificacion?.puntaje === 1 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
              ${calificacion?.puntaje === 0 ? 'bg-red-100 text-red-800 border-red-200' : ''}
              ${calificacion?.puntaje === undefined ? 'bg-slate-50 border-slate-200' : ''}
            `}
            value={calificacion?.puntaje !== undefined ? calificacion.puntaje : ''}
            onChange={(e) => onUpdatePuntaje(verificador.numero, parseInt(e.target.value))}
          >
            <option value="" disabled>Pendiente</option>
            <option value={2}>Cumple (2)</option>
            <option value={1}>En Proceso (1)</option>
            <option value={0}>No Cumple (0)</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-md mb-4 text-xs text-slate-700">
        <p className="font-semibold mb-1">Fuentes Auditables:</p>
        <p className="whitespace-pre-line">{verificador.fuente_auditable}</p>
        <p className="font-semibold mt-2 mb-1">Especificaciones:</p>
        <p className="whitespace-pre-line">{verificador.especificaciones}</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones / Hallazgos</label>
        <textarea
          rows={2}
          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
          placeholder="Escriba los hallazgos relevantes..."
          value={calificacion?.observacion || ''}
          onChange={(e) => onUpdateObservacion(verificador.numero, e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Evidencias Adjuntas</label>
        <div className="flex flex-col gap-2">
          {evidencias.map(ev => (
            <div key={ev.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 text-sm">
              <div className="flex items-center text-slate-600">
                <Paperclip size={16} className="mr-2" />
                <span className="truncate max-w-xs">{ev.nombre_archivo}</span>
              </div>
              <button 
                onClick={() => onRemoveEvidencia(ev.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Eliminar
              </button>
            </div>
          ))}
          
          <div className="mt-1 flex items-center">
             <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
               <Paperclip className="h-4 w-4 mr-1 text-slate-500" />
               Adjuntar archivo
               <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    if(e.target.files?.[0]) {
                      onAddEvidencia(calificacion?.id || `temp-${verificador.numero}`, e.target.files[0]);
                      e.target.value = '';
                    }
                  }} 
                />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}
