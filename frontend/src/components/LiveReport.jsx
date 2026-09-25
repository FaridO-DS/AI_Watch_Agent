import { FileText } from 'lucide-react';

export default function LiveReport({ currentReport }) {
  if (!currentReport) return null;

  const handlePrint = () => {
  try {
    if (!currentReport) {
      alert("Report data is not ready yet.");
      return;
    }

    const urlsHtml = currentReport?.scraped_urls?.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('') || '<li>No sources provided</li>';
    const trendsHtml = currentReport?.key_trends?.map(trend => `<li>${trend}</li>`).join('') || '<li>No explicit trends identified</li>';
    
    let formattedDate = new Date().toLocaleString();
    if (currentReport?.createdAt) {
      const parsedDate = new Date(currentReport.createdAt);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toLocaleString();
      }
    }

    // 1. On prépare le code HTML complet
    const htmlContent = `
      <html>
        <head>
          <title>AI Watch Report - ${currentReport?.topic || 'Untitled'}</title>
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
            <span class="meta-title">Target Topic:</span> ${currentReport?.topic || 'N/A'}<br/>
            <span class="meta-title">Generated on:</span> ${formattedDate}<br/>
            <div class="impact-badge">Global Impact Score: ${currentReport?.impact_score || 0}/100</div>
          </div>
          <h2>Scraped Intelligence Sources</h2>
          <ul>${urlsHtml}</ul>
          <h2>Analysis Summary & Context</h2>
          <div class="summary-text">${currentReport?.summary || 'No summary text available.'}</div>
          <h2>Identified Key Trends</h2>
          <ul>${trendsHtml}</ul>
          <script>
            // Déclenche l'impression automatiquement dès que la page s'ouvre
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    // 2. Création d'un Blob HTML sécurisé (Évite de saturer la mémoire et de crash l'iframe)
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobURL = URL.createObjectURL(blob);

    // 3. Ouvrir dans un nouvel onglet propre pour impression
    const newWindow = window.open(blobURL, '_blank');
    
    if (!newWindow) {
      alert("Please allow popups for this website to print the report.");
    }

  } catch (err) {
    alert("An error occurred while preparing the print: " + err.message);
  }
};



  return (
    <div className="bg-gradient-to-b from-slate-900 to-indigo-950/20 border border-indigo-900/50 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-start">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Latest Live Generation
        </span>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
        >
          <FileText className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-1">{currentReport.topic}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Impact: <strong className="text-indigo-400">{currentReport.impact_score || 0}/100</strong></span>
          <span>•</span>
          <span>Sources: <strong>{currentReport.scraped_urls?.length || 0} link(s)</strong></span>
        </div>
      </div>

      <div className="border-t border-slate-800/60 pt-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Executive Summary</h4>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap text-justify">
          {currentReport.summary}
        </p>
      </div>

      {currentReport.key_trends?.length > 0 && (
        <div className="border-t border-slate-800/60 pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Key Trends</h4>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {currentReport.key_trends.map((trend, index) => (
              <li key={index} className="text-slate-300">{trend}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
