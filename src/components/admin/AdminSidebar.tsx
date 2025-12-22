import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  GraduationCap,
  FileCheck,
  Bell,
  MessageSquare,
  Mail,
  Newspaper,
  TestTube,
  Link as LinkIcon,
  Wallet,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Courses', url: '/admin/courses', icon: BookOpen },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Teachers', url: '/admin/teachers', icon: GraduationCap },
  { title: 'Teacher Control', url: '/admin/teacher-control', icon: GraduationCap },
  { title: 'Student Control', url: '/admin/student-control', icon: Users },
  { title: 'Promos', url: '/admin/promos', icon: Newspaper },
  { title: 'Footer Links', url: '/admin/footer-links', icon: LinkIcon },
  { title: 'Withdrawals', url: '/admin/withdrawals', icon: Wallet },
  { title: 'Revenue Analytics', url: '/admin/revenue', icon: BarChart3 },
  { title: 'Languages', url: '/admin/languages', icon: Settings },
  { title: 'Content Approvals', url: '/admin/content-approvals', icon: FileCheck },
  { title: 'Email Marketing', url: '/admin/email-marketing', icon: Mail },
  { title: 'Newsletter', url: '/admin/newsletter', icon: Newspaper },
  { title: 'Notifications', url: '/admin/notifications', icon: Bell },
  { title: 'Chat Management', url: '/admin/chat', icon: MessageSquare },
  { title: 'Testing', url: '/admin/testing', icon: TestTube },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();

  const filteredNavItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter((item) => item.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <aside
      className={cn(
        'bg-card/80 backdrop-blur border-r border-border flex flex-col transition-all duration-300 h-screen sticky top-0 overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between gap-2">
        {!collapsed && <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 min-h-0 p-2 space-y-2 overflow-y-auto">
        {!collapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search admin pages..."
              className="pl-10"
            />
          </div>
        )}

        {filteredNavItems.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">No matches.</div>
        ) : (
          filteredNavItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium truncate">{item.title}</span>}
              </NavLink>
            );
          })
        )}
      </nav>
    </aside>
  );
}
