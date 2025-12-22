import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Fixed Top Navbar */}
      <AdminNavbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16">
        <AdminSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <main className="flex-1 overflow-auto min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
