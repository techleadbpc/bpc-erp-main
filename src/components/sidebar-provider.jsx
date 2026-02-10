"use client"

import { createContext, useContext, useState } from "react"

const SidebarContext = createContext({
  isOpen: false,
  setIsOpen: () => {},
})

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  return <SidebarContext.Provider value={{ isOpen, setIsOpen }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)

