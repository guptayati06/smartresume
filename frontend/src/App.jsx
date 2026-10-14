import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { CandidateRankingPage } from './pages/CandidateRankingPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { AuditPage } from './pages/AuditPage';
import { ReportsPage } from './pages/ReportsPage';
import { fetchHealth, fetchCurrentState } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [appState, setAppState] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const initData = async () => {
    try {
      const [health, state] = await Promise.all([
        fetchHealth(),
        fetchCurrentState()
      ]);
      setBackendHealth(health);
      setAppState(state);
      if (state?.results?.length > 0) {
        setActiveCandidate(state.results[0]);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSelectCandidate = (candidate) => {
    setActiveCandidate(candidate);
    setCurrentTab('skillgap');
    setIsMobileMenuOpen(false);
  };

  const handleAnalysisComplete = (newResults) => {
    setAppState((prev) => ({
      ...prev,
      results: newResults.results,
      job_skills: newResults.job_skills,
      extraction_log: newResults.extraction_log,
      errors: newResults.errors
    }));
    if (newResults.results && newResults.results.length > 0) {
      setActiveCandidate(newResults.results[0]);
    }
    setIsMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'analysis':
        return 'Resume Analysis';
      case 'ranking':
        return 'Candidate Ranking';
      case 'skillgap':
        return 'Skill Gap Analysis';
      case 'experiments':
        return 'Research Experiments';
      case 'audit':
        return 'Explainability & Audit';
      case 'reports':
        return 'Reports & Exports';
      default:
        return 'SmartResume';
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#FBFBF9] space-y-2">
        <div className="w-5 h-5 border-2 border-stone-300 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-mono text-stone-400">Loading SmartResume...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FBFBF9] text-stone-900 font-sans overflow-hidden">
      {/* Responsive Sidebar (Persistent on Desktop, Drawer on Mobile) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        candidateCount={appState?.results?.length || 0}
        backendStatus={backendHealth}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getPageTitle()}
          onNewAnalysis={() => {
            setCurrentTab('analysis');
            setIsMobileMenuOpen(false);
          }}
          totalCandidates={appState?.results?.length || 0}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              state={appState}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {currentTab === 'analysis' && (
            <AnalysisPage
              state={appState}
              onAnalysisComplete={handleAnalysisComplete}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
            />
          )}

          {currentTab === 'ranking' && (
            <CandidateRankingPage
              results={appState?.results || []}
              onSelectCandidate={handleSelectCandidate}
            />
          )}

          {currentTab === 'skillgap' && (
            <SkillGapPage
              candidates={appState?.results || []}
              activeCandidate={activeCandidate}
              onSelectCandidate={setActiveCandidate}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
            />
          )}

          {currentTab === 'experiments' && (
            <ExperimentsPage />
          )}

          {currentTab === 'audit' && (
            <AuditPage />
          )}

          {currentTab === 'reports' && (
            <ReportsPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
