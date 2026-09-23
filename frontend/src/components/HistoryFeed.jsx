import { useState, useMemo } from 'react';
import { Calendar, FileSpreadsheet, Search, SlidersHorizontal, ShieldAlert, Download } from 'lucide-react';

export default function HistoryFeed({ history }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter history dynamically using useMemo
  const filteredHistory = useMemo(() => {
    return history.filter((report) => {
      const matchesSearch = 
        report.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (dateFilter === 'all') return true;
      
      const reportDate = report.createdAt ? new Date(report.createdAt) : new Date();
      const now = new Date();
      const diffTime = Math.abs(now - reportDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === 'today') {
        return reportDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        return diffDays <= 7;
      } else if (dateFilter === 'month') {
        return diffDays <= 30;
      }
      return true;
    });
  }, [history, searchTerm, dateFilter]);

  const exportToCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = ['ID', 'Topic', 'Summary', 'Created At'];
    const rows = filteredHistory.map(report => [
      report.id || report._id || '',
      `"${(report.topic || '').replace(/"/g, '""')}"`,
      `"${(report.summary || '').replace(/"/g, '""')}"`,
      report.createdAt ? new Date(report.createdAt).toISOString() : new Date().toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ai_watch_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSingle = (report) => {
    try {
      // 1. Create an invisible iframe to handle clean print jobs without block popups
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      
      // Build visual items safely matching the LiveReport schema
      const urlsHtml = report.scraped_urls?.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('') || '<li>No sources provided</li>';
      const trendsHtml = report.key_trends?.map(trend => `<li>${trend}</li>`).join('') || '<li>No explicit trends identified</li>';
      
      doc.write(`
        <html>
          <head>
            <title>AI Watch Report - ${report.topic}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
              h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; font-size: 24px; }
              h2 { color: #0f172a; margin-top: 25px; margin-bottom: 10px; font-size: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
              .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
              .meta-title { font-weight: bold; color: #475569; }
              .impact-badge { display: inline-block; padding: 4px 12px; background: #eef2ff; color: #4f46e5; border-radius: 9999px; font-weight: bold; margin-top: 5px; }
              .summary-text { white-space: pre-wrap; color: #334155; font-size: 14px; text-align: justify; }
              ul { padding-left: 20px; margin: 5px 0; font-size: 14px; color: #334155; }
              li { margin-bottom: 4px; }
              a { color: #2563eb; text-decoration: none; }
            </style>
          </head>
          <body>
            <h1>AI Watch Agent Intelligence Report</h1>
            
            <div class="meta-box">
              <span class="meta-title">Target Topic:</span> ${report.topic}<br/>
              <span class="meta-title">Generated on:</span> ${report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString()}<br/>
              <div class="impact-badge">Global Impact Score: ${report.impact_score || 0}/100</div>
            </div>

            <h2>Scraped Intelligence Sources</h2>
            <ul>${urlsHtml}</ul>

            <h2>Analysis Summary & Context</h2>
            <div class="summary-text">${report.summary || 'No summary text available.'}</div>

            <h2>Identified Key Trends</h2>
            <ul>${trendsHtml}</ul>
          </body>
        </html>
      `);
      doc.close();

      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

    } catch (printErr) {
      console.error("[History Print Failure] Native iframe rendering failed:", printErr.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" /> Historical Reports
        </h2>
        
        {history.length > 0 && (
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 transition font-medium self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Filtered to CSV
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by topic or content..."
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Past 30 Days</option>
          </select>
        </div>
      </div>
      
      {/* Feed Rendering */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
          <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No historical scans match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredHistory.map((report) => (
            <div 
              key={report.id || report._id || Math.random().toString()} 
              className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition group"
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div>
                  <h4 className="font-semibold text-sm text-slate-200">{report.topic}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span>Impact: <strong className="text-indigo-400">{report.impact_score || 0}/100</strong></span>
                    <span>•</span>
                    <span>Sources: <strong>{report.scraped_urls?.length || 0} link(s)</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                  <button
                    onClick={() => handlePrintSingle(report)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-400 text-xs transition flex items-center gap-0.5 p-1 bg-slate-900 border border-slate-800 rounded-md"
                    title="Export to PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 text-justify">
                {report.summary || 'No summary text available.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
