import React from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  CheckSquare,
  FlaskConical,
  ShieldCheck,
  Download,
  Layers,
  X
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, candidateCount, backendStatus, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Resume Analysis', icon: FileText },
    { id: 'ranking', label: 'Candidate Ranking', icon: BarChart2, count: candidateCount },
    { id: 'skillgap', label: 'Skill Gap Analysis', icon: CheckSquare },
    { id: 'experiments', label: 'Research Experiments', icon: FlaskConical },
    { id: 'audit', label: 'Explainability & Audit', icon: ShieldCheck },
    { id: 'reports', label: 'Reports & Exports', icon: Download }
  ];

  const isHealthy = backendStatus?.status === 'healthy';

  const handleNavClick = (id) => {
    setCurrentTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 md:w-56 bg-[#0F172A] text-slate-200 border-r border-slate-800 flex flex-col h-screen shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm text-white tracking-tight">SmartResume</span>
              <span className="text-[10px] font-mono uppercase tracking-wider bg-blue-950 text-blue-400 border border-blue-800/80 px-1.5 py-0.2 rounded font-medium">
                NLP
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 md:py-2 rounded-md text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 stroke-[1.8] ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100'
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-slate-300 font-medium">
              {isHealthy ? 'NLP Online' : 'Connecting...'}
            </span>
          </span>
          <span className="font-mono text-[10px] text-blue-400 bg-blue-950/70 border border-blue-900 px-1.5 py-0.5 rounded">
            Mobile Ready
          </span>
        </div>
      </aside>
    </>
  );
}
