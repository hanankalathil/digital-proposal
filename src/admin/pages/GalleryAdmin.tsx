import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Image as ImageIcon, Trash2, Edit2, MoveVertical } from 'lucide-react';

interface Photo {
  id: string;
  storage_path: string;
  caption: string;
  photo_date: string;
  category: string;
  is_featured: boolean;
  display_order: number;
}

export default function GalleryAdmin() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [photoDate, setPhotoDate] = useState('');
  const [category, setCategory] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
      
    if (data) {
      setPhotos(data);
    }
    setLoading(false);
  }

  // Get public URL for an image
  const getImageUrl = (path: string) => {
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // 2. Insert into Database
      const { error: dbError } = await supabase.from('gallery_photos').insert({
        storage_path: filePath,
        caption,
        photo_date: photoDate || null,
        category,
        is_featured: isFeatured,
        display_order: photos.length // add to end
      });

      if (dbError) throw dbError;

      // Reset form
      setShowAddForm(false);
      setUploadFile(null);
      setCaption('');
      setPhotoDate('');
      setCategory('');
      setIsFeatured(false);
      
      // Reload
      loadPhotos();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!window.confirm('Delete this memory?\n\nThis photo will be removed from the gallery.')) {
      return;
    }

    // 1. Delete from storage
    await supabase.storage.from('photos').remove([storagePath]);
    
    // 2. Delete from DB
    await supabase.from('gallery_photos').delete().eq('id', id);
    
    loadPhotos();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Gallery Management</h1>
          <p className="text-slate-500 mt-1">Upload and organize your photographs.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-blue-700 transition"
        >
          {showAddForm ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Photo</>}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Upload New Photo</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {uploadFile ? (
                <div className="text-blue-600 font-medium">{uploadFile.name}</div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <ImageIcon size={32} className="mb-2 text-slate-400" />
                  <span>Drop photo here or Browse Files</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Caption</label>
                <input 
                  type="text" 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" 
                  placeholder="Optional description" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" 
                  placeholder="e.g. Travel, Dates" 
                />
              </div>
              <div className="flex items-center h-full pt-6">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-slate-300 rounded" 
                />
                <label htmlFor="featured" className="ml-2 text-sm text-slate-700">
                  Featured photo
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isUploading || !uploadFile}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition flex items-center"
              >
                {isUploading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                Save Photo
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-500 text-center">
          <ImageIcon className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-800">No photos yet</h3>
          <p className="mt-1">Start building your gallery by uploading your first photo.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100 transition"
          >
            + Add Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
              <div className="aspect-square bg-slate-100 relative">
                <img 
                  src={getImageUrl(photo.storage_path)} 
                  alt={photo.caption || 'Memory'} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {photo.is_featured && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-sm font-medium text-slate-800 truncate mb-1">
                  {photo.caption || 'Untitled Photo'}
                </div>
                <div className="text-xs text-slate-500 mb-4 flex justify-between">
                  <span>{photo.photo_date ? new Date(photo.photo_date).toLocaleDateString() : 'No date'}</span>
                  <span>{photo.category || 'Uncategorized'}</span>
                </div>
                <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Reorder">
                    <MoveVertical size={16} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(photo.id, photo.storage_path)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition" 
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
