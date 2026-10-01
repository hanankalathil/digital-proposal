import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Mail, Save } from 'lucide-react';

export default function MessagesAdmin() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Letter State
  const [letterId, setLetterId] = useState<string | null>(null);
  const [letterTitle, setLetterTitle] = useState('');
  const [letterOpening, setLetterOpening] = useState('');
  const [letterMessage, setLetterMessage] = useState('');
  const [letterClosing, setLetterClosing] = useState('');

  // Secret Message State
  const [secretId, setSecretId] = useState<string | null>(null);
  const [secretTeaser, setSecretTeaser] = useState('');
  const [secretMessage, setSecretMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    
    // Get Letter
    const { data: letterData } = await supabase
      .from('letter_content')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (letterData) {
      setLetterId(letterData.id);
      setLetterTitle(letterData.title || '');
      setLetterOpening(letterData.opening_text || '');
      setLetterMessage(letterData.message || '');
      setLetterClosing(letterData.closing_text || '');
    }

    // Get Secret Message
    const { data: secretData } = await supabase
      .from('secret_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (secretData) {
      setSecretId(secretData.id);
      setSecretTeaser(secretData.teaser_text || '');
      setSecretMessage(secretData.message || '');
    }

    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Save Letter
      if (letterId) {
        await supabase.from('letter_content').update({
          title: letterTitle,
          opening_text: letterOpening,
          message: letterMessage,
          closing_text: letterClosing,
          updated_at: new Date().toISOString()
        }).eq('id', letterId);
      } else {
        const { data } = await supabase.from('letter_content').insert({
          title: letterTitle,
          opening_text: letterOpening,
          message: letterMessage,
          closing_text: letterClosing,
        }).select().single();
        if (data) setLetterId(data.id);
      }

      // Save Secret
      if (secretId) {
        await supabase.from('secret_messages').update({
          teaser_text: secretTeaser,
          message: secretMessage,
          updated_at: new Date().toISOString()
        }).eq('id', secretId);
      } else {
        const { data } = await supabase.from('secret_messages').insert({
          teaser_text: secretTeaser,
          message: secretMessage,
        }).select().single();
        if (data) setSecretId(data.id);
      }

      alert('Messages saved successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Messages & Letters</h1>
          <p className="text-slate-500 mt-1">Manage the personal letter and interactive secret message.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* The Letter */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center text-slate-800 mb-2 border-b border-slate-100 pb-4">
            <Mail className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-lg font-medium">The Personal Letter</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Letter Title</label>
            <input 
              type="text" 
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 bg-slate-50" 
              placeholder="e.g. A little something I wanted you to read." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Opening Text</label>
            <textarea 
              value={letterOpening}
              onChange={(e) => setLetterOpening(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 resize-none font-serif" 
              placeholder="My dearest..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Main Message</label>
            <textarea 
              value={letterMessage}
              onChange={(e) => setLetterMessage(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-slate-300 rounded-md outline-none focus:border-blue-500 font-serif leading-relaxed" 
              placeholder="Write your heart out here..." 
            />
            <div className="text-right text-xs text-slate-400 mt-1">
              {letterMessage.length} characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Closing Text</label>
            <textarea 
              value={letterClosing}
              onChange={(e) => setLetterClosing(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 resize-none font-serif" 
              placeholder="With all my love," 
            />
          </div>
        </div>

        {/* The Secret Message */}
        <div className="bg-slate-900 p-6 rounded-xl shadow-sm space-y-5 text-slate-200">
          <div className="flex items-center text-white mb-2 border-b border-slate-700 pb-4">
            <h2 className="text-lg font-medium">Secret Interactive Message</h2>
          </div>
          <p className="text-sm text-slate-400 mb-4">This message is hidden on the website until she interacts with a specific element.</p>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Teaser Text</label>
            <input 
              type="text" 
              value={secretTeaser}
              onChange={(e) => setSecretTeaser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 rounded-md outline-none focus:border-blue-500 bg-slate-800 text-white" 
              placeholder="e.g. I have a secret to tell you..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">The Actual Secret</label>
            <textarea 
              value={secretMessage}
              onChange={(e) => setSecretMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-700 rounded-md outline-none focus:border-blue-500 bg-slate-800 text-white font-serif" 
              placeholder="The truth is..." 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white font-medium transition"
          >
            Preview Letter
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            Publish Changes
          </button>
        </div>

      </form>
    </div>
  );
}
