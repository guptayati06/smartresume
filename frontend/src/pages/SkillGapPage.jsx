import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, FileText, ChevronRight } from 'lucide-react';

export function SkillGapPage({ candidates, activeCandidate, onSelectCandidate, onNavigate }) {
  const [selectedCandidate, setSelectedCandidate] = useState(
    activeCandidate || (candidates && candidates.length > 0 ? candidates[0] : null)
  );
  const [showRawText, setShowRawText] = useState(false);

  if (!selectedCandidate) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-3">
        <p className="text-xs text-stone-500">No candidate selected for inspection.</p>
        <button
          onClick={() => onNavigate('ranking')}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700"
        >
          View Candidate Ranking
        </button>
      </div>
    );
  }

  const c = selectedCandidate;
  const matchedSkills = c['Matched Skills'] || [];
  const missingSkills = c['Skills Not Detected'] || [];
  const suggestions = c.Suggestions || [];
  const skillEvidence = c['Skill Evidence'] || {};
  const score = c['Compatibility Index'] || 0;

  // Flatten evidence
  const evidenceList = [];
  Object.entries(skillEvidence).forEach(([skill, hits]) => {
    hits.forEach((h) => {
      evidenceList.push({
        skill,
        alias: h.matched_alias,
        snippet: h.snippet
      });
    });
  });

  const getScoreBadge = (sc) => {
    if (sc >= 70) return 'bg-emerald-50 text-emerald-800 border-emerald-200/90';
    if (sc >= 50) return 'bg-blue-50 text-blue-800 border-blue-200/90';
    return 'bg-amber-50 text-amber-800 border-amber-200/90';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header & Candidate Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Skill Gap Analysis</h2>
          <p className="text-xs text-stone-500 mt-1">
            Review requirement overlap, missing skills, and tailored suggestions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-stone-500 font-mono">Candidate:</label>
          <select
            value={c.Candidate}
            onChange={(e) => {
              const found = candidates.find((cand) => cand.Candidate === e.target.value);
              if (found) setSelectedCandidate(found);
            }}
            className="text-xs bg-white border border-stone-300 rounded px-2.5 py-1.5 font-medium text-stone-800 focus:outline-none focus:border-blue-400"
          >
            {candidates.map((cand) => (
              <option key={cand.Candidate} value={cand.Candidate}>
                {cand.Candidate} ({cand['Compatibility Index']} / 100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Summary Line with Color Badge */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 flex items-center justify-between text-xs shadow-xs">
        <div>
          <span className="font-semibold text-stone-900 text-sm">{c.Candidate}</span>
          <span className="text-stone-400 font-mono text-xs ml-2">
            ({c['Resume Word Count'] || 0} words)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-stone-400 font-mono text-xs">Match Score:</span>
          <span
            className={`font-mono font-semibold px-2.5 py-0.5 rounded border text-xs ${getScoreBadge(
              score
            )}`}
          >
            {score} / 100
          </span>
        </div>
      </div>

      {/* Simple Two-Column List: Matched Skills & Missing Skills with Distinct Color Tints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills Box (Emerald theme) */}
        <div className="bg-emerald-50/30 border border-emerald-200/80 rounded-lg p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100">
            <span className="text-xs font-mono font-semibold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Matched Skills</span>
            </span>
            <span className="text-xs font-mono font-medium text-emerald-700">
              {matchedSkills.length} detected
            </span>
          </div>

          {matchedSkills.length === 0 ? (
            <p className="text-xs text-stone-400">None detected.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {matchedSkills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-xs bg-white text-emerald-800 rounded border border-emerald-200 font-mono font-medium shadow-2xs"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills Box (Amber theme) */}
        <div className="bg-amber-50/30 border border-amber-200/80 rounded-lg p-4 space-y-2 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
            <span className="text-xs font-mono font-semibold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Not Detected in Text</span>
            </span>
            <span className="text-xs font-mono font-medium text-amber-700">
              {missingSkills.length} missing
            </span>
          </div>

          {missingSkills.length === 0 ? (
            <p className="text-xs text-emerald-700 font-mono">All role skills detected in text.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-xs bg-white text-amber-800 rounded border border-amber-200 font-mono font-medium shadow-2xs"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-amber-800/80 pt-1 leading-normal">
            Note: "Not detected" means absent in extracted text, not that candidate lacks ability.
          </p>
        </div>
      </div>

      {/* Recommendations List with Blue Accent */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-3 shadow-xs">
        <div className="flex items-center space-x-2 text-blue-900 font-semibold text-xs uppercase tracking-wider font-mono">
          <Lightbulb className="w-4 h-4 text-blue-600" />
          <span>Tailored Improvement Suggestions</span>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-xs text-stone-400">No suggestions generated.</p>
        ) : (
          <div className="space-y-2 pt-1 text-xs text-stone-700 leading-relaxed">
            {suggestions.map((sug, i) => (
              <div key={i} className="flex items-start space-x-2.5 p-2 bg-stone-50/70 rounded border border-stone-200/70">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="pt-0.5">{sug}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Snippets Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden space-y-0 shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <h3 className="text-xs font-mono font-semibold text-stone-800 uppercase tracking-wider">
            Supporting Evidence Snippets ({evidenceList.length})
          </h3>
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
          >
            {showRawText ? 'Hide extracted text' : 'View extracted text'}
          </button>
        </div>

        {showRawText && (
          <div className="p-4 bg-stone-900 text-stone-200 border-b border-stone-800">
            <pre className="text-[11px] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {c['Resume Text']}
            </pre>
          </div>
        )}

        <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
          {evidenceList.map((item, idx) => (
            <div key={idx} className="p-3 text-xs space-y-1.5 hover:bg-stone-50/60 transition-colors">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono text-[11px]">
                  {item.skill}
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  matched alias: <strong className="text-stone-800 font-semibold">{item.alias}</strong>
                </span>
              </div>
              <p className="text-[11px] font-mono text-stone-700 bg-stone-50 p-2 rounded border border-stone-200/70 leading-relaxed">
                "{item.snippet}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
