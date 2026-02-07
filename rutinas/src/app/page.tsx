'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Briefcase, ArrowRight, TrendingUp, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [stats, setStats] = useState({
    normativas: 0,
    convocatorias: 0
  });
  const [recentNormativas, setRecentNormativas] = useState<any[]>([]);
  const [recentConvocatorias, setRecentConvocatorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Counts
        const { count: normCount } = await supabase.from('normativas').select('*', { count: 'exact', head: true });
        const { count: convCount } = await supabase.from('convocatorias').select('*', { count: 'exact', head: true });

        // Fetch Recent Items
        const { data: normData } = await supabase
          .from('normativas')
          .select('id, norma_legal, fecha_publicacion, entidad')
          .order('fecha_publicacion', { ascending: false })
          .limit(4);

        const { data: convData } = await supabase
          .from('convocatorias')
          .select('id, cargo, organizacion, remuneracion_numerica, link')
          .order('id', { ascending: false }) // Assuming ID correlates with time, or use created_at if available
          .limit(4);

        setStats({
          normativas: normCount || 0,
          convocatorias: convCount || 0
        });
        setRecentNormativas(normData || []);
        setRecentConvocatorias(convData || []);
      } catch (e) {
        console.error("Error fetching dashboard data", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Bienvenido a <span className="text-blue-600">RutinasApp</span>
        </h1>
        <p className="text-lg text-slate-500">Gestión centralizada de normativa y oportunidades laborales</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link href="/normativa" className="group">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
                  <FileText size={18} /> Repositorio de Normas
                </p>
                <h2 className="text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.normativas}
                </h2>
                <p className="text-xs text-blue-600 font-medium mt-2 group-hover:underline">Ver repositorio completo &rarr;</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/convocatorias" className="group">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 font-medium mb-1 flex items-center gap-2">
                  <Briefcase size={18} /> Convocatorias Vigentes
                </p>
                <h2 className="text-3xl font-bold text-slate-900">
                  {loading ? '...' : stats.convocatorias}
                </h2>
                <p className="text-xs text-emerald-600 font-medium mt-2 group-hover:underline">Explorar oportunidades &rarr;</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Normativas */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={20} /></div>
              Últimas Normas
            </h3>
            <Link href="/normativa" className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver todo</Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-slate-400">Cargando...</div>
            ) : recentNormativas.length === 0 ? (
              <div className="text-center py-4 text-slate-400">No hay normas recientes</div>
            ) : (
              recentNormativas.map((item) => (
                <div key={item.id} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate" title={item.norma_legal}>
                      {item.norma_legal}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.entidad}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-md">
                    {item.fecha_publicacion}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Convocatorias */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Briefcase size={20} /></div>
              Oportunidades Recientes
            </h3>
            <Link href="/convocatorias" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Ver todo</Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-slate-400">Cargando...</div>
            ) : recentConvocatorias.length === 0 ? (
              <div className="text-center py-4 text-slate-400">No hay convocatorias recientes</div>
            ) : (
              recentConvocatorias.map((item) => (
                <div key={item.id} className="group flex justify-between items-center p-3 hover:bg-emerald-50/50 rounded-xl transition-colors border border-transparent hover:border-emerald-100">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate" title={item.cargo}>
                      {item.cargo}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.organizacion}</p>
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                    <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                      S/ {item.remuneracion_numerica}
                    </span>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-600 transition-colors">
                        <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
