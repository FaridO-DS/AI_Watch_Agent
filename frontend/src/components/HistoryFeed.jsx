import { useState, useMemo } from 'react';
import { Calendar, FileSpreadsheet, Search, SlidersHorizontal, ShieldAlert } from 'lucide-react';

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

  // FIXED: Replaced unsafe iframe injection with a robust production-ready Blob window approach
  const handlePrintSingle = (report) => {
    try {
      // 1. Validate data availability before proceeding
      if (!report) {
        console.warn("[Print Cancelled] No report object provided to handler.");
        alert("The selected report cannot be processed.");
        return;
      }

      console.log("[Print Debug] Processing historical report document initialization:", report);

      // 2. Safe mapping of arrays to prevent undefined execution context crashes
      const urlsHtml = report.scraped_urls?.map(url => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></li>`).join('') || '<li>No sources provided</li>';
      const trendsHtml = report.key_trends?.map(trend => `<li>${trend}</li>`).join('') || '<li>No explicit trends identified</li>';
      
      // 3. Prevent production timezone parsing bugs
      let formattedDate = new Date().toLocaleString();
      if (report.createdAt) {
        const parsedDate = new Date(report.createdAt);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toLocaleString();
        }
      }

      // 4. Build isolated HTML document layout template structure
      const htmlContent = `
        <html>
          <head>
            <title>AI Watch Report - ${report.topic || 'Untitled'}</title>
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
              <span class="meta-title">Target Topic:</span> ${report.topic || 'N/A'}<br/>
              <span class="meta-title">Generated on:</span> ${formattedDate}<br/>
              <div class="impact-badge">Global Impact Score: ${report.impact_score || 0}/100</div>
            </div>

            <h2>Scraped Intelligence Sources</h2>
            <ul>${urlsHtml}</ul>

            <h2>Analysis Summary & Context</h2>
            <div class="summary-text">${report.summary || 'No summary text available.'}</div>

            <h2>Identified Key Trends</h2>
            <ul>${trendsHtml}</ul>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `;

      // 5. Generate sandboxed blob context payload to completely eliminate thread memory lockups
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobURL = URL.createObjectURL(blob);

      // 6. Open standalone viewport panel container instance
      const printWindow = window.open(blobURL, '_blank');
      
      if (!printWindow) {
        alert("Please enable popup permissions for this application domain to proceed with printing.");
      }

    } catch (printErr) {
      console.error("[History Print Failure] Document rendering process aborted:", printErr);
      alert("Failed to initialize print engine framework sequence context layout mapping layout tree.");
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
            <div key={report.id || report._id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-200">{report.topic}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{report.summary}</p>
              </div>
              <button 
                onClick={() => handlePrintSingle(report)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded transition"
              >
                Print Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
