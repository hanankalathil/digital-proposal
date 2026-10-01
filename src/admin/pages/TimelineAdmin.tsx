import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Clock, Trash2, Edit2, MoveVertical, Image as ImageIcon } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_path: string;
  is_visible: boolean;
  display_order: number;
}

export default function TimelineAdmin() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .order('display_order', { ascending: true })
      .order('event_date', { ascending: true });

    if (data) setEvents(data);
    setLoading(false);
  }

  const getImageUrl = (path: string) => {
    if (!path) return null;
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let image_path = null;
      
      if (uploadFile) {
        const fileExt = uploadFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        image_path = `timeline/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(image_path, uploadFile);

        if (uploadError) throw uploadError;
      }

      const { error } = await supabase.from('timeline_events').insert({
        title,
        description,
        event_date: eventDate || null,
        location,
        image_path,
        is_visible: isVisible,
        display_order: events.length
      });

      if (error) throw error;

      setShowAddForm(false);
      setTitle('');
      setDescription('');
      setEventDate('');
      setLocation('');
      setUploadFile(null);
      setIsVisible(true);
      
      loadEvents();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, imagePath: string | null) => {
    if (!window.confirm('Delete this timeline event?')) return;
    
    if (imagePath) {
      await supabase.storage.from('photos').remove([imagePath]);
    }
    
    await supabase.from('timeline_events').delete().eq('id', id);
    loadEvents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Timeline Management</h1>
          <p className="text-slate-500 mt-1">Chronological events that make up your story.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-emerald-700 transition"
        >
          {showAddForm ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Event</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium mb-4">New Timeline Event</h2>
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-emerald-500" 
                  placeholder="e.g. The Beginning" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-emerald-500 resize-none" 
                  placeholder='"The day everything started."' 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location (Optional)</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-emerald-500" 
                  placeholder="e.g. Central Park" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md outline-none focus:border-emerald-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                />
              </div>

              <div className="md:col-span-2 flex items-center pt-2">
                <input 
                  type="checkbox" 
                  id="visible_event" 
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded" 
                />
                <label htmlFor="visible_event" className="ml-2 text-sm text-slate-700">Publicly visible</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving || !title || !eventDate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition flex items-center"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Save Event
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-500 text-center">
          <Clock className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-800">No timeline events yet.</h3>
          <p className="mt-1">Add significant milestones to your timeline.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex group">
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </div>
                    <h3 className="text-lg font-medium text-slate-800">{event.title}</h3>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-1 text-slate-400 hover:text-emerald-600 rounded"><MoveVertical size={16} /></button>
                    <button className="p-1 text-slate-400 hover:text-slate-800 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(event.id, event.image_path)} className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                  </div>
                </div>
                
                {event.location && (
                  <div className="text-sm text-slate-500 mb-2">{event.location}</div>
                )}
                
                <p className="text-sm text-slate-600 italic">
                  {event.description}
                </p>
              </div>

              {event.image_path && (
                <div className="ml-6 w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                  <img src={getImageUrl(event.image_path) || ''} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
