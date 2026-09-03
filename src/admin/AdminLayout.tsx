import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  BookHeart, 
  Clock, 
  Mail, 
  Music, 
  Paintbrush, 
  Settings, 
  LogOut,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const navItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard },
  { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
  { name: 'Memories', path: '/admin/memories', icon: BookHeart },
  { name: 'Timeline', path: '/admin/timeline', icon: Clock },
  { name: 'Messages', path: '/admin/messages', icon: Mail },
  { name: 'Music', path: '/admin/music', icon: Music },
  { name: 'Appearance', path: '/admin/appearance', icon: Paintbrush },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Admin Dashboard</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 w-full"
          >
            <ExternalLink className="mr-3 h-5 w-5 text-slate-400" />
            View Website
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Dashboard</h2>
          <button onClick={handleLogout} className="text-red-600 p-2"><LogOut size={20} /></button>
        </header>
        
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
