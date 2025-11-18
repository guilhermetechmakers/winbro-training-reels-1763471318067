import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopNav } from "./top-nav"

interface DashboardLayoutProps {
  children: ReactNode
  isAdmin?: boolean
}

export function DashboardLayout({ children, isAdmin = false }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col ml-[280px]">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
