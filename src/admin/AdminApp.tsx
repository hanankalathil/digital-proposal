import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import './admin.css';

import AdminLayout from './AdminLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import GalleryAdmin from './pages/GalleryAdmin';
import MemoriesAdmin from './pages/MemoriesAdmin';
import TimelineAdmin from './pages/TimelineAdmin';
import MessagesAdmin from './pages/MessagesAdmin';

// A simple wrapper to protect routes
function RequireAuth({ session }: { session: Session | null }) {
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <div className="admin-root min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes>
        <Route path="/login" element={
          session ? <Navigate to="/admin" replace /> : <Login />
        } />
        
        <Route element={<RequireAuth session={session} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="gallery" element={<GalleryAdmin />} />
            <Route path="memories" element={<MemoriesAdmin />} />
            <Route path="timeline" element={<TimelineAdmin />} />
            <Route path="messages" element={<MessagesAdmin />} />
            <Route path="music" element={<div className="p-4">Music Admin</div>} />
            <Route path="appearance" element={<div className="p-4">Appearance Admin</div>} />
            <Route path="settings" element={<div className="p-4">Settings Admin</div>} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}
