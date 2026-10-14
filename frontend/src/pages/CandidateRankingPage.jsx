import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { getExportUrl } from '../api';

export function CandidateRankingPage({ results, onSelectCandidate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false); // default descending (highest score first)

  const sortedCandidates = useMemo(() => {
    return (results || [])
      .filter((c) => {
        const query = searchTerm.toLowerCase();
        return (
          c.Candidate.toLowerCase().includes(query) ||
          (c['Matched Skills'] || []).some((s) => s.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        const scoreA = a['Compatibility Index'] || 0;
        const scoreB = b['Compatibility Index'] || 0;
        return sortAsc ? scoreA - scoreB : scoreB - scoreA;
      });
  }, [results, searchTerm, sortAsc]);

  const getScoreTheme = (score) => {
    if (score >= 70) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
        bar: 'bg-emerald-500'
      };
    } else if (score >= 50) {
      return {
        badge: 'bg-blue-50 text-blue-800 border-blue-200/90',
        bar: 'bg-blue-500'
      };
    } else {
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-200/90',
        bar: 'bg-amber-500'
      };
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-5">
      {/* Page Heading & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Candidate Ranking</h2>
          <p className="text-xs text-stone-500 mt-1">
            Candidates ordered by multi-criteria textual alignment to the job description.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate or skill..."
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-stone-800"
            />
          </div>

          <a
            href={getExportUrl('smartresume_candidate_ranking.csv')}
            download
            className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-stone-700 hover:text-blue-700 text-xs font-medium rounded-md border border-stone-200 hover:border-blue-200 transition-colors inline-flex items-center space-x-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>CSV</span>
          </a>
        </div>
      </div>

      {/* Simple Data Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px] select-none">
              <th className="py-2.5 px-4 font-medium w-12">#</th>
              <th className="py-2.5 px-4 font-medium">Candidate</th>
              <th
                onClick={() => setSortAsc(!sortAsc)}
                className="py-2.5 px-4 font-medium text-right cursor-pointer hover:text-blue-700 w-36"
              >
                Match Score{' '}
                {sortAsc ? (
                  <ChevronUp className="w-3 h-3 inline ml-0.5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-3 h-3 inline ml-0.5 text-blue-600" />
                )}
              </th>
              <th className="py-2.5 px-4 font-medium">Matched Skills</th>
              <th className="py-2.5 px-4 font-medium">Missing Skills</th>
              <th className="py-2.5 px-4 font-medium text-right w-28">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {sortedCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400 font-mono text-xs">
                  No candidates match the search criteria.
                </td>
              </tr>
            ) : (
              sortedCandidates.map((c, idx) => {
                const theme = getScoreTheme(c['Compatibility Index']);
                const score = c['Compatibility Index'] || 0;
                return (
                  <tr key={c.Candidate} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-stone-400 font-medium">#{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-stone-900">{c.Candidate}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`font-mono font-semibold px-2 py-0.5 rounded border text-xs ${theme.badge}`}
                        >
                          {score} / 100
                        </span>
                        <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${theme.bar}`}
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(c['Matched Skills'] || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 text-[11px] bg-emerald-50 text-emerald-800 rounded border border-emerald-200/80 font-mono"
                          >
                            {s}
                          </span>
                        ))}
                        {(c['Matched Skills'] || []).length > 3 && (
                          <span className="text-[10px] text-emerald-700 font-mono self-center font-medium">
                            +{(c['Matched Skills'] || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(c['Skills Not Detected'] || []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 text-[11px] bg-stone-100 text-stone-600 rounded border border-stone-200 font-mono"
                            title="Not detected in extracted text"
                          >
                            {s}
                          </span>
                        ))}
                        {(c['Skills Not Detected'] || []).length > 3 && (
                          <span className="text-[10px] text-stone-400 font-mono self-center">
                            +{(c['Skills Not Detected'] || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectCandidate(c)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50/60 hover:bg-blue-600 hover:text-white border border-blue-200 rounded transition-colors shadow-2xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
