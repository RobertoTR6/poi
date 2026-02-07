'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Building2, FileText, ChevronDown, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Normativa {
    id: number;
    entidad: string;
    norma_legal: string;
    descripcion: string;
    fecha_publicacion: string;
    link_acceso: string;
    tipo_norma: string;
    categoria: string;
}

export default function BusquedaAvanzada() {
    const [results, setResults] = useState<Normativa[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Filter states
    const [keyword, setKeyword] = useState('');
    const [entidad, setEntidad] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoria, setCategoria] = useState('');

    // Options for dropdowns
    const [entidades, setEntidades] = useState<string[]>([]);
    const [categorias, setCategorias] = useState<string[]>([]);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const { data: entData } = await supabase.from('normativas').select('entidad');
            const { data: catData } = await supabase.from('normativas').select('categoria');

            if (entData) {
                const uniqueEnt = Array.from(new Set(entData.map(e => e.entidad).filter(Boolean))).sort();
                setEntidades(uniqueEnt);
            }
            if (catData) {
                const uniqueCat = Array.from(new Set(catData.map(c => c.categoria).filter(Boolean))).sort();
                setCategorias(uniqueCat);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setSearched(true);

        try {
            let query = supabase.from('normativas').select('*');

            if (keyword) {
                query = query.or(`norma_legal.ilike.%${keyword}%,descripcion.ilike.%${keyword}%`);
            }
            if (entidad) {
                query = query.eq('entidad', entidad);
            }
            if (categoria) {
                query = query.eq('categoria', categoria);
            }
            if (startDate) {
                query = query.gte('fecha_publicacion', startDate);
            }
            if (endDate) {
                query = query.lte('fecha_publicacion', endDate);
            }

            const { data, error } = await query.order('fecha_publicacion', { ascending: false });

            if (error) throw error;
            setResults(data || []);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setKeyword('');
        setEntidad('');
        setCategoria('');
        setStartDate('');
        setEndDate('');
        setResults([]);
        setSearched(false);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Search className="text-blue-600" size={32} />
                    Búsqueda Avanzada
                </h1>
                <p className="text-slate-500 mt-2 ml-10">
                    Localiza normativa específica utilizando múltiples criterios de filtrado.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar de Filtros */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                                <Filter size={20} /> Filtros
                            </h2>
                            <button
                                onClick={resetFilters}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                            >
                                <RotateCcw size={12} /> Limpiar
                            </button>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Palabra Clave</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Ley 30057"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Entidad</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                        value={entidad}
                                        onChange={(e) => setEntidad(e.target.value)}
                                    >
                                        <option value="">Todas las entidades</option>
                                        {entidades.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Rango de Fechas</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full btn btn-primary mt-4"
                                disabled={loading}
                            >
                                {loading ? 'Buscando...' : 'Aplicar Filtros'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Resultados */}
                <div className="lg:col-span-3">
                    {!searched ? (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                            <Search size={48} className="mb-4 text-slate-300" />
                            <p className="text-lg">Ingresa criterios de búsqueda para comenzar</p>
                        </div>
                    ) : loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                            <FileText size={48} className="mb-4 text-slate-300" />
                            <p className="text-lg font-medium">No se encontraron resultados</p>
                            <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-sm text-slate-500">
                                    Se encontraron <strong className="text-slate-900">{results.length}</strong> resultados
                                </p>
                            </div>
                            {results.map((item) => (
                                <div key={item.id} className="card hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="p-3 bg-blue-50 rounded-xl">
                                            <FileText className="text-blue-600" size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1">
                                                    <Building2 size={12} /> {item.entidad}
                                                </span>
                                                {item.categoria && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                                                        {item.categoria}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded-full flex items-center gap-1">
                                                    <Calendar size={12} /> {item.fecha_publicacion}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                {item.norma_legal}
                                            </h3>
                                            <p className="text-slate-500 text-sm leading-relaxed mb-3">
                                                {item.descripcion}
                                            </p>
                                            {item.link_acceso && (
                                                <a
                                                    href={item.link_acceso}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Ver Documento Oficial <div className="ml-1 w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
