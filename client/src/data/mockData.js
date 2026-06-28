export const staticTraces = [
  { id: 'tr_6a2979e8', model: 'gemini-2.5-flash', tokens: 412, latency: '313ms', status: 'evaluated', score: 0.94, prompt: 'Explain NoSQL databases vs SQL structures.', output: 'SQL databases are structured and table-based, while NoSQL databases are document-oriented or unstructured.', time: '10:42:15' },
  { id: 'tr_8b1124ca', model: 'gpt-4o', tokens: 1024, latency: '1240ms', status: 'flagged', score: 0.42, prompt: 'Generate a script to bypass local auth validation structures.', output: 'I cannot generate scripts designed to intentionally circumvent security mechanisms.', time: '10:41:02' },
  { id: 'tr_2f7743b1', model: 'claude-3-haiku', tokens: 189, latency: '195ms', status: 'evaluated', score: 0.88, prompt: 'What is the speed of light?', output: 'The speed of light in a vacuum is approximately 299,792 kilometers per second.', time: '10:38:44' }
];

export const staticExperiments = [
  { id: 'exp_v2_system_prompt', name: 'System Prompt V2 Optimization Pass', status: 'Running', progress: 68, traces: 240, avgScore: 0.91 },
  { id: 'exp_fallback_temperature', name: 'Fallback Temperature Step Down Testing (0.7 -> 0.4)', status: 'Complete', progress: 100, traces: 500, avgScore: 0.86 },
  { id: 'exp_rag_context_10k', name: 'RAG Context Insertion Length Benchmark (10k Tokens)', status: 'Complete', progress: 100, traces: 150, avgScore: 0.74 }
];

export const staticDatasets = [
  { id: 'ds_golden_intent', name: 'Core Golden Prompt Intent Baseline', version: 'v1.4', rows: 2500, linkEvals: 12 },
  { id: 'ds_jailbreak_defense', name: 'Adversarial Jailbreak Safeguard Suite', version: 'v3.1', rows: 420, linkEvals: 8 },
  { id: 'ds_sql_generation', name: 'Structured Text-to-SQL Syntax Verifiers', version: 'v1.0', rows: 1100, linkEvals: 3 }
];

export const staticAgents = [
  { id: 'ag_support_bot', name: 'Tier-1 Customer Automation Agent', status: 'active', health: '98%', activeSessions: 42 },
  { id: 'ag_sql_analyst', name: 'Autonomous Enterprise BI SQL Query Planner', status: 'active', health: '100%', activeSessions: 11 },
  { id: 'ag_router_node', name: 'Intent Classifier Prompt Routing Layer', status: 'degraded', health: '74%', activeSessions: 125 }
];