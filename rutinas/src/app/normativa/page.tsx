'use client';

import { useEffect, useState } from 'react';
import { Search, Download, ExternalLink } from 'lucide-react';
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

export default function NormativasPage() {
    const [normativas, setNormativas] = useState<Normativa[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        entidad: "",
        categoria: "",
        search: ""
    });
    const [uniqueEntities, setUniqueEntities] = useState<string[]>([]);
    const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

    useEffect(() => {
        fetchNormativas();
    }, []);

    const fetchNormativas = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('normativas')
                .select('*')
                .order('fecha_publicacion', { ascending: false });

            if (error) throw error;

            const normativasData = data as Normativa[];
            setNormativas(normativasData || []);

            // Extract unique values
            if (normativasData) {
                const entities = Array.from(new Set(normativasData.map(n => n.entidad))).sort();
                setUniqueEntities(entities);

                const categories = Array.from(new Set(normativasData.map(n => n.categoria).filter(Boolean))).sort();
                setUniqueCategories(categories);
            }
        } catch (error) {
            console.error("Error fetching normativas:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredNormativas = normativas.filter(n => {
        const matchesSearch = n.norma_legal.toLowerCase().includes(filters.search.toLowerCase()) ||
            n.descripcion.toLowerCase().includes(filters.search.toLowerCase());
        const matchesEntidad = !filters.entidad || n.entidad === filters.entidad;
        const matchesCategoria = !filters.categoria || n.categoria === filters.categoria;
        return matchesSearch && matchesEntidad && matchesCategoria;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Sin fecha';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return 'Sin fecha';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Normativas</h1>
                    <p className="text-slate-500 mt-1">Explora y busca en la base de datos de normas legales</p>
                </div>
                <button className="btn btn-primary">
                    <Download size={18} />
                    Exportar Excel
                </button>
            </div>

            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por número de norma o palabras clave..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            value={filters.entidad}
                            onChange={e => setFilters({ ...filters, entidad: e.target.value })}
                        >
                            <option value="">Todas las Entidades</option>
                            {uniqueEntities.map(entidad => (
                                <option key={entidad} value={entidad}>{entidad}</option>
                            ))}
                        </select>
                        <select
                            className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            value={filters.categoria}
                            onChange={e => setFilters({ ...filters, categoria: e.target.value })}
                        >
                            <option value="">Todas las Categorías</option>
                            {uniqueCategories.map(categoria => (
                                <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Entidad</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Norma Legal</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Categoría</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Descripción</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Fecha</th>
                                <th className="px-6 py-4 font-semibold text-sm text-slate-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando normativas...</td>
                                </tr>
                            ) : filteredNormativas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No se encontraron resultados</td>
                                </tr>
                            ) : (
                                filteredNormativas.map((normativa) => (
                                    <tr key={normativa.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{normativa.entidad}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600 font-medium">{normativa.norma_legal}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {normativa.categoria && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {normativa.categoria}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            <div className="whitespace-normal break-words max-w-md">
                                                {normativa.descripcion}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {formatDate(normativa.fecha_publicacion)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {normativa.link_acceso && (
                                                <a
                                                    href={normativa.link_acceso}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    Ver <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
