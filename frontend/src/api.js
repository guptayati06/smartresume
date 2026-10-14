const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API health error:', err);
    return { status: 'offline', error: err.message };
  }
}

export async function fetchDefaults() {
  const res = await fetch(`${API_BASE}/defaults`);
  if (!res.ok) throw new Error('Failed to load defaults');
  return await res.json();
}

export async function fetchCurrentState() {
  const res = await fetch(`${API_BASE}/state`);
  if (!res.ok) throw new Error('Failed to load analysis state');
  return await res.json();
}

export async function runAnalysis(formData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Analysis failed (${res.status})`);
  }
  return await res.json();
}

export async function fetchExp1() {
  const res = await fetch(`${API_BASE}/experiments/exp1`);
  if (!res.ok) throw new Error('Failed to load Experiment 1 data');
  return await res.json();
}

export async function fetchExp2() {
  const res = await fetch(`${API_BASE}/experiments/exp2`);
  if (!res.ok) throw new Error('Failed to load Experiment 2 data');
  return await res.json();
}

export async function saveExp2Labels(labels) {
  const res = await fetch(`${API_BASE}/experiments/exp2/labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(labels)
  });
  if (!res.ok) throw new Error('Failed to save relevance labels');
  return await res.json();
}

export async function fetchExp3() {
  const res = await fetch(`${API_BASE}/experiments/exp3`);
  if (!res.ok) throw new Error('Failed to load Experiment 3 data');
  return await res.json();
}

export async function saveEvidenceAudit(payload) {
  const res = await fetch(`${API_BASE}/audit/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save evidence audit decision');
  return await res.json();
}

export async function saveRecommendationAudit(payload) {
  const res = await fetch(`${API_BASE}/audit/recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save recommendation audit status');
  return await res.json();
}

export async function saveLayoutError(payload) {
  const res = await fetch(`${API_BASE}/audit/layout-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save layout error item');
  return await res.json();
}

export function getExportUrl(exportFilename) {
  return `${API_BASE}/export/${exportFilename}`;
}
