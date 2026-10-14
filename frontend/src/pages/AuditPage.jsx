import React, { useState, useEffect } from 'react';
import { Search, Download, Check } from 'lucide-react';
import { fetchExp3, saveEvidenceAudit, getExportUrl } from '../api';

export function AuditPage() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    fetchExp3().then((data) => {
      setEvidenceList(data.evidence_audit || []);
    }).catch(console.error);
  }, []);

  const handleDecision = async (item, decision) => {
    const updated = { ...item, 'Reviewer decision': decision };
    setEvidenceList((prev) => prev.map((el) => (el.id === item.id ? updated : el)));

    try {
      setStatusMap((s) => ({ ...s, [item.id]: 'saving' }));
      await saveEvidenceAudit({
        candidate: item.Candidate,
        skill: item.Skill,
        alias: item.Alias,
        decision,
        notes: item['Reviewer notes'] || ''
      });
      setStatusMap((s) => ({ ...s, [item.id]: 'saved' }));
      setTimeout(() => setStatusMap((s) => ({ ...s, [item.id]: null })), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotes = async (item, notes) => {
    const updated = { ...item, 'Reviewer notes': notes };
    setEvidenceList((prev) => prev.map((el) => (el.id === item.id ? updated : el)));

    try {
      setStatusMap((s) => ({ ...s, [item.id]: 'saving' }));
      await saveEvidenceAudit({
        candidate: item.Candidate,
        skill: item.Skill,
        alias: item.Alias,
        decision: item['Reviewer decision'] || '',
        notes
      });
      setStatusMap((s) => ({ ...s, [item.id]: 'saved' }));
      setTimeout(() => setStatusMap((s) => ({ ...s, [item.id]: null })), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const getSelectStyle = (decision) => {
    if (decision === 'supported') return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
    if (decision === 'needs review') return 'bg-amber-50 text-amber-800 border-amber-300 font-semibold';
    if (decision === 'unsupported') return 'bg-rose-50 text-rose-800 border-rose-300 font-semibold';
    return 'bg-white text-stone-600 border-stone-200';
  };

  const filtered = evidenceList.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.Candidate.toLowerCase().includes(query) ||
      item.Skill.toLowerCase().includes(query) ||
      item.Alias.toLowerCase().includes(query) ||
      item['Evidence snippet'].toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-5">
      {/* Page Heading & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Explainability & Audit</h2>
          <p className="text-xs text-stone-500 mt-1">
            Review text snippets extracted from resumes and verify matching decisions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter candidate or skill..."
              className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-stone-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 text-stone-800"
            />
          </div>

          <a
            href={getExportUrl('smartresume_skill_evidence_audit.csv')}
            download
            className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-stone-700 hover:text-blue-700 text-xs font-medium rounded-md border border-stone-200 hover:border-blue-200 transition-colors inline-flex items-center space-x-1 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>CSV</span>
          </a>
        </div>
      </div>

      {/* Simple Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
              <th className="py-2.5 px-4 font-medium w-36">Candidate</th>
              <th className="py-2.5 px-4 font-medium w-36">Skill (Alias)</th>
              <th className="py-2.5 px-4 font-medium">Extracted Evidence Snippet</th>
              <th className="py-2.5 px-4 font-medium w-32 text-center">Verification</th>
              <th className="py-2.5 px-4 font-medium w-48">Reviewer Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-stone-400 font-mono text-xs">
                  No evidence records match the search.
                </td>
              </tr>
            ) : (
              filtered.slice(0, 100).map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-stone-900 font-mono text-[11px] align-top">
                    {item.Candidate}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] align-top">
                    <div className="font-semibold text-blue-800 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-200/80 inline-block">
                      {item.Skill}
                    </div>
                    <div className="text-stone-500 text-[10px] mt-0.5">
                      alias: <strong className="text-stone-800">{item.Alias}</strong>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-stone-700 align-top leading-relaxed">
                    <span className="bg-stone-50 p-1.5 rounded border border-stone-200/70 inline-block w-full">
                      "{item['Evidence snippet']}"
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center align-top">
                    <select
                      value={item['Reviewer decision'] || ''}
                      onChange={(e) => handleDecision(item, e.target.value)}
                      className={`text-xs border rounded px-2 py-1 focus:outline-none transition-colors ${getSelectStyle(
                        item['Reviewer decision']
                      )}`}
                    >
                      <option value="">Pending</option>
                      <option value="supported">Supported</option>
                      <option value="needs review">Needs Review</option>
                      <option value="unsupported">Unsupported</option>
                    </select>
                    {statusMap[item.id] === 'saved' && (
                      <div className="text-[10px] text-emerald-600 font-mono font-semibold mt-0.5">
                        Saved ✓
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 align-top">
                    <input
                      type="text"
                      defaultValue={item['Reviewer notes'] || ''}
                      onBlur={(e) => handleNotes(item, e.target.value)}
                      placeholder="Add reviewer notes..."
                      className="w-full text-xs px-2 py-1 bg-white border border-stone-200 rounded text-stone-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
