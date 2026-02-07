'use client';

import { useEffect, useState } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import KpiCards from '@/components/convocatorias/KpiCards';
import Charts from '@/components/convocatorias/Charts';

interface Convocatoria {
    id: number;
    fuente: string;
    organizacion: string;
    cargo: string;
    remuneracion_numerica: number;
    categoria_salarial: string;
    ubicacion: string;
    fecha_fin: string;
    link: string;
    es_nueva: boolean;
}

export default function ConvocatoriasPage() {
    const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        organizacion: "",
        ubicacion: "",
        search: ""
    });
    const [uniqueOrgs, setUniqueOrgs] = useState<string[]>([]);
    const [uniqueLocs, setUniqueLocs] = useState<string[]>([]);

    // KPI Metrics
    const [stats, setStats] = useState({
        total: 0,
        nuevas: 0,
        organizaciones: 0,
        promedioSalarial: 0
    });

    useEffect(() => {
        fetchConvocatorias();
    }, []);

    const fetchConvocatorias = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('convocatorias')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            const convData = data as Convocatoria[];
            setConvocatorias(convData || []);

            if (convData) {
                // Extract unique values for filters
                const orgs = Array.from(new Set(convData.map(c => c.organizacion).filter(Boolean))).sort();
                setUniqueOrgs(orgs);

                const locs = Array.from(new Set(convData.map(c => c.ubicacion).filter(Boolean))).sort();
                setUniqueLocs(locs);

                // Calculate Stats
                const total = convData.length;
                const nuevas = convData.filter(c => c.es_nueva).length;
                const totalSalary = convData.reduce((sum, c) => sum + (c.remuneracion_numerica || 0), 0);
                const avgSalary = total > 0 ? totalSalary / total : 0;

                setStats({
                    total,
                    nuevas,
                    organizaciones: orgs.length,
                    promedioSalarial: Math.round(avgSalary)
                });
            }
        } catch (error) {
            console.error("Error fetching convocatorias:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConvocatorias = convocatorias.filter(c => {
        const matchesSearch = c.cargo.toLowerCase().includes(filters.search.toLowerCase()) ||
            c.organizacion.toLowerCase().includes(filters.search.toLowerCase());
        const matchesOrg = !filters.organizacion || c.organizacion === filters.organizacion;
        const matchesLoc = !filters.ubicacion || c.ubicacion === filters.ubicacion;
        return matchesSearch && matchesOrg && matchesLoc;
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Convocatorias</h1>
                    <p className="text-slate-500 mt-1">Dashboard de oportunidades laborales vigentes</p>
                </div>
            </div>

            {/* Dashboard Section */}
            {!loading && (
                <>
                    <KpiCards
                        total={stats.total}
                        nuevas={stats.nuevas}
                        organizaciones={stats.organizaciones}
                        promedioSalarial={stats.promedioSalarial}
                    />
                    <Charts data={convocatorias} />
                </>
            )}

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar cargo, entidad..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        value={filters.organizacion}
                        onChange={e => setFilters({ ...filters, organizacion: e.target.value })}
                    >
                        <option value="">Todas las Organizaciones</option>
                        {uniqueOrgs.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select
                        className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                        value={filters.ubicacion}
                        onChange={e => setFilters({ ...filters, ubicacion: e.target.value })}
                    >
                        <option value="">Todas las Ubicaciones</option>
                        {uniqueLocs.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Cargando convocatorias...</div>
                ) : filteredConvocatorias.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">No se encontraron convocatorias</div>
                ) : (
                    filteredConvocatorias.map(c => (
                        <div key={c.id} className="card hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{c.cargo}</h3>
                                    <p className="text-slate-500 text-sm mb-2">{c.organizacion} • {c.ubicacion}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">{c.categoria_salarial}</span>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">S/ {c.remuneracion_numerica}</span>
                                        {c.es_nueva && <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded">Nueva</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400 block mb-2">Cierre: {c.fecha_fin}</span>
                                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-sm py-1.5 px-3">
                                        Postular <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
