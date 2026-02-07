import { Briefcase, Building2, TrendingUp, DollarSign } from 'lucide-react';

interface KpiProps {
    total: number;
    nuevas: number;
    organizaciones: number;
    promedioSalarial: number;
}

export default function KpiCards({ total, nuevas, organizaciones, promedioSalarial }: KpiProps) {
    const cards = [
        {
            title: 'Convocatorias Activas',
            value: total,
            icon: Briefcase,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Nuevas (Hoy)',
            value: nuevas,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Entidades',
            value: organizaciones,
            icon: Building2,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            title: 'Promedio Salarial',
            value: `S/ ${promedioSalarial.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`,
            icon: DollarSign,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${card.bg} flex items-center justify-center ${card.color}`}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
