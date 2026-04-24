import { useRouter } from 'next/router';
import Link from 'next/link';
import ModuleRunner from '../../components/ModuleRunner';

const MODULES_CONFIG = {
  'gst-match': {
    title: 'GST Compliance',
    desc: 'Match invoices in your Sales Register against what suppliers reported in GSTR-2A.',
    uploads: true,
    files: [
      { name: 'sales', label: 'Sales Register (Excel)' },
      { name: 'gstr2a', label: 'GSTR-2A (Excel)' },
    ],
    endpoint: 'gst-match',
  },
  'gst-recon': {
    title: 'GST Reconciliation',
    desc: 'Compare tax payments made against GSTR-2B liability.',
    uploads: true,
    files: [
      { name: 'payments', label: 'Payment Register (Excel)' },
      { name: 'gstr2b', label: 'GSTR-2B (Excel)' },
    ],
    endpoint: 'gst-recon',
  },
  'bank-recon': {
    title: 'Bank Reconciliation',
    desc: 'Match bank statement entries against your ledger.',
    uploads: true,
    files: [
      { name: 'bank', label: 'Bank Statement (Excel)' },
      { name: 'ledger', label: 'Ledger (Excel)' },
    ],
    endpoint: 'bank-recon',
  },
  'tax-compare': {
    title: 'Tax Computation',
    desc: 'Generates per-client Tax Computation Statements (Old vs New Regime, AY 2026-27) and send emails with respective PDF reports.',
    uploads: true,
    optional: true,
    files: [
      { name: 'invest', label: 'Client Investments Excel (optional — uses sample_data if skipped)' },
    ],
    endpoint: 'tax-compare',
    type: 'tax',
  },
  'send-reminders': {
    title: 'GST Reminders',
    desc: '',
    uploads: false,
    endpoint: 'send-reminders',
    type: 'reminders',
  },
  'year-end': {
    title: 'Year-End Tax',
    desc: 'Sends final tax computation statements to clients for review. Clients are requested to verify the enclosed computation and report any discrepancies.',
    uploads: true,
    optional: true,
    files: [
      { name: 'invest', label: 'Client Investments Excel (optional — uses sample_data if skipped)' },
    ],
    endpoint: 'year-end',
    type: 'tax',
  },
};

export default function ModulePage() {
  const router = useRouter();
  const { id } = router.query;
  const config = id ? MODULES_CONFIG[id] : null;

  if (!config) {
    return (
      <div className="container py-8">
        <p className="text-gray-600">Module not found.</p>
        <Link href="/">← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="container py-3">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{config.title}</h1>
          {config.desc && <p className="text-gray-600 text-sm mt-0.5">{config.desc}</p>}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="container py-4">
          <div className="max-w-2xl">
            <ModuleRunner module={config} endpoint={config.endpoint} />
          </div>
        </div>
      </div>
    </div>
  );
}
