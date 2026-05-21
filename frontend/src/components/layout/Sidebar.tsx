"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { 
  LayoutDashboard, 
  BookOpen, 
  Code2, 
  CheckSquare, 
  Users, 
  Settings,
  LogOut,
  TerminalSquare
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const getLinks = () => {
    if (!user) return [];
    
    const baseLinks = [
      { name: "Dashboard", href: `/${user.role.toLowerCase()}`, icon: LayoutDashboard },
      { name: "Classrooms", href: `/${user.role.toLowerCase()}/classrooms`, icon: BookOpen },
    ];

    if (user.role === "TEACHER") {
      baseLinks.push(
        { name: "Tasks", href: "/teacher/tasks", icon: CheckSquare },
        { name: "Submissions", href: "/teacher/submissions", icon: Code2 },
        { name: "Students", href: "/teacher/students", icon: Users }
      );
    } else if (user.role === "STUDENT") {
      baseLinks.push(
        { name: "My Tasks", href: "/student/tasks", icon: CheckSquare },
        { name: "Code Sandbox", href: "/student/sandbox", icon: TerminalSquare }
      );
    } else if (user.role === "ADMIN") {
      baseLinks.push(
        { name: "All Submissions", href: "/admin/submissions", icon: Code2 }
      );
    }

    baseLinks.push({ name: "Settings", href: `/${user.role.toLowerCase()}/settings`, icon: Settings });
    return baseLinks;
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-lg tracking-tight font-code">
          <TerminalSquare size={20} />
          CodeRoom
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</div>
        {getLinks().map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive 
                  ? "bg-sky-500/10 text-sky-400" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Icon size={18} className={isActive ? "text-sky-400" : "text-slate-500"} />
              {link.name}
              {isActive && (
                <div className="ml-auto w-1 h-4 bg-sky-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
