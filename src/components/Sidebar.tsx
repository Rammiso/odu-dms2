import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, LayoutDashboard, Users, DoorOpen, Wrench,
  ArrowRightLeft, Package, BarChart3, Bell, Shield, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import type { UserRole } from '@/types/api';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['student', 'dorm_admin', 'maintenance', 'management', 'system_admin'] },
  { icon: Users, label: 'Students', path: '/students', roles: ['dorm_admin', 'management', 'system_admin'] },
  { icon: DoorOpen, label: 'Rooms', path: '/rooms', roles: ['dorm_admin', 'management', 'system_admin'] },
  { icon: ArrowRightLeft, label: 'Room Changes', path: '/room-changes', roles: ['student', 'dorm_admin', 'system_admin'] },
  { icon: Wrench, label: 'Maintenance', path: '/maintenance', roles: ['student', 'dorm_admin', 'maintenance', 'system_admin'] },
  { icon: Package, label: 'Inventory', path: '/inventory', roles: ['dorm_admin', 'system_admin'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['dorm_admin', 'management', 'system_admin'] },
  { icon: Users, label: 'User Management', path: '/users', roles: ['system_admin'] },
  { icon: Bell, label: 'Notifications', path: '/notifications', roles: ['student', 'dorm_admin', 'maintenance', 'management', 'system_admin'] },
  { icon: Shield, label: 'Audit Logs', path: '/audit-logs', roles: ['system_admin'] },
];

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter((item) => hasRole(item.roles));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full z-40 flex flex-col border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-[68px]" : "w-60"
    )} style={{ background: 'var(--gradient-sidebar)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-foreground truncate">OBU DMS</h2>
            <p className="text-[10px] text-muted-foreground truncate">Dormitory System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
              isActive
                ? "bg-primary/15 text-primary shadow-glow"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-xs font-medium text-foreground truncate">{user.fullName}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
};

export default Sidebar;
