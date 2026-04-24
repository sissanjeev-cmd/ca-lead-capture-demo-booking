import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, Info, Mail, Zap } from 'lucide-react';

export default function EmailDashboard() {
  const [emails, setEmails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `You are an email aggregator. Fetch and summarize emails from the last 24 hours from these Gmail accounts:
              - sis.sanjeev@gmail.com
              - learnyourway.ai@gmail.com
              - garg1969sanjeev@gmail.com
              - vmanageeverything@gmail.com
              - automation.atwork69@gmail.com
              
              Return ONLY valid JSON (no markdown, no backticks, no preamble) with this exact structure:
              {
                "summary": {
                  "total": number,
                  "unread": number,
                  "important": number,
                  "actionRequired": number
                },
                "important": [
                  { "subject": "string", "from": "string", "account": "string", "preview": "string" }
                ],
                "actionRequired": [
                  { "subject": "string", "from": "string", "account": "string", "preview": "string" }
                ],
                "informational": [
                  { "subject": "string", "from": "string", "account": "string", "preview": "string" }
                ],
                "lowPriority": [
                  { "subject": "string", "from": "string", "account": "string", "preview": "string" }
                ]
              }`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0]?.text || '';
      const cleanJson = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setEmails(parsed);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      setError(err.message || 'Failed to fetch emails');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const EmailSection = ({ title, icon: Icon, emails: sectionEmails, color, count }) => {
    if (!sectionEmails || sectionEmails.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} className="text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
          <span className="ml-auto text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{count}</span>
        </div>
        <div className="space-y-2">
          {sectionEmails.map((email, idx) => (
            <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-medium text-gray-100 line-clamp-1">{email.subject}</p>
                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{email.account}</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{email.from}</p>
              <p className="text-xs text-gray-300 line-clamp-2">{email.preview}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-6">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={28} className="text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Email Summary
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Last 24 hours across all accounts</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="w-full mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Fetching...' : 'Refresh Emails'}
        </button>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 animate-fadeIn">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-200">Error fetching emails</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {emails && !loading && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-4 gap-3 mb-8">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-100">{emails.summary.total}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Unread</p>
                <p className="text-2xl font-bold text-blue-400">{emails.summary.unread}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Important</p>
                <p className="text-2xl font-bold text-amber-400">{emails.summary.important}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Action</p>
                <p className="text-2xl font-bold text-red-400">{emails.summary.actionRequired}</p>
              </div>
            </div>

            {/* Email Sections */}
            <div className="animate-fadeIn">
              <EmailSection
                title="🔴 Action Required"
                icon={Zap}
                emails={emails.actionRequired}
                color="bg-red-600"
                count={emails.actionRequired?.length || 0}
              />
              <EmailSection
                title="⭐ Important"
                icon={AlertCircle}
                emails={emails.important}
                color="bg-amber-600"
                count={emails.important?.length || 0}
              />
              <EmailSection
                title="ℹ️ Informational"
                icon={Info}
                emails={emails.informational}
                color="bg-blue-600"
                count={emails.informational?.length || 0}
              />
              <EmailSection
                title="📌 Low Priority"
                icon={CheckCircle2}
                emails={emails.lowPriority}
                color="bg-gray-600"
                count={emails.lowPriority?.length || 0}
              />
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-xs text-gray-500 text-center mt-8">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        )}

        {/* Initial State */}
        {!emails && !loading && (
          <div className="text-center py-12">
            <Mail size={48} className="text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">Click "Refresh Emails" to load your daily summary</p>
          </div>
        )}
      </div>
    </div>
  );
}