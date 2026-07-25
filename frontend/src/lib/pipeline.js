// Static UI config for the AI pipeline stages (labels/icons), not sample data.
// Live per-stage state comes from the backend via pipelineHealth() in lib/api.js.

export const PIPELINE = [
  { id: 'audio', label: 'Audio', icon: 'Mic', desc: 'Live & recorded ingest' },
  { id: 'asr', label: 'ASR', icon: 'FileText', desc: 'Speech-to-text' },
  { id: 'diar', label: 'Diarization', icon: 'Users', desc: 'Speaker separation' },
  { id: 'emotion', label: 'Emotion', icon: 'Smile', desc: 'Affect detection' },
  { id: 'nlp', label: 'NLP', icon: 'Languages', desc: 'Entities & intent' },
  { id: 'llm', label: 'LLM', icon: 'Sparkles', desc: 'Summarize & reason', ai: true },
  { id: 'qa', label: 'QA', icon: 'ShieldCheck', desc: 'Compliance scoring' },
  { id: 'predict', label: 'Prediction', icon: 'TrendingUp', desc: 'Risk & outcomes', ai: true },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', desc: 'Aggregate trends' },
  { id: 'dash', label: 'Dashboards', icon: 'LayoutDashboard', desc: 'Role-based views' },
]
