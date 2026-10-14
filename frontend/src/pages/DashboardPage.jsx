import React from 'react';
import { ArrowRight, Plus, FileText, Briefcase, Users } from 'lucide-react';

export function DashboardPage({ state, onNavigate, onSelectCandidate }) {
  const results = state?.results || [];
  const totalCandidates = results.length;
  const activeRole = "Data Science Intern";

  const getScoreBadge = (score) => {
    if (score >= 70) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/90';
    } else if (score >= 50) {
      return 'bg-blue-50 text-blue-800 border-blue-200/90';
    } else {
      return 'bg-amber-50 text-amber-800 border-amber-200/90';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header & Short Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Dashboard</h2>
          <p className="text-xs text-stone-500 mt-1">
            Analyze resumes against job requirements and understand candidate fit.
          </p>
        </div>
        <button
          onClick={() => onNavigate('analysis')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>
      </div>

      {totalCandidates === 0 ? (
        /* Clean Empty State */
        <div className="bg-white border border-stone-200 rounded-lg p-10 text-center space-y-3 shadow-xs">
          <FileText className="w-8 h-8 text-blue-500 mx-auto stroke-[1.5]" />
          <h3 className="text-sm font-medium text-stone-900">No resumes analyzed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Upload candidate resumes and provide a job description to calculate skill match and ranking.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('analysis')}
              className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors shadow-xs"
            >
              Start Analysis
            </button>
          </div>
        </div>
      ) : (
        /* Compact Active Summary & Preview Table */
        <div className="space-y-6">
          {/* Refined Compact Summary Strip with Subtle Tint */}
          <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white border border-blue-100 rounded-lg p-4 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-blue-700/80 font-mono text-[10px] uppercase tracking-wider font-semibold">
                  Active Role
                </span>
                <div className="font-semibold text-stone-900 text-sm">{activeRole}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div className="space-y-0.5">
                <span className="text-stone-400 font-mono text-[10px] uppercase tracking-wider font-medium">
                  Analyzed
                </span>
                <div className="font-mono font-semibold text-blue-700 text-sm">
                  {totalCandidates} Candidates
                </div>
              </div>
              <div className="w-8 h-8 rounded-md bg-white border border-stone-200 text-stone-600 flex items-center justify-center">
                <Users className="w-4 h-4 stroke-[1.8]" />
              </div>
            </div>
          </div>

          {/* Small, Readable Candidate Ranking Preview Table */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <h3 className="text-xs font-semibold text-stone-800 font-mono uppercase tracking-wider">
                Candidate Ranking Preview
              </h3>
              <button
                onClick={() => onNavigate('ranking')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center space-x-1 transition-colors"
              >
                <span>View all {totalCandidates}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2.5 px-4 font-medium w-12">#</th>
                  <th className="py-2.5 px-4 font-medium">Candidate</th>
                  <th className="py-2.5 px-4 font-medium text-right">Match Score</th>
                  <th className="py-2.5 px-4 font-medium text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {results.slice(0, 5).map((c) => (
                  <tr key={c.Candidate} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-stone-400 font-medium">#{c.Rank}</td>
                    <td className="py-2.5 px-4 font-medium text-stone-900">{c.Candidate}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span
                        className={`inline-block font-mono font-semibold px-2 py-0.5 rounded border text-xs ${getScoreBadge(
                          c['Compatibility Index']
                        )}`}
                      >
                        {c['Compatibility Index']} / 100
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCandidate(c)}
                        className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 border border-stone-200 rounded transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
