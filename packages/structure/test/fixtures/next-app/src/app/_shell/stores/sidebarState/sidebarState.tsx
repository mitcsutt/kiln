'use client'

import { createContext, useContext } from 'react'

const SidebarContext = createContext(false)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <SidebarContext value={false}>{children}</SidebarContext>
}

export function useSidebar() {
  return useContext(SidebarContext)
}
