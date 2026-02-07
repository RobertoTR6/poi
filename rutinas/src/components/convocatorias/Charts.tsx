'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface ChartsProps {
    data: any[];
}

export default function Charts({ data }: ChartsProps) {
    if (!data || data.length === 0) return null;

    // Process data for charts
    const orgCounts: Record<string, number> = {};
    const catCounts: Record<string, number> = {};

    data.forEach(item => {
        const org = item.organizacion || 'Desconocido';
        orgCounts[org] = (orgCounts[org] || 0) + 1;

        const cat = item.categoria_salarial || 'Sin categoría';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    // Top 5 Organizations
    const sortedOrgs = Object.entries(orgCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const barData = {
        labels: sortedOrgs.map(([label]) => label),
        datasets: [
            {
                label: 'Convocatorias',
                data: sortedOrgs.map(([, value]) => value),
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                borderRadius: 4,
            },
        ],
    };

    const pieData = {
        labels: Object.keys(catCounts),
        datasets: [
            {
                data: Object.values(catCounts),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)', // Emerald
                    'rgba(245, 158, 11, 0.7)', // Amber
                    'rgba(99, 102, 241, 0.7)', // Indigo
                    'rgba(239, 68, 68, 0.7)',  // Red
                    'rgba(100, 116, 139, 0.7)', // Slate
                ],
                borderWidth: 0
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f1f5f9'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8
                }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Top 5 Entidades</h3>
                <div className="h-64">
                    <Bar options={options} data={barData} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Distribución Salarial</h3>
                <div className="h-64">
                    <Doughnut options={pieOptions} data={pieData} />
                </div>
            </div>
        </div>
    );
}
