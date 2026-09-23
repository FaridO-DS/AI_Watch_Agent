import { useState } from 'react';
import { Terminal, Globe, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';

export default function AgentForm({ onLaunch, loading }) {
  const [topic, setTopic] = useState('');
  const [urls, setUrls] = useState(['']);
  const [error, setError] = useState('');

  const handleAddUrl = () => setUrls([...urls, '']);
  
  const handleRemoveUrl = (indexToRemove) => {
    if (urls.length === 1) {
      setUrls(['']);
    } else {
      setUrls(urls.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a topic for the AI Watch Agent.');
      return;
    }

    setError('');
    const filteredUrls = urls.filter(url => url.trim() !== '');
    
    // Call parent launcher function
    const result = await onLaunch(topic, filteredUrls);
    if (result.success) {
      setTopic('');
      setUrls(['']);
    } else if (result.error) {
      setError(result.error)
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-fit">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-cyan-400" /> New Agent Task
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Topic / Keyword</label>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Quantum Computing Trends"
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Target URLs</label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="https://example.com"
                    disabled={loading}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => handleRemoveUrl(index)}
                  disabled={loading}
                  className="p-2 text-slate-500 hover:text-rose-400 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={handleAddUrl}
            disabled={loading}
            className="mt-3 flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add another URL
          </button>
        </div>

        {error && (
          <div className="flex gap-2 items-start bg-rose-950/40 border border-rose-900/60 text-rose-300 p-3 rounded-lg text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 rounded-lg transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Gathering Intel...
            </>
          ) : 'Launch Watch Agent'}
        </button>
      </form>
    </section>
  );
}
