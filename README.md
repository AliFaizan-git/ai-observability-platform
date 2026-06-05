# AI Agent Observability Platform — Full Build Guide
### MERN Stack | Final Year Project + CV Showcase

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Full System Architecture](#2-full-system-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Phase 1 — Project Setup & Database](#4-phase-1--project-setup--database)
5. [Phase 2 — MongoDB Schemas](#5-phase-2--mongodb-schemas)
6. [Phase 3 — Express API & Middleware](#6-phase-3--express-api--middleware)
7. [Phase 4 — Trace Ingestion Engine](#7-phase-4--trace-ingestion-engine)
8. [Phase 5 — Bull.js Async Worker System](#8-phase-5--bulljs-async-worker-system)
9. [Phase 6 — Evaluation Pipeline](#9-phase-6--evaluation-pipeline)
10. [Phase 7 — A/B Prompt Testing Engine](#10-phase-7--ab-prompt-testing-engine)
11. [Phase 8 — Regression Detection & Alerting](#11-phase-8--regression-detection--alerting)
12. [Phase 9 — Dataset Management & Replay](#12-phase-9--dataset-management--replay)
13. [Phase 10 — npm SDK Package](#13-phase-10--npm-sdk-package)
14. [Phase 11 — React Dashboard](#14-phase-11--react-dashboard)
15. [Phase 12 — Docker & Deployment](#15-phase-12--docker--deployment)
16. [API Reference](#16-api-reference)
17. [Dissertation Research Angle](#17-dissertation-research-angle)

---

## 1. Project Overview

### What You Are Building

A **production-grade backend platform** that lets developers monitor, evaluate, and improve their AI agents in real time. Think of it as the "Datadog for LLM applications."

### Core Features

| Feature | What It Does |
|---|---|
| Trace Ingestion | Captures every LLM call — prompt, response, latency, token cost |
| Eval Pipeline | Automatically scores each run for hallucination, quality, safety |
| A/B Testing | Routes traffic between prompt versions, calculates statistical significance |
| Regression Detection | Alerts when model quality drops after a code/model change |
| Dataset Replay | Re-run saved traces against new prompts to benchmark changes |
| SDK Package | npm package developers drop into their app in 2 lines |

### Why This Impresses HR & Engineering Managers

- Distributed systems (Bull.js async queues)
- Statistical computing (Z-tests for A/B significance)
- Real AI infrastructure problem (not a chatbot toy)
- Multi-tenant API with key management
- Published npm package shows ownership
- Docker deployment shows production thinking

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

## 3. Folder Structure

```
ai-observability-platform/
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection
│   │   │   ├── redis.js             # Redis connection
│   │   │   └── env.js               # Environment validation
│   │   │
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── Trace.js
│   │   │   ├── Evaluation.js
│   │   │   ├── Experiment.js
│   │   │   ├── Dataset.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/                  # Express route handlers
│   │   │   ├── traces.js
│   │   │   ├── evaluations.js
│   │   │   ├── experiments.js
│   │   │   ├── datasets.js
│   │   │   └── auth.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT + API key validation
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js          # Zod request validation
│   │   │
│   │   ├── workers/                 # Bull.js workers
│   │   │   ├── traceWorker.js
│   │   │   ├── evalWorker.js
│   │   │   └── alertWorker.js
│   │   │
│   │   ├── queues/                  # Bull queue definitions
│   │   │   └── index.js
│   │   │
│   │   ├── services/
│   │   │   ├── evaluator.js         # LLM-as-judge logic
│   │   │   ├── abRouter.js          # A/B traffic splitting
│   │   │   ├── alertEngine.js       # Regression detection
│   │   │   └── stats.js             # Z-test calculation
│   │   │
│   │   └── index.js                 # App entry point
│   │
│   ├── package.json
│   └── .env
│
├── sdk/                             # npm package
│   ├── src/
│   │   ├── Tracer.js                # Main SDK class
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── client/                          # React dashboard
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Login, get JWT |
| POST | /api/auth/api-keys | JWT | Generate API key |
| POST | /api/traces | API Key | Ingest a trace (SDK) |
| GET | /api/traces | JWT | List traces with filters |
| GET | /api/traces/:id | JWT | Single trace detail |
| GET | /api/traces/analytics/summary | JWT | 7-day usage summary |
| GET | /api/evaluations/:traceId | JWT | Evaluation scores for trace |
| POST | /api/experiments | JWT | Create A/B experiment |
| PATCH | /api/experiments/:id/status | JWT | Start/pause experiment |
| GET | /api/experiments/:id/assign | JWT | Get variant assignment |
| GET | /api/experiments/:id/significance | JWT | Statistical results |
| POST | /api/datasets | JWT | Create dataset |
| POST | /api/datasets/:id/entries | JWT | Add trace to dataset |
| POST | /api/datasets/:id/replay | JWT | Run dataset replay |

---

 Dissertation Research Angle

### Proposed Title

**"Automated Evaluation Frameworks for Production LLM Agents: A Comparative Study of LLM-as-Judge Reliability, Statistical Methods for Prompt Optimization, and Regression Detection in Continuous Deployment Pipelines"**

### Research Questions

1. How reliable is LLM-as-judge evaluation compared to human annotation across different task types?
2. What sample size is required for statistically meaningful A/B prompt experiments?
3. Can rolling composite scoring reliably detect model degradation before it impacts users?
4. How do different weighting strategies for composite evaluation metrics affect alignment with human judgment?

### Literature to Review

- "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (Zheng et al., 2023)
- "RAGAS: Automated Evaluation of Retrieval Augmented Generation" (Es et al., 2023)
- "Can Large Language Models be Human Evaluators?" (Wang et al., 2023)
- Statistical significance testing in online experiments (Kohavi et al., Microsoft Research)

### Your Novel Contribution

The combination of real-time evaluation pipelines + statistical A/B testing + automated regression detection in a single unified platform for LLM agents has not been formally studied or published. Your dissertation proposes the architecture, validates the eval reliability, and measures regression detection sensitivity — a publishable contribution.

---

## Build Sequence Summary

| Phase | What You Build | Time Estimate |
|---|---|---|
| 1-2 | Setup + MongoDB schemas | Week 1 |
| 3 | Express API + auth + middleware | Week 2 |
| 4-5 | Trace ingestion + Bull.js workers | Week 3 |
| 6 | Evaluation pipeline (LLM judge) | Week 4-5 |
| 7 | A/B testing + Z-test engine | Week 6 |
| 8 | Regression detection + alerts | Week 7 |
| 9 | Dataset management + replay | Week 8 |
| 10 | npm SDK package | Week 9 |
| 11 | React dashboard | Week 10-12 |
| 12 | Docker + deployment | Week 13 |

**Total estimated build time:** 6-8 months of focused part-time work.

---

*Built with MERN Stack: MongoDB · Express.js · React · Node.js + Redis · Bull.js · Docker*
