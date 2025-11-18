import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Library,
  Video,
  BookOpen,
  Settings,
  BarChart3,
  Users,
  FileVideo,
  Receipt,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Library", href: "/library", icon: Library },
  { title: "Upload Reel", href: "/upload", icon: Video },
  { title: "Courses", href: "/courses", icon: BookOpen },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Transaction History", href: "/transactions", icon: Receipt },
  { title: "Settings", href: "/settings", icon: Settings },
]

const adminNavItems: NavItem[] = [
  { title: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "User Management", href: "/admin/users", icon: Users },
  { title: "Moderation", href: "/admin/moderation", icon: FileVideo },
]

interface SidebarProps {
  isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const location = useLocation()
  const items = isAdmin ? adminNavItems : navItems

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] bg-background border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/" className="flex items-center gap-2">
            <Video className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-foreground">Winbro Reels</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href || 
              (item.href !== "/" && location.pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-item",
                  isActive && "nav-item-active"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
