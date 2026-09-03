import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, BookHeart, Trash2, Edit2, MoveVertical } from 'lucide-react';

interface Memory {
  id: string;
  title: string;
  description: string;
  memory_date: string;
  location: string;
  personal_note: string;
  is_visible: boolean;
  is_featured: boolean;
}

export default function MemoriesAdmin() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memoryDate, setMemoryDate] = useState('');
  const [location, setLocation] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (data) setMemories(data);
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('memories').insert({
        title,
        description,
        memory_date: memoryDate || null,
        location,
        personal_note: personalNote,
        is_visible: isVisible,
        is_featured: isFeatured,
        display_order: memories.length
      });

      if (error) throw error;

      setShowAddForm(false);
      setTitle('');
      setDescription('');
      setMemoryDate('');
      setLocation('');
      setPersonalNote('');
      setIsVisible(true);
      setIsFeatured(false);
      
      loadMemories();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this memory?')) return;
    await supabase.from('memories').delete().eq('id', id);
    loadMemories();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Memories</h1>
          <p className="text-slate-500 mt-1">Manage the stories and special moments.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 transition"
        >
          {showAddForm ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Memory</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium mb-4">New Memory</h2>
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" 
                  placeholder="e.g. That Random Evening" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" 
                  placeholder="e.g. Kochi" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 resize-none" 
                  placeholder="A simple day that somehow became special." 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Personal Note</label>
                <textarea 
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 resize-none bg-amber-50/50" 
                  placeholder="Add something only we would understand..." 
                />
              </div>

              <div className="md:col-span-2 flex space-x-6 pt-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="visible" 
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded" 
                  />
                  <label htmlFor="visible" className="ml-2 text-sm text-slate-700">Publicly visible</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="featured_memory" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded" 
                  />
                  <label htmlFor="featured_memory" className="ml-2 text-sm text-slate-700">Featured memory</label>
                </div>
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
                disabled={isSaving || !title}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition flex items-center"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Save Memory
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : memories.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-500 text-center">
          <BookHeart className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-800">No memories yet.</h3>
          <p className="mt-1">Start building your story by adding your first memory.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100 transition"
          >
            + Add Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((memory) => (
            <div key={memory.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-slate-800">{memory.title}</h3>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                  <button className="p-1 text-slate-400 hover:text-blue-600 rounded"><MoveVertical size={16} /></button>
                  <button className="p-1 text-slate-400 hover:text-slate-800 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(memory.id)} className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 mb-3 flex items-center space-x-2">
                {memory.memory_date && <span>{new Date(memory.memory_date).toLocaleDateString()}</span>}
                {memory.memory_date && memory.location && <span>•</span>}
                {memory.location && <span>{memory.location}</span>}
              </div>
              
              <p className="text-sm text-slate-600 mb-4 flex-1 line-clamp-2">
                {memory.description}
              </p>
              
              <div className="flex items-center space-x-2 mt-auto">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${memory.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {memory.is_visible ? 'Visible' : 'Hidden'}
                </span>
                {memory.is_featured && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                    Featured
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-50 text-blue-600 ml-auto cursor-pointer hover:bg-blue-100 transition">
                  Manage Photos
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
