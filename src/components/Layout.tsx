import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, BookOpen, GraduationCap, Calendar, Users, UserCog } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'student' 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/grades', label: 'My Grades', icon: GraduationCap },
        { path: '/attendance', label: 'My Attendance', icon: Calendar },
      ]
    : user?.role === 'teacher'
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/attendance-management', label: 'Attendance Management', icon: Calendar },
        { path: '/grade-management', label: 'Grade Management', icon: GraduationCap },
      ]
    : [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/students', label: 'Students', icon: Users },
        { path: '/teachers', label: 'Teachers', icon: UserCog },
        { path: '/attendance-management', label: 'Attendance Management', icon: Calendar },
        { path: '/grade-management', label: 'Grade Management', icon: GraduationCap },
      ];

  return (
    <>
      <div className="min-h-screen flex">
        <aside className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-primary">Student Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 bg-background">
          <div className="h-full overflow-auto p-8">{children}</div>
        </main>
      </div>

      {/* ⬇⬇ VERY IMPORTANT – this makes toast messages work */}
      <Toaster />
    </>
  );
}
