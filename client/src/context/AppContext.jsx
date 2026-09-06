import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [selectedFacultyId, setSelectedFacultyId] = useState('fac-001');
  const [currentDate, setCurrentDate] = useState('2026-09-06');

  return (
    <AppContext.Provider value={{
      selectedFacultyId,
      setSelectedFacultyId,
      currentDate,
      setCurrentDate
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
