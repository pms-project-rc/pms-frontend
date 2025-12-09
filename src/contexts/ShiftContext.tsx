import React, { createContext, useContext, useState } from 'react'

type ShiftStatus = 'activo' | 'inactivo'

interface ShiftContextType {
  shiftStatus: ShiftStatus
  setShiftStatus: (status: ShiftStatus) => void
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined)

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('activo')

  return (
    <ShiftContext.Provider value={{ shiftStatus, setShiftStatus }}>
      {children}
    </ShiftContext.Provider>
  )
}

export const useShift = () => {
  const context = useContext(ShiftContext)
  if (!context) {
    throw new Error('useShift must be used within ShiftProvider')
  }
  return context
}
