import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
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
  Server,
  Monitor,
  Building2,
  CreditCard,
  Shield,
  History,
  Globe,
  Award,
  FileText,
  Wrench,
  ArrowRightLeft,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItem {
  title: string;
  url: string;
  icon: any;
}

interface NavSection {
  id: string;
  title: string;
  icon: any;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    id: 'main',
    title: 'Main Dashboard',
    icon: LayoutDashboard,
    items: [
      { title: 'Overview', url: '/admin', icon: LayoutDashboard },
      { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
      { title: 'Revenue', url: '/admin/revenue', icon: Wallet },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Dashboard',
    icon: Server,
    items: [
      { title: 'Courses Management', url: '/admin/courses', icon: BookOpen },
      { title: 'Users Management', url: '/admin/users', icon: Users },
      { title: 'Content Approvals', url: '/admin/content-approvals', icon: FileCheck },
      { title: 'Withdrawals', url: '/admin/withdrawals', icon: Wallet },
      { title: 'Testing', url: '/admin/testing', icon: TestTube },
      { title: 'Payment Testing', url: '/admin/payment-testing', icon: FlaskConical },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Dashboard',
    icon: Monitor,
    items: [
      { title: 'Promos', url: '/admin/promos', icon: Newspaper },
      { title: 'Footer Links', url: '/admin/footer-links', icon: LinkIcon },
      { title: 'Languages', url: '/admin/languages', icon: Globe },
    ],
  },
  {
    id: 'students',
    title: 'Student Dashboard',
    icon: Users,
    items: [
      { title: 'Student Control', url: '/admin/student-control', icon: Users },
      { title: 'Notifications', url: '/admin/notifications', icon: Bell },
    ],
  },
  {
    id: 'teachers',
    title: 'Teacher Dashboard',
    icon: GraduationCap,
    items: [
      { title: 'Teachers', url: '/admin/teachers', icon: GraduationCap },
      { title: 'Teacher Control', url: '/admin/teacher-control', icon: GraduationCap },
    ],
  },
  {
    id: 'universities',
    title: 'Universities Dashboard',
    icon: Building2,
    items: [
      { title: 'Certificates', url: '/admin/certificates', icon: Award },
      { title: 'Degrees', url: '/admin/degrees', icon: FileText },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: Mail,
    items: [
      { title: 'Email Marketing', url: '/admin/email-marketing', icon: Mail },
      { title: 'Newsletter', url: '/admin/newsletter', icon: Newspaper },
      { title: 'Chat Management', url: '/admin/chat', icon: MessageSquare },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Transfers',
    icon: CreditCard,
    items: [
      { title: 'Payment Methods', url: '/admin/payment-methods', icon: CreditCard },
      { title: 'Transfers', url: '/admin/transfers', icon: ArrowRightLeft },
      { title: 'History', url: '/admin/history', icon: History },
    ],
  },
  {
    id: 'system',
    title: 'System',
    icon: Settings,
    items: [
      { title: 'Settings', url: '/admin/settings', icon: Settings },
      { title: 'Maintenance', url: '/admin/maintenance', icon: Wrench },
      { title: 'Security', url: '/admin/security', icon: Shield },
    ],
  },
];

// Flatten all items for search
const allNavItems = navSections.flatMap(section => section.items);

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed: collapsedProp, onCollapsedChange }: AdminSidebarProps) {
  const [collapsedState, setCollapsedState] = useState(false);
  const collapsed = collapsedProp ?? collapsedState;
  const setCollapsed = (val: boolean) => {
    setCollapsedState(val);
    onCollapsedChange?.(val);
  };
  const [query, setQuery] = useState('');
  const [openSections, setOpenSections] = useState<string[]>(['main', 'backend']);
  const location = useLocation();

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    // Filter items that start with query OR contain query
    return allNavItems.filter((item) => {
      const titleLower = item.title.toLowerCase();
      return titleLower.startsWith(q) || titleLower.includes(q);
    });
  }, [query]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const isItemActive = (url: string) => location.pathname === url;

  return (
    <aside
      className={cn(
        'bg-card/95 backdrop-blur-xl border-r border-border flex flex-col transition-all duration-300 h-screen sticky top-0 overflow-hidden z-40',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-2 bg-gradient-to-r from-primary/10 to-accent/10">
        {!collapsed && (
          <div>
            <h2 className="font-bold text-lg text-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Welcome back, Admin</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hover:bg-primary/10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all pages..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 min-h-0 p-2 space-y-1 overflow-y-auto scrollbar-thin">
        {/* Search Results */}
        {filteredItems !== null ? (
          filteredItems.length === 0 ? (
            <div className="px-3 py-6 text-sm text-muted-foreground text-center">No matches found.</div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                Search Results ({filteredItems.length})
              </p>
              {filteredItems.map((item) => (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isItemActive(item.url)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium truncate text-sm">{item.title}</span>
                </NavLink>
              ))}
            </div>
          )
        ) : (
          /* Section Navigation */
          navSections.map((section) => {
            const isOpen = openSections.includes(section.id);
            const hasActiveItem = section.items.some(item => isItemActive(item.url));

            return (
              <Collapsible
                key={section.id}
                open={isOpen}
                onOpenChange={() => !collapsed && toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
                      hasActiveItem
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <section.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="font-medium truncate flex-1 text-sm">{section.title}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                </CollapsibleTrigger>
                {!collapsed && (
                  <CollapsibleContent className="pl-4 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.url}
                        to={item.url}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm',
                          isItemActive(item.url)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </NavLink>
                    ))}
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          })
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            EduVerse Admin v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
