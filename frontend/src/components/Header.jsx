import React from 'react';
import { Download, Plus, Menu } from 'lucide-react';
import { getExportUrl } from '../api';

export function Header({ title, onNewAnalysis, totalCandidates, onOpenMobileMenu }) {
  return (
    <header className="h-14 border-b border-stone-200/90 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-1.5 -ml-1 text-stone-700 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-sm font-semibold text-stone-900 tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center space-x-2">
        {totalCandidates > 0 && (
          <a
            href={getExportUrl('smartresume_candidate_ranking.csv')}
            download
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-stone-700 hover:text-blue-700 hover:bg-blue-50/60 hover:border-blue-200 border border-stone-300 rounded-md transition-all font-medium"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </a>
        )}

        {onNewAnalysis && (
          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">New Analysis</span>
            <span className="xs:hidden">New</span>
          </button>
        )}
      </div>
    </header>
  );
}
