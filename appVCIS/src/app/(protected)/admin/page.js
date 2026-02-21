'use client';

import { useAppContext } from '@/context/AppContext';
import { Users, Map, Link as LinkIcon } from 'lucide-react';

export default function AdminPage() {
  const { usuarios, ris, asignaciones, evaluaciones } = useAppContext();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500">Gestión de usuarios, catálogo de RIS y asignaciones de monitoreo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-slate-500">Total Usuarios</h2>
              <p className="text-2xl font-semibold text-slate-900">{usuarios.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-emerald-50 text-emerald-600">
              <Map size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-slate-500">Total RIS</h2>
              <p className="text-2xl font-semibold text-slate-900">{ris.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-purple-50 text-purple-600">
              <LinkIcon size={24} />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-slate-500">Asignaciones Activas</h2>
              <p className="text-2xl font-semibold text-slate-900">{asignaciones.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">Directorio de Usuarios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.nombre_completo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{user.rol}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">Catálogo de RIS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre RIS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">DIRESA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Región</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {ris.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{r.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.diresa}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
