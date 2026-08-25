import { useState, useMemo } from 'react';
import data from '../public/data/latest.json';

type Stock = {
  Symbol: string;
  Company: string;
  Score: string;
  Action: string;
  Industry: string;
  'Current Price'?: number;
  ATH?: number;
  '52W Return'?: number;
  'Beats Nifty500'?: boolean;
  'Beats Sector'?: boolean;
  'Record PAT?'?: boolean;
  'Data Status'?: string;
  _sheet: string;
};

const typedData = data as {
  generated_at: string;
  counts: Record<string, number>;
  stocks: Stock[];
};

const fmtPct = (n: number | undefined) =>
  n == null ? '—' : `${(n * 100).toFixed(2)}%`;

const fmtPrice = (n: number | undefined) =>
  n == null ? '—' : `₹${n.toFixed(2)}`;

export default function Dashboard() {
  const [tab, setTab] = useState<'3/3' | '2/3' | 'all'>('3/3');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let rows = typedData.stocks;
    if (tab === '3/3') rows = rows.filter((r) => r.Score === '3/3');
    if (tab === '2/3') rows = rows.filter((r) => r.Score === '2/3');
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.Symbol.toLowerCase().includes(q) ||
          r.Company.toLowerCase().includes(q) ||
          r.Industry.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [tab, search]);

  const counts = {
    '3/3': typedData.stocks.filter((r) => r.Score === '3/3').length,
    '2/3': typedData.stocks.filter((r) => r.Score === '2/3').length,
    total: typedData.stocks.length,
  };

  const scoreColor = (s: string) => {
    if (s === '3/3') return 'bg-emerald-500 text-white';
    if (s === '2/3') return 'bg-amber-500 text-white';
    return 'bg-red-400 text-white';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mehta 3/3 NSE Screener</h1>
            <p className="text-sm text-slate-500 mt-1">
              Last updated: {typedData.generated_at || 'Unknown'}
            </p>
          </div>
          <a
            href="https://github.com/thejaduijin/growth_scanner/actions"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
          >
            ▶️ Run Screener on GitHub Actions
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-500 rounded-xl p-5 text-white shadow-sm">
            <div className="text-emerald-100 text-sm font-medium">3/3 Super Performers</div>
            <div className="text-3xl font-bold mt-1">{counts['3/3']}</div>
          </div>
          <div className="bg-amber-500 rounded-xl p-5 text-white shadow-sm">
            <div className="text-amber-100 text-sm font-medium">2/3 Hold Candidates</div>
            <div className="text-3xl font-bold mt-1">{counts['2/3']}</div>
          </div>
          <div className="bg-slate-700 rounded-xl p-5 text-white shadow-sm">
            <div className="text-slate-300 text-sm font-medium">Total Screened</div>
            <div className="text-3xl font-bold mt-1">{counts.total}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2">
            {(['3/3', '2/3', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === t
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === '3/3' ? '🎯 3/3 Super' : t === '2/3' ? '⭐ 2/3 Hold' : '📋 All'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search symbol, company, industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Symbol</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Industry</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">ATH</th>
                  <th className="px-4 py-3 text-right">52W Ret</th>
                  <th className="px-4 py-3 text-center">Nifty</th>
                  <th className="px-4 py-3 text-center">Sector</th>
                  <th className="px-4 py-3 text-center">Rec PAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                      No stocks match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{row.Symbol}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.Company}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor(row.Score)}`}>
                        {row.Score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{row.Action}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.Industry}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{fmtPrice(row['Current Price'])}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{fmtPrice(row.ATH)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{fmtPct(row['52W Return'])}</td>
                    <td className="px-4 py-3 text-center">{row['Beats Nifty500'] ? '✅' : '❌'}</td>
                    <td className="px-4 py-3 text-center">{row['Beats Sector'] ? '✅' : '❌'}</td>
                    <td className="px-4 py-3 text-center">{row['Record PAT?'] ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            Showing {filtered.length} of {typedData.stocks.length} stocks
          </div>
        </div>
      </main>
    </div>
  );
}