import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { getExportUrl } from '../api';

export function ReportsPage() {
  const exportsList = [
    {
      title: 'Candidate Ranking Table',
      filename: 'smartresume_candidate_ranking.csv',
      tag: 'Rankings',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Rank, Candidate name, Compatibility Index, Skill Coverage (%), Semantic Similarity (%), TF-IDF Similarity (%), Matched Skills, and Skills Not Detected.'
    },
    {
      title: 'Candidate Feedback & Section Checks',
      filename: 'smartresume_candidate_feedback.csv',
      tag: 'Feedback',
      tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Detailed per-candidate audit: Detected sections (Education, Experience, Projects, Skills, Certifications, Summary) and tailored recommendations.'
    },
    {
      title: 'Experiment 1: Skill Extraction Summary',
      filename: 'smartresume_exp1_summary.csv',
      tag: 'Experiment 1',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'True positives, false positives, false negatives, precision, recall, and F1 comparison between Exact Phrase vs. Alias-Aware Extraction.'
    },
    {
      title: 'Experiment 1: Per-Example Metrics',
      filename: 'smartresume_exp1_per_example.csv',
      tag: 'Experiment 1',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Sample-level precision, recall, and F1 breakdown against gold standard annotations.'
    },
    {
      title: 'Experiment 1: False Positive & False Negative Log',
      filename: 'smartresume_exp1_false_positive_false_negative.csv',
      tag: 'Experiment 1',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Full catalog of false positive and false negative occurrences with text excerpts.'
    },
    {
      title: 'Experiment 1: Resume Skill Count Comparison',
      filename: 'smartresume_exp1_resume_comparison.csv',
      tag: 'Experiment 1',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Comparison of detected skill counts between exact phrase and alias-aware matching on loaded resumes.'
    },
    {
      title: 'Experiment 3: Skill Evidence Audit Log',
      filename: 'smartresume_skill_evidence_audit.csv',
      tag: 'Audit',
      tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Evidence snippets, matched aliases, reviewer decisions (supported, unsupported, needs review), and notes.'
    },
    {
      title: 'Experiment 2: Multi-Ranker Raw Scores',
      filename: 'smartresume_exp2_scores.csv',
      tag: 'Experiment 2',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Candidate scores computed across TF-IDF cosine, Sentence Embedding cosine, Skill Coverage, and Hybrid score.'
    },
    {
      title: 'Experiment 3: Document Extraction Log',
      filename: 'smartresume_exp3_extraction_log.csv',
      tag: 'Robustness',
      tagColor: 'bg-teal-50 text-teal-800 border-teal-200',
      desc: 'Ingestion log recording file format (.pdf, .docx, .txt), extraction method (PDF text layer, OCR fallback), character count, and status.'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-5">
      {/* Page Heading */}
      <div className="pb-4 border-b border-stone-200">
        <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Reports & Exports</h2>
        <p className="text-xs text-stone-500 mt-1">
          Download CSV datasets generated directly from active analysis and experimental runs.
        </p>
      </div>

      {/* Clean Table of Available Exports */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
              <th className="py-2.5 px-4 font-medium">Report / Export Title</th>
              <th className="py-2.5 px-4 font-medium">Filename</th>
              <th className="py-2.5 px-4 font-medium text-right w-32">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {exportsList.map((item) => (
              <tr key={item.filename} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-stone-900">{item.title}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${item.tagColor}`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 max-w-lg leading-relaxed">
                    {item.desc}
                  </p>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-stone-600 align-top">
                  {item.filename}
                </td>
                <td className="py-3 px-4 text-right align-top">
                  <a
                    href={getExportUrl(item.filename)}
                    download
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50/60 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
