# NeuralOps — AI Agent Observability Platform

> Production-grade LLM tracing, evaluation, and A/B testing. 
> A self-hosted alternative to LangSmith and Helicone.

📦 **npm SDK:** `npm install neuralops-sdk`

## What it does
### Data Flow (one complete trace lifecycle)

```
1. Developer's agent makes an LLM call
2. SDK intercepts it, sends trace payload to POST /api/traces
3. Express validates API key, pushes job to Bull trace-queue
4. Trace Worker picks up job → saves trace to MongoDB
5. Trace Worker pushes eval job to eval-queue
6. Eval Worker runs LLM-as-judge → saves eval score to MongoDB
7. Alert Engine checks rolling avg → fires Slack webhook if degraded
8. Dashboard queries GET /api/traces → React renders the timeline
```

---

## 2. Full System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────────┐          ┌──────────────────────────┐   │
│   │  AI Agent Code   │          │  React Dashboard / CLI   │   │
│   │  (any framework) │          │  (API consumers)         │   │
│   └────────┬─────────┘          └────────────┬─────────────┘   │
│            │ npm SDK wraps calls              │ REST calls      │
└────────────┼─────────────────────────────────┼─────────────────┘
             │                                 │
┌────────────▼─────────────────────────────────▼─────────────────┐
│                      INGESTION LAYER                            │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │              Express.js API Gateway                      │  │
│   │   • JWT Auth middleware                                  │  │
│   │   • API key validation                                   │  │
│   │   • Rate limiting (express-rate-limit)                   │  │
│   │   • Request validation (Zod)                             │  │
│   └──────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│   ┌──────────────────────▼───────────────────────────────────┐  │
│   │              Redis + Bull.js Queue                       │  │
│   │   • trace-ingestion-queue                                │  │
│   │   • eval-pipeline-queue                                  │  │
│   │   • alert-check-queue                                    │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────┐
│                    PROCESSING LAYER                           │
│                                                               │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │  Trace Worker   │  │   Eval Worker    │  │  A/B Router │  │
│  │  • Parse trace  │  │  • LLM-as-judge  │  │  • Traffic  │  │
│  │  • Enrich data  │  │  • Hallucination │  │    split    │  │
│  │  • Save to DB   │  │    detection     │  │  • Z-test   │  │
│  └────────┬────────┘  │  • Safety check  │  │    calc     │  │
│           │           │  • Score storage │  └─────┬──────┘  │
│           │           └────────┬─────────┘        │         │
│           │                    │                   │         │
│  ┌────────▼────────────────────▼──────────────────▼──────┐  │
│  │              Alert Engine (Regression Detection)       │  │
│  │  • Rolling average eval scores                        │  │
│  │  • Statistical significance check                     │  │
│  │  • Webhook to Slack / email on degradation            │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────┐
│                      STORAGE LAYER                            │
│                                                               │
│  ┌─────────────────────┐   ┌──────────────┐  ┌───────────┐  │
│  │      MongoDB        │   │    Redis     │  │  File /   │  │
│  │  • traces           │   │  • live      │  │  S3 store │  │
│  │  • evaluations      │   │    metrics   │  │  (dataset │  │
│  │  • experiments      │   │  • routing   │  │   export) │  │
│  │  • datasets         │   │    cache     │  │           │  │
│  │  • users / api_keys │   │  • sessions  │  │           │  │
│  └─────────────────────┘   └──────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────┐
│         EXTERNAL SERVICES             │
│  • OpenAI / Anthropic (eval judge)    │
│  • Slack Webhooks (alerts)            │
│  • Nodemailer (email alerts)          │
└───────────────────────────────────────┘
```

## Tech Stack
- Backend: Node.js, Express.js, MongoDB, Redis, Bull.js
- Frontend: Vite + React, Tailwind CSS, Recharts
- Infra: Docker, Docker Compose

## Key features
- Trace capture via npm SDK
- LLM-as-judge evaluation pipeline (async)
- A/B prompt testing with Z-test significance
- Regression detection + alerting
- Dataset replay

## Running locally
...

