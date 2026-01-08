import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Upload,
  Workflow,
  GitCompare,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  FileText,
  History,
  Settings,
  ChevronLeft,
  Users,
  Shield,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ingestion', href: '/ingestion', icon: Upload },
  { name: 'Rule Engine', href: '/rules', icon: Workflow },
  { name: 'Matching', href: '/matching', icon: GitCompare },
  { name: 'Exceptions', href: '/exceptions', icon: AlertCircle },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
  { name: 'Settlement', href: '/settlement', icon: DollarSign },
  { name: 'GL Posting', href: '/gl-posting', icon: FileText },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Audit Log', href: '/audit', icon: History },
];

const adminItems = [
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Roles', href: '/admin/roles', icon: Shield },
  { name: 'Partners', href: '/admin/partners', icon: Building2 },
  { name: 'System', href: '/admin/system', icon: Settings },
];

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        'relative flex flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AR</span>
            </div>
            <span className="text-lg font-semibold">AutoRecon V2</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">AR</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.href);

            return (
              <NavLink key={item.href} to={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin Section */}
        <div className="mt-6">
          {!collapsed && (
            <div className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Administration
            </div>
          )}
          <nav className="space-y-1">
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <NavLink key={item.href} to={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapse(!collapsed)}
          className="w-full justify-center"
        >
          <ChevronLeft
            className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')}
          />
        </Button>
      </div>
    </div>
  );
}
