import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ImageIcon, BookHeart, Clock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Overview() {
  const [stats, setStats] = useState({
    photos: 0,
    memories: 0,
    timeline: 0,
    messages: 1, // Currently only 1 message (letter + secret) supported via requirements
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Run these queries in parallel
      const [photosRes, memoriesRes, timelineRes] = await Promise.all([
        supabase.from('gallery_photos').select('*', { count: 'exact', head: true }),
        supabase.from('memories').select('*', { count: 'exact', head: true }),
        supabase.from('timeline_events').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        photos: photosRes.count || 0,
        memories: memoriesRes.count || 0,
        timeline: timelineRes.count || 0,
        messages: 1, 
      });
      setLoading(false);
    }
    
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Overview</h1>
        <p className="text-slate-500 mt-1">Here is what is currently on the website.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <ImageIcon className="text-blue-500 mb-2 h-8 w-8" />
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Photos</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">
            {loading ? '-' : stats.photos}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <BookHeart className="text-rose-500 mb-2 h-8 w-8" />
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Memories</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">
            {loading ? '-' : stats.memories}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Clock className="text-emerald-500 mb-2 h-8 w-8" />
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Timeline</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">
            {loading ? '-' : stats.timeline}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Mail className="text-amber-500 mb-2 h-8 w-8" />
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Messages</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">
            {stats.messages}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-medium text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/gallery" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center font-medium text-slate-700 hover:border-blue-300 hover:text-blue-600 transition-all">
              + Add Photo
            </Link>
            <Link to="/admin/memories" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center font-medium text-slate-700 hover:border-rose-300 hover:text-rose-600 transition-all">
              + Add Memory
            </Link>
            <Link to="/admin/timeline" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-600 transition-all">
              + Add Timeline Event
            </Link>
            <Link to="/admin/messages" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center font-medium text-slate-700 hover:border-amber-300 hover:text-amber-600 transition-all">
              Edit Letter
            </Link>
            <Link to="/admin/music" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center font-medium text-slate-700 hover:border-purple-300 hover:text-purple-600 transition-all">
              Change Music
            </Link>
            <a href="/" target="_blank" className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center font-medium text-slate-700 hover:border-slate-400 transition-all">
              Preview Website
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-slate-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-slate-500 h-64">
            <Clock className="h-10 w-10 text-slate-300 mb-3" />
            <p>Activity tracking will be implemented soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
