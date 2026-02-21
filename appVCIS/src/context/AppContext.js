'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

import { RIS_MOCK_DATA, USUARIOS_MOCK_DATA, ASIGNACIONES_MOCK_DATA, EVALUACIONES_MOCK_DATA } from '@/lib/mockDataDb';

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  
  // Db mock
  const [ris, setRis] = useState(RIS_MOCK_DATA);
  const [usuarios, setUsuarios] = useState(USUARIOS_MOCK_DATA);
  const [asignaciones, setAsignaciones] = useState(ASIGNACIONES_MOCK_DATA);
  const [evaluaciones, setEvaluaciones] = useState(EVALUACIONES_MOCK_DATA);
  const [calificaciones, setCalificaciones] = useState([]); // id, evaluacion_id, numero_verificador, puntaje, observacion
  const [evidencias, setEvidencias] = useState([]); // id, calificacion_id, nombre_archivo

  // Auth functions
  const login = (userId) => {
    const user = usuarios.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };
  const logout = () => setCurrentUser(null);

  // Db operations simulation
  const getAssignedRIS = (userId, periodo) => {
    const asigs = asignaciones.filter(a => a.usuario_id === userId && a.activo);
    return asigs.map(a => ris.find(r => r.id === a.ris_id));
  };

  const getEvaluacion = (ris_id, periodo) => {
    return evaluaciones.find(e => e.ris_id === ris_id && e.periodo === periodo);
  };

  const createEvaluacion = (ris_id, periodo) => {
    const newEval = {
      id: `eval-${Date.now()}`,
      ris_id,
      periodo,
      equipo_monitor: '',
      estado: 'borrador',
      creado_por: currentUser?.id,
    };
    setEvaluaciones([...evaluaciones, newEval]);
    return newEval;
  };

  const saveBatchCalificaciones = async (evaluacionId, batchData) => {
    // Simulate network delay 500ms
    await new Promise(r => setTimeout(r, 500));
    
    setCalificaciones(prev => {
      let nextState = [...prev];
      for (const item of batchData) {
        const idx = nextState.findIndex(c => c.evaluacion_id === evaluacionId && c.numero_verificador === item.numero_verificador);
        if (idx >= 0) {
          nextState[idx] = { ...nextState[idx], puntaje: item.puntaje, observacion: item.observacion };
        } else {
          nextState.push({
            id: `calif-${Date.now()}-${item.numero_verificador}`,
            evaluacion_id: evaluacionId,
            numero_verificador: item.numero_verificador,
            puntaje: item.puntaje,
            observacion: item.observacion || ''
          });
        }
      }
      return nextState;
    });
    return { success: true };
  };

  const addEvidencia = async (calificacionId, file) => {
     await new Promise(r => setTimeout(r, 500));
     const newEvid = {
       id: `evid-${Date.now()}`,
       calificacion_id: calificacionId,
       nombre_archivo: file.name,
     };
     setEvidencias([...evidencias, newEvid]);
  };

  const removeEvidencia = (id) => {
    setEvidencias(evidencias.filter(e => e.id !== id));
  }

  return (
    <AppContext.Provider value={{
      currentUser,
      login, logout,
      
      // Tables access
      ris, usuarios, asignaciones, evaluaciones, calificaciones, evidencias,
      
      // Operations
      getAssignedRIS, getEvaluacion, createEvaluacion, saveBatchCalificaciones, addEvidencia, removeEvidencia
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
