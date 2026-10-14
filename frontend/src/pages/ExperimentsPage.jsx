import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { fetchExp1, fetchExp2, fetchExp3, getExportUrl } from '../api';

export function ExperimentsPage() {
  const [activeTab, setActiveTab] = useState('exp1');
  const [exp1Data, setExp1Data] = useState(null);
  const [exp2Data, setExp2Data] = useState(null);
  const [exp3Data, setExp3Data] = useState(null);

  useEffect(() => {
    Promise.all([fetchExp1(), fetchExp2(), fetchExp3()]).then(([e1, e2, e3]) => {
      setExp1Data(e1);
      setExp2Data(e2);
      setExp3Data(e3);
    }).catch(console.error);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Page Heading */}
      <div className="pb-4 border-b border-stone-200">
        <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Research Experiments</h2>
        <p className="text-xs text-stone-500 mt-1">
          Empirical evaluation results from notebook experiments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-medium space-x-6">
        <button
          onClick={() => setActiveTab('exp1')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'exp1'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Experiment 1: Skill Extraction
        </button>
        <button
          onClick={() => setActiveTab('exp2')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'exp2'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Experiment 2: Ranking Comparison
        </button>
        <button
          onClick={() => setActiveTab('exp3')}
          className={`pb-2.5 border-b-2 transition-colors ${
            activeTab === 'exp3'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Experiment 3: Document Robustness
        </button>
      </div>

      {/* Tab 1: Experiment 1 */}
      {activeTab === 'exp1' && (
        <div className="space-y-5">
          <p className="text-xs text-stone-600">
            Compares exact canonical phrase matching against alias-aware extraction using gold standard ground truth labels.
          </p>

          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <span className="font-mono text-xs font-semibold text-stone-800">
                Summary Metrics
              </span>
              <a
                href={getExportUrl('smartresume_exp1_summary.csv')}
                download
                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </a>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Method</th>
                  <th className="py-2.5 px-3 font-medium text-right">TP</th>
                  <th className="py-2.5 px-3 font-medium text-right">FP</th>
                  <th className="py-2.5 px-3 font-medium text-right">FN</th>
                  <th className="py-2.5 px-3 font-medium text-right">Precision</th>
                  <th className="py-2.5 px-3 font-medium text-right">Recall</th>
                  <th className="py-2.5 px-3 font-medium text-right">F1 Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px] text-stone-700">
                {(exp1Data?.summary || []).map((row) => (
                  <tr key={row.Method} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-stone-900">{row.Method}</td>
                    <td className="py-2.5 px-3 text-right">{row.TP}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">{row.FP}</td>
                    <td className="py-2.5 px-3 text-right text-amber-600 font-semibold">{row.FN}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-stone-900">{(row.Precision * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-medium text-stone-900">{(row.Recall * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        {(row.F1 * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-example table */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-stone-200 bg-stone-50/50">
              <span className="font-mono text-xs font-semibold text-stone-800">
                Per-Example Results
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2 px-3 font-medium w-12">ID</th>
                  <th className="py-2 px-3 font-medium">Method</th>
                  <th className="py-2 px-3 font-medium text-right">F1</th>
                  <th className="py-2 px-3 font-medium">Gold Annotations</th>
                  <th className="py-2 px-3 font-medium">Predicted Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px] text-stone-700">
                {(exp1Data?.per_example || []).map((ex, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2 px-3 text-stone-500 font-semibold">{ex.ID}</td>
                    <td className="py-2 px-3 font-sans text-stone-800 font-medium">{ex.Method}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700">
                      {ex.F1.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 text-stone-500">{ex.Gold.join(', ')}</td>
                    <td className="py-2 px-3 text-stone-800 font-medium">{ex.Predicted.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Experiment 2 */}
      {activeTab === 'exp2' && (
        <div className="space-y-5">
          <p className="text-xs text-stone-600">
            Compares candidate ranking across TF-IDF cosine, Sentence Embeddings, and Hybrid scoring. Evaluated with nDCG@K and Precision@K against manual relevance labels.
          </p>

          {/* Evaluation Metrics */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-stone-200 bg-stone-50/50">
              <span className="font-mono text-xs font-semibold text-stone-800">
                Ranking Evaluation Metrics
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Ranking Method</th>
                  <th className="py-2.5 px-3 font-medium text-right">nDCG@3</th>
                  <th className="py-2.5 px-3 font-medium text-right">Precision@3</th>
                  <th className="py-2.5 px-3 font-medium text-right">nDCG@5</th>
                  <th className="py-2.5 px-3 font-medium text-right">Precision@5</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px] text-stone-700">
                {(exp2Data?.evaluation?.metrics || []).map((m) => (
                  <tr key={m.Method} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-stone-900">{m.Method}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">{m['nDCG@3']?.toFixed(4) || '—'}</td>
                    <td className="py-2.5 px-3 text-right text-stone-700 font-medium">{m['Precision@3']?.toFixed(4) || '—'}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">{m['nDCG@5']?.toFixed(4) || '—'}</td>
                    <td className="py-2.5 px-3 text-right text-stone-700 font-medium">{m['Precision@5']?.toFixed(4) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Spearman Correlation */}
          {exp2Data?.evaluation?.correlations?.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
              <div className="p-3 border-b border-stone-200 bg-stone-50/50">
                <span className="font-mono text-xs font-semibold text-stone-800">
                  Spearman Rank Correlation (ρ)
                </span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                    <th className="py-2.5 px-3 font-medium">Method Pair</th>
                    <th className="py-2.5 px-3 font-medium text-right">Correlation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono text-[11px] text-stone-700">
                  {exp2Data.evaluation.correlations.map((corr, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-medium text-stone-900">
                        {corr['Method A']} vs. {corr['Method B']}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {corr['Spearman rank correlation'].toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Experiment 3 */}
      {activeTab === 'exp3' && (
        <div className="space-y-5">
          <p className="text-xs text-stone-600">
            Extraction robustness and parser stability across PDF, DOCX, and TXT document formats.
          </p>

          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-stone-200 bg-stone-50/50">
              <span className="font-mono text-xs font-semibold text-stone-800">
                Extraction Robustness by Format
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-medium">Format</th>
                  <th className="py-2.5 px-3 font-medium">Extraction Method</th>
                  <th className="py-2.5 px-3 font-medium text-right">Files</th>
                  <th className="py-2.5 px-3 font-medium text-right">Mean Characters</th>
                  <th className="py-2.5 px-3 font-medium text-right">Failures</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px] text-stone-700">
                {(exp3Data?.robustness_summary || []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-blue-800">{row.Format}</td>
                    <td className="py-2.5 px-3 font-sans text-stone-800">{row['Extraction method']}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{row.Files}</td>
                    <td className="py-2.5 px-3 text-right">{row.Mean_characters.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{row.Failures}</td>
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
