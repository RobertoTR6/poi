'use client';
import { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { VERIFICADORES } from '@/lib/verificadores';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function DashboardView({ risId }) {
  const { ris, evaluaciones, calificaciones } = useAppContext();
  const [periodo, setPeriodo] = useState('2026-T1');

  // Find target RIS (if any)
  const targetRIS = risId ? ris.find(r => r.id === risId) : null;

  // Compute components structure
  const components = useMemo(() => {
    const map = new Map();
    VERIFICADORES.forEach(v => {
      if (!map.has(v.componente)) map.set(v.componente, { max: 0, items: [] });
      map.get(v.componente).max += 2;
      map.get(v.componente).items.push(v);
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, maxScore: data.max }));
  }, []);

  // Compute consolidation
  const tableData = useMemo(() => {
    let evals = evaluaciones.filter(e => e.periodo === periodo);
    if (risId) evals = evals.filter(e => e.ris_id === risId);

    const scoresByComponent = {};
    components.forEach(c => scoresByComponent[c.name] = { score: 0, count: 0 });

    evals.forEach(ev => {
      const cals = calificaciones.filter(c => c.evaluacion_id === ev.id && c.puntaje !== undefined);
      cals.forEach(cal => {
        const verif = VERIFICADORES.find(v => v.numero === cal.numero_verificador);
        if (verif) {
          scoresByComponent[verif.componente].score += cal.puntaje;
          scoresByComponent[verif.componente].count += 1; // Evaluated items
        }
      });
    });

    return components.map(c => {
      // In a global view, maxScore is multiplied by the number of evaluations
      const evalCount = evals.length || 1; 
      const maxPossible = c.maxScore * (risId ? 1 : evals.length);
      const achieved = scoresByComponent[c.name].score;
      const pct = maxPossible > 0 ? (achieved / maxPossible) * 100 : 0;
      
      let level = 'BAJO';
      let levelColor = 'bg-red-100 text-red-800';
      if (pct >= 75) {
        level = 'ÓPTIMO';
        levelColor = 'bg-green-100 text-green-800';
      } else if (pct >= 40) {
        level = 'EN PROCESO';
        levelColor = 'bg-yellow-100 text-yellow-800';
      }

      return {
        name: c.name,
        shortName: c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name,
        puntajeM: maxPossible,
        puntajeO: achieved,
        pct: pct.toFixed(1),
        level,
        levelColor
      };
    });
  }, [risId, periodo, evaluaciones, calificaciones, components]);

  // Compute progress by RIS
  const progressByRIS = useMemo(() => {
    const targetRISList = risId ? [ris.find(r => r.id === risId)].filter(Boolean) : ris;
    const MAX_SCORE_PER_RIS = components.reduce((acc, curr) => acc + curr.maxScore, 0);

    const data = targetRISList.map(r => {
      const ev = evaluaciones.find(e => e.ris_id === r.id && e.periodo === periodo);
      let puntajeObtenido = 0;
      if (ev) {
        const cals = calificaciones.filter(c => c.evaluacion_id === ev.id && c.puntaje !== undefined);
        puntajeObtenido = cals.reduce((sum, c) => sum + Number(c.puntaje), 0);
      }
      
      const pct = MAX_SCORE_PER_RIS > 0 ? (puntajeObtenido / MAX_SCORE_PER_RIS) * 100 : 0;
      
      return {
        risNombre: r.nombre.length > 25 ? r.nombre.substring(0, 25) + '...' : r.nombre,
        fullName: r.nombre,
        puntaje: puntajeObtenido,
        maximo: MAX_SCORE_PER_RIS,
        pct: parseFloat(pct.toFixed(1))
      };
    });

    if (!risId) {
      data.sort((a, b) => b.pct - a.pct); // Highest first
    }

    return data;
  }, [risId, ris, evaluaciones, calificaciones, periodo, components]);

  const radarData = tableData.map(d => ({
    name: d.name.length > 50 ? d.name.substring(0, 50) + '...' : d.name,
    pct: parseFloat(d.pct)
  }));

  const renderRadarLabel = (props) => {
    const { x, y, value } = props;
    if (value === undefined || value === null) return null;
    return (
      <g>
        <rect x={x - 18} y={y - 12} width={36} height={24} fill="#1e40af" rx={4} />
        <text x={x} y={y + 4} fill="#fff" fontSize={11} textAnchor="middle" fontWeight="bold">
          {Math.round(value)}%
        </text>
      </g>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {risId ? `Dashboard RIS: ${targetRIS?.nombre}` : 'Dashboard Global'}
          </h1>
          <p className="text-slate-500">Resultados consolidados e indicadores de avance.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <label className="text-sm font-medium text-slate-600 mr-2">Período:</label>
          <select 
            className="border-slate-300 rounded-md shadow-sm focus:ring-primary-500 py-1.5 focus:border-primary-500 text-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="2025-T4">2025-T4</option>
            <option value="2026-T1">2026-T1</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Grado de Avance por RIS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Grado de Avance General</h3>
           <div className={`flex-1 pr-2 ${!risId ? 'overflow-y-auto h-[550px] custom-scrollbar' : ''}`}>
              <div className="space-y-6">
                {progressByRIS.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-700">{item.fullName}</span>
                      <span className="text-slate-900 font-bold">{item.puntaje} / {item.maximo} Pts ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${item.pct >= 75 ? 'bg-green-500' : item.pct >= 40 ? 'bg-yellow-400' : 'bg-red-500'}`} 
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Análisis Multidimensional</h3>
           <div className="h-[550px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Radar 
                  name="Cumplimiento" 
                  dataKey="pct" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fill="none" 
                  label={renderRadarLabel}
                  dot={{ r: 4, fill: '#3b82f6' }}
                />
              </RadarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Consolidate Table */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">Consolidado por Componentes ({periodo})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aspectos / Líneas de Intervención</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Puntaje Máximo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Puntaje Obtenido</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">% Cumplimiento</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Nivel</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tableData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-md whitespace-normal">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{row.puntajeM}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 text-center">{row.puntajeO}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{row.pct}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                     <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.levelColor}`}>
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
