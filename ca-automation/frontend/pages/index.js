import Link from 'next/link';
import ModuleCard from '../components/ModuleCard';

const MODULES = [
  {
    id: 'gst-match',
    title: 'GST Compliance',
    desc: 'Match Sales Register vs GSTR-2A',
    color: 'blue',
    uploads: true,
    files: [
      { name: 'sales', label: 'Sales Register (Excel)' },
      { name: 'gstr2a', label: 'GSTR-2A (Excel)' },
    ],
  },
  {
    id: 'gst-recon',
    title: 'GST Reconciliation',
    desc: 'Compare Payment Register vs GSTR-2B',
    color: 'green',
    uploads: true,
    files: [
      { name: 'payments', label: 'Payment Register (Excel)' },
      { name: 'gstr2b', label: 'GSTR-2B (Excel)' },
    ],
  },
  {
    id: 'bank-recon',
    title: 'Bank Reconciliation',
    desc: 'Match Bank Statement vs Ledger',
    color: 'purple',
    uploads: true,
    files: [
      { name: 'bank', label: 'Bank Statement (Excel)' },
      { name: 'ledger', label: 'Ledger (Excel)' },
    ],
  },
  {
    id: 'tax-compare',
    title: 'Tax Computation',
    desc: 'Old vs New Regime Comparison',
    color: 'orange',
    uploads: false,
  },
  {
    id: 'send-reminders',
    title: 'GST Reminders',
    desc: 'Generate & Send Client Reminders',
    color: 'red',
    uploads: false,
  },
  {
    id: 'year-end',
    title: 'Year-End Tax',
    desc: 'Generate Year-End Tax Report',
    color: 'indigo',
    uploads: false,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CA Automation Suite
          </h1>
          <p className="text-lg text-gray-600">
            Automate your accounting workflows with precision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((mod) => (
            <Link key={mod.id} href={`/modules/${mod.id}`}>
              <ModuleCard module={mod} />
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">📋 Quick Tips</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Modules 1–3 require file uploads. Use sample files from <code className="bg-gray-100 px-2 py-1 rounded">sample_data/</code></li>
            <li>• Modules 4–6 auto-generate data internally (no upload needed)</li>
            <li>• All outputs are downloadable as Excel or PDF</li>
            <li>• Backend must be running on http://localhost:4000</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
