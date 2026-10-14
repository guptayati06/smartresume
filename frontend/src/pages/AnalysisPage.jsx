import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, Play, Check } from 'lucide-react';
import { runAnalysis } from '../api';

export function AnalysisPage({ state, onAnalysisComplete, onNavigate }) {
  const [jobDescription, setJobDescription] = useState(state?.job_description || '');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [useBenchmark, setUseBenchmark] = useState(false);
  const [extractionMode, setExtractionMode] = useState(state?.extraction_mode || 'alias-aware');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleFiles = (e) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
      setUseBenchmark(false);
      setErrorMessage(null);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleJDFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJobDescription(event.target?.result || '');
      setErrorMessage(null);
    };
    reader.readAsText(file);
  };

  const handleLoadBenchmark = () => {
    setUseBenchmark(true);
    setSelectedFiles([]);
    setJobDescription(`Data Science Intern

Responsibilities:
- Analyze structured and unstructured data.
- Build, test, and evaluate machine-learning models.
- Communicate findings using data visualizations.

Required skills:
Python, SQL, pandas, NumPy, scikit-learn, machine learning,
statistics, data analysis.

Preferred skills:
Natural language processing, deep learning, Power BI, Git.`);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setErrorMessage('Please enter or upload a job description.');
      return;
    }
    if (selectedFiles.length === 0 && !useBenchmark) {
      setErrorMessage('Please upload at least one candidate resume, or select benchmark resumes.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      formData.append('skill_weight', '0.65');
      formData.append('semantic_weight', '0.35');
      formData.append('extraction_mode', extractionMode);
      formData.append('use_benchmark', useBenchmark ? 'true' : 'false');

      selectedFiles.forEach((file) => {
        formData.append('resumes', file);
      });

      const response = await runAnalysis(formData);
      onAnalysisComplete(response);
      onNavigate('ranking');
    } catch (err) {
      setErrorMessage(err.message || 'Analysis failed. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormatBadge = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (ext === 'docx') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-stone-100 text-stone-700 border-stone-200';
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      {/* Page Heading */}
      <div className="pb-4 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Resume Analysis</h2>
          <p className="text-xs text-stone-500 mt-1">
            Upload candidate resumes and provide a job description to extract skills and rank candidates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadBenchmark}
          className="text-xs text-blue-700 hover:text-blue-800 bg-blue-50/70 hover:bg-blue-100/70 font-medium px-2.5 py-1.5 rounded border border-blue-200 transition-colors"
        >
          Load Benchmark Data
        </button>
      </div>

      {/* Validation Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Clean Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Description Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider font-mono">
              Job Description
            </label>
            <button
              type="button"
              onClick={() => jdFileInputRef.current?.click()}
              className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Upload file (.txt, .docx, .pdf)
            </button>
            <input
              ref={jdFileInputRef}
              type="file"
              accept=".txt,.docx,.pdf"
              className="hidden"
              onChange={handleJDFile}
            />
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setErrorMessage(null);
            }}
            rows={6}
            placeholder="Paste role responsibilities, required skills, and preferred qualifications here..."
            className="w-full text-xs font-mono p-3 bg-white border border-stone-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 leading-relaxed text-stone-800"
            required
          />
        </div>

        {/* Resumes Upload Field */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider font-mono block">
            Candidate Resumes
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border border-dashed border-stone-300 hover:border-blue-400 bg-white hover:bg-blue-50/20 p-6 rounded-md text-center cursor-pointer transition-colors space-y-1.5 group"
          >
            <Upload className="w-5 h-5 mx-auto text-stone-400 group-hover:text-blue-600 stroke-[1.5] transition-colors" />
            <div className="text-xs font-medium text-stone-800 group-hover:text-blue-900 transition-colors">
              Click to select or drag PDF, DOCX, or TXT resumes
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Supports multiple files at once
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFiles}
            />
          </div>

          {/* Files List */}
          {selectedFiles.length > 0 && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span className="text-blue-700 font-semibold">{selectedFiles.length} file(s) ready</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-rose-600 hover:underline text-[11px]"
                >
                  Remove all
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-md bg-white">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="p-2 px-3 flex items-center justify-between text-xs hover:bg-stone-50/60">
                    <div className="flex items-center space-x-2 truncate">
                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded border font-semibold uppercase ${getFormatBadge(
                          file.name
                        )}`}
                      >
                        {file.name.split('.').pop()}
                      </span>
                      <span className="text-stone-800 truncate font-mono text-[11px]">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-stone-400 hover:text-rose-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {useBenchmark && selectedFiles.length === 0 && (
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded text-xs text-blue-900 flex items-center justify-between">
              <span className="font-medium">Using 6 benchmark candidates from notebook dataset</span>
              <button
                type="button"
                onClick={() => setUseBenchmark(false)}
                className="text-blue-600 hover:text-blue-800 underline text-[11px]"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Minimal Options */}
        <div className="pt-2 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100">
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[11px] text-stone-400 font-semibold">Extractor:</span>
            <label className="flex items-center space-x-1.5 cursor-pointer text-stone-800">
              <input
                type="radio"
                name="mode"
                value="alias-aware"
                checked={extractionMode === 'alias-aware'}
                onChange={(e) => setExtractionMode(e.target.value)}
                className="accent-blue-600"
              />
              <span>Alias-Aware (53 Skills)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer text-stone-800">
              <input
                type="radio"
                name="mode"
                value="exact"
                checked={extractionMode === 'exact'}
                onChange={(e) => setExtractionMode(e.target.value)}
                className="accent-blue-600"
              />
              <span>Exact Match Only</span>
            </label>
          </div>
          <div className="font-mono text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            Formula: 65% Skill + 35% Semantic
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Resumes...</span>
              </>
            ) : (
              <span>Analyze Resumes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
