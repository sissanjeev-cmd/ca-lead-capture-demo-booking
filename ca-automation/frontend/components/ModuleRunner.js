import { useState, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function ModuleRunner({ module, endpoint }) {
  const [files, setFiles]   = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const fileInputs = useRef({});

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files?.[0];
    if (file) setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data = {};

      if (module.uploads) {
        // Upload whichever files were selected (optional ones may be absent)
        if (Object.keys(files).length > 0) {
          const formData = new FormData();
          Object.entries(files).forEach(([key, file]) => formData.append(key, file));
          const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          data = uploadRes.data.files;
        }
      }

      const processRes = await axios.post(`${API_URL}/process/${endpoint}`, data);
      setResult(processRes.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // For non-optional modules, all files must be selected. Optional modules can run without them.
  const canRun = module.optional
    ? true
    : !module.uploads || Object.keys(files).length === module.files?.length;

  return (
    <div className="space-y-3">

      {/* File uploads — hidden once results are shown */}
      {module.uploads && !result && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-4">Upload Files</h3>
          <div className="space-y-4">
            {module.files.map((file) => (
              <div key={file.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {file.label}
                  {module.optional && (
                    <span className="ml-2 text-xs text-gray-400 font-normal">(optional)</span>
                  )}
                </label>
                <input
                  ref={(el) => (fileInputs.current[file.name] = el)}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileChange(file.name, e)}
                  className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                />
                {files[file.name] && (
                  <p className="mt-1 text-sm text-green-600">✓ {files[file.name].name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run / Run Again button */}
      <button
        onClick={result ? () => { setResult(null); setError(null); } : handleRun}
        disabled={loading || (!result && !canRun)}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <span className="spinner" />}
        {loading ? 'Processing & Emailing...' : result ? 'Run Again' : 'Run'}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm space-y-2">
          <p><strong>Error:</strong> {error}</p>
          {error.includes('SMTP') && (
            <div className="bg-red-100 rounded p-3 text-xs space-y-1">
              <p className="font-semibold">📧 How to fix SMTP (Gmail App Password):</p>
              <ol className="list-decimal list-inside space-y-1 text-red-700">
                <li>Enable 2-Step Verification on <strong>sis.sanjeev@gmail.com</strong></li>
                <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" className="underline">myaccount.google.com/apppasswords</a></li>
                <li>Create an App Password → copy the 16-character code</li>
                <li>Open <code className="bg-red-200 px-1 rounded">backend/.env</code> and set:<br/>
                  <code className="bg-red-200 px-1 rounded">SMTP_PASS=xxxx xxxx xxxx xxxx</code>
                </li>
                <li>Restart the backend: <code className="bg-red-200 px-1 rounded">npm start</code></li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3">

          {/* Success banner */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="font-semibold text-green-900">
              {result.count === 0 && result.message
                ? `✓ ${result.message}`
                : `✓ Done — ${result.count ?? result.files?.length ?? 1} report(s) generated${result.emailReport?.length > 0 ? ` and ${result.emailReport.filter(r=>r.sent).length} email(s) sent` : ''}`
              }
            </p>
            {result.totalPending > 0 && (
              <p className="text-xs text-green-700 mt-1">
                {result.totalPending} pending reminder(s) processed
              </p>
            )}
            {(result.emailReport?.length > 0 || result.count > 0) && (
              <p className="text-xs text-green-700 mt-1">
                Sent from <span className="font-mono">sis.sanjeev@gmail.com</span>
              </p>
            )}
          </div>

          {/* Summary tiles */}
          {result.summary && (
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Summary</h4>
              <div className="space-y-1">
                {Object.entries(result.summary).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-600">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.rows && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
              <strong>{result.rows}</strong> records processed
            </div>
          )}

          {/* Per-client tax summary table */}
          {result.clients?.length > 0 && module.type === 'tax' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h4 className="font-medium text-sm text-gray-700">
                  Per-Client Tax Summary ({result.clients.length} clients)
                </h4>
              </div>
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-900 text-white sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2">Client</th>
                      <th className="text-right px-3 py-2">Old Regime</th>
                      <th className="text-right px-3 py-2">New Regime</th>
                      <th className="text-center px-3 py-2">Recommended</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.clients.map((c, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="px-3 py-2 font-medium">{c.name}</td>
                        <td className="px-3 py-2 text-right font-mono">₹{fmt(c.old_tax)}</td>
                        <td className="px-3 py-2 text-right font-mono">₹{fmt(c.new_tax)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            c.regime === 'New Regime'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {c.regime}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recommendation for non-tax modules */}
          {result.recommendation && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-700">
              <strong>Recommendation:</strong> {result.recommendation}<br />
              <strong>Old Regime Tax:</strong> ₹{fmt(result.old_tax)}<br />
              <strong>New Regime Tax:</strong> ₹{fmt(result.new_tax)}
            </div>
          )}

          {/* Email delivery report */}
          {result.emailReport?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 space-y-1">
                <h4 className="font-medium text-sm text-gray-700">
                  Email Delivery Report
                  <span className="ml-2 text-xs text-gray-500">
                    ({result.emailReport.filter(r=>r.sent).length}/{result.emailReport.length} sent)
                  </span>
                </h4>
                {/* Test mode banner */}
                {result.emailReport[0]?.deliveredTo !== result.emailReport[0]?.email && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-1.5 text-xs text-yellow-800">
                    <span>🧪</span>
                    <span>
                      <strong>Test Mode ON</strong> — all emails redirected to{' '}
                      <span className="font-mono font-semibold">{result.emailReport[0]?.deliveredTo}</span>.
                      Remove <code className="bg-yellow-100 px-1 rounded">TEST_EMAIL</code> from{' '}
                      <code className="bg-yellow-100 px-1 rounded">backend/.env</code> to send to real clients.
                    </span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {result.emailReport.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2 text-sm">
                    <div>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{r.email}</span>
                    </div>
                    {r.sent
                      ? <span className="text-green-600 font-semibold text-xs">✓ Sent</span>
                      : <span className="text-red-500 font-semibold text-xs" title={r.error}>✗ Failed</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download links */}
          {(result.download || result.zipUrl) && (
            <div className="space-y-2">
              {result.download && (
                <a href={result.download} download className="block btn-secondary text-center text-sm">
                  📥 Download Output
                </a>
              )}
              {result.zipUrl && (
                <a href={result.zipUrl} download className="block btn-primary text-center text-sm">
                  📦 Download Zip File
                </a>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
