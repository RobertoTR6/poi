'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { usuarios, login } = useAppContext();
  const [selectedUser, setSelectedUser] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(selectedUser)) {
      const user = usuarios.find(u => u.id === selectedUser);
      if (user.rol === 'admin') {
        router.push('/admin');
      } else if (user.rol === 'monitor') {
        // Redirigir al listado de evaluaciones asignadas
        router.push('/evaluaciones');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary-600">
          <ShieldAlert size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Monitoreo RIS Iniciadoras
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Versión de prueba - Datos simulados
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-slate-700">
                Seleccionar Rol para Ingresar
              </label>
              <div className="mt-1">
                <select
                  id="user"
                  name="user"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="" disabled>Seleccione un usuario mock...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nombre_completo} ({u.rol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!selectedUser}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <KeyRound className="mr-2 h-5 w-5" />
                Ingresar (Mock Login)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
