# MAI-T1D — Product Requirements Document

> **Version:** 1.0 (based on current codebase as of 2026-04-02)
> **Product:** MAI-T1D Research Platform
> **Stack:** React 19 + Vite 8 + Claude API (Anthropic SDK) + Vercel
> **Status:** Working prototype with live AI integration

---

## 1. Product Overview

### 1.1 What is MAI-T1D?

MAI-T1D (Multi-omics AI for Type 1 Diabetes) is an AI-powered research assistant platform that helps T1D researchers:

1. **Discover** relevant multi-omics datasets through conversational AI
2. **Curate** donor-level data tables with AI-driven semantic filtering
3. **Select** appropriate foundation models for their analysis
4. **Run** experiments and view results with visualizations

### 1.2 Core Value Proposition

Researchers no longer need to manually search across multiple data portals. They describe their hypothesis in natural language, and the AI recommends datasets, filters donors, and configures the analysis pipeline — all within a single, interactive workspace.

### 1.3 Target Users

- Biomedical researchers studying Type 1 Diabetes
- Bioinformaticians performing multi-omics analysis
- Clinical data scientists evaluating cohort composition

---

## 2. Information Architecture

```
/                       → Redirect to /selection
/selection              → Data & Model Selection Page (primary workspace)
/results                → Results & Analysis Page
```

### 2.1 Page Structure

| Page | Layout | Left Panel | Middle Panel | Right Panel |
|------|--------|------------|-------------|-------------|
| `/selection` (default) | 2-column | AI Chat | — | Dataset Workspace |
| `/selection` (after run) | 3-column | AI Chat | Dataset Workspace | Output Panel |
| `/results` | 2-column | AI Chat | — | Results Panel |

All layouts have **resizable panels** (drag handle, 20%–80% range, touch-supported).

---

## 3. Feature Specifications

### 3.1 AI Chat Interface

**Location:** Left panel on all pages

#### 3.1.1 Chat Message Types

| Type | Rendering | Trigger |
|------|-----------|---------|
| User message | Right-aligned, blue bubble | User types & sends |
| Assistant text | Left-aligned, plain text | Claude API response |
| Dataset Recommendation Card | Interactive card with "Add" button | `[DATASET:id]` marker in response |
| Model Recommendation Card | Interactive card with "Add" button | `[MODEL:id]` marker in response |
| Dataset Update Card | Card with "Update" button (shows +/− changes) | `[TABLE_ADD:...]` or `[TABLE_REMOVE:...]` markers |
| System message | Centered, italic, grey | Internal events (e.g., "Dataset updated") |

#### 3.1.2 Chat Input

- Text input field with placeholder text
- **Send button** (disabled when empty)
- **Dataset Picker** — icon button (left side of input) that opens a popup listing all 4 available datasets; clicking a dataset inserts its name into the input field
- Keyboard: `Enter` to send, `Shift+Enter` for newline

#### 3.1.3 Dataset Recommendation Card

Displayed inline in chat when AI recommends a dataset.

| Element | Description |
|---------|-------------|
| Title | Dataset name (e.g., "HPAP") |
| Donor count | "194 Pancreas donors" |
| Key info chips | Age range, modalities |
| Tags | Cell type, modality badges |
| Reason text | AI-generated explanation of relevance |
| **Add button** | Blue → adds dataset to workspace tabs; toggles to "Added ✓" |
| View details link | Opens `DatasetDetailModal` with full metadata + sample data table |

#### 3.1.4 Model Recommendation Card

| Element | Description |
|---------|-------------|
| Title | Model name (e.g., "Single Cell FM") |
| Description | Model capabilities |
| **Add button** | Blue → sets as selected model; toggles to "Added ✓" |

#### 3.1.5 Dataset Update Card

Displayed when AI performs table operations (add/remove rows).

| Element | Description |
|---------|-------------|
| Title | Dataset name |
| Donor count | Current count |
| Change badge | Red "−N" for removals, Green "+N" for additions |
| Meta tags | Modality, cell type |
| **Update button** | Blue → triggers `performUpdate()` in workspace; toggles to "✓ Updated" |

#### 3.1.6 Typing Indicator

Three animated bouncing dots shown while waiting for Claude API response.

---

### 3.2 AI Backend (Claude API Integration)

#### 3.2.1 Architecture

```
Frontend (chatService.js)
  → POST /api/chat
    → server/api.js (handleChatRequest)
      → Claude API (claude-sonnet-4-20250514)
        → Tool calls (up to 5 iterations)
      → Final text response
    → Parse markers → Structured UI data
  → Render cards + text
```

**Dual environment support:**
- **Local dev:** Vite middleware proxy (`configureServer` in `vite.config.js`)
- **Production:** Vercel serverless function (`api/chat.js`)

**Fallback:** If API call fails or times out (30s), automatically falls back to mock responses.

#### 3.2.2 AI Persona

**Name:** MAI-T1D
**Role:** Expert research assistant specializing in T1D genomics and multi-omics

**5 Sub-roles:**
1. **Planner** — Parse research intent, decide which tools to call
2. **Executor** — Formulate tool inputs, process tool outputs
3. **Synthesizer** — Combine results from multiple tools into coherent responses
4. **Explainer** — Explain reasoning, data provenance, model behavior
5. **Validator** — Check for issues (insufficient data, incompatible models)

**Behavior Rules:**
- Always use tools to look up data (never fabricate statistics)
- Explain WHY each recommendation is relevant to the hypothesis
- Proactively warn about limitations (sample size, age gaps, batch effects)
- Keep responses concise but informative
- Cite donor counts and data sources

#### 3.2.3 Response Marker Protocol

The AI embeds structured markers in its text responses. The frontend parses these markers and replaces them with interactive UI elements.

| Marker | Format | Frontend Rendering |
|--------|--------|--------------------|
| Dataset recommendation | `[DATASET:hpap]` | DatasetRecommendation card |
| Model recommendation | `[MODEL:single-cell-fm]` | ModelRecommendation card |
| Remove rows | `[TABLE_REMOVE:hpap:HPAP-002,HPAP-005]` | DatasetUpdateCard (red badge) |
| Add rows | `[TABLE_ADD:hpap:HPAP-016,35,M,26.2,T1D,Stage 3,AAb+,8 yrs,GADA IA-2,2,Islet cells]` | DatasetUpdateCard (green badge) |

Markers are stripped from displayed text. Each marker must be on its own line, preceded by a reason.

#### 3.2.4 Tool Definitions (8 Tools)

| # | Tool | Input | Purpose |
|---|------|-------|---------|
| 1 | `search_datasets` | `age_group`, `modality`, `clinical_diagnosis`, `cell_type` | Find datasets matching criteria |
| 2 | `get_dataset_details` | `dataset_id` | Full metadata for one dataset |
| 3 | `get_dataset_overlap` | `dataset_a`, `dataset_b` | Compare two datasets (shared modalities, age overlap) |
| 4 | `get_compatible_models` | `modality` or `dataset_id` | List models compatible with data |
| 5 | `get_model_details` | `model_id` | Full model description + compatible modalities |
| 6 | `filter_donors` | `dataset_id`, `column`, `operator`, `value`, `return_mode` | Filter individual donor rows |
| 7 | `check_data_sufficiency` | `donor_count`, `comparison_groups`, `analysis_type` | Assess if sample size is sufficient |

**`filter_donors` operators:** `>`, `<`, `>=`, `<=`, `==`, `!=`, `contains`, `not_contains`
**`filter_donors` columns:** `age`, `sex`, `bmi`, `clinicalDiagnosis`, `t1dStage`, `diseaseStatus`, `autoAntibodyPositive`

**Tool-use loop:** Claude may call multiple tools in sequence (max 5 iterations) before producing a final text response.

---

### 3.3 Dataset Workspace

**Location:** Right panel (2-column) or middle panel (3-column) on `/selection`

#### 3.3.1 Empty State

When no datasets are selected:
- Icon + "No datasets selected" message
- Hint: "Ask the AI to recommend datasets, or use the dataset picker in the chat input"

#### 3.3.2 Workspace Header

| Element | Description |
|---------|-------------|
| Tabs | One tab per selected dataset (e.g., "HPAP", "TEDDY"); active tab has blue underline + blue dot if pending changes |
| Model dropdown | Select foundation model (3 options + tooltips on hover) |
| Run Experiment button | Blue button, disabled if no datasets selected |

#### 3.3.3 Dataset Table Header

Per-dataset header showing:
- Dataset title + donor count
- Key info chips (age range)
- Modality tags
- Cell type tag

#### 3.3.4 Dataset Table

Interactive data table with donor-level rows.

**Columns:** Checkbox | Donor ID | Age | Sex | BMI | Clinical Diagnosis | T1D Stage | Disease Status | Disease Duration | Autoantibody | AAb+ Count | Cell Type

**Table Features:**

| Feature | Description |
|---------|-------------|
| Checkbox selection | Click to select rows; header checkbox for select-all (with indeterminate state) |
| Sorting | Click column header to sort (asc/desc); sort indicator icon |
| Sticky columns | Checkbox + Donor ID columns stick on horizontal scroll |
| Row states | Normal, Selected (blue bg), Deleted (red bg + strikethrough + ✕ icon), Added (green bg + left border) |
| Scroll | Vertical + horizontal scroll with min-width 900px |

#### 3.3.5 Toolbar

| Button | Icon | Behavior |
|--------|------|----------|
| Undo | ↩ | Reverts last table action; supports `Cmd+Z` / `Ctrl+Z` |
| Redo | ↪ | Re-applies undone action; supports `Cmd+Shift+Z` / `Ctrl+Shift+Z` |
| Sort | ↕ | Dropdown menu listing all columns; click to sort, click again to reverse |
| Filter | ⚙ | Dropdown with text inputs for categorical columns; "Clear all" button |
| Delete | 🗑 N selected | Appears when rows are selected; marks selected rows as deleted (soft delete) |
| ─ (divider) | | Visual separator |
| Update Dataset | Button | Grey when no changes; blue when pending changes; commits all changes permanently |

#### 3.3.6 Table Operations Flow

**Manual operations (user-driven):**
1. User selects rows via checkboxes
2. User clicks "Delete" → rows marked red (soft delete)
3. User clicks "Update Dataset" → deletions committed, rows permanently removed
4. System message posted to chat confirming the update

**AI-driven operations:**
1. User asks AI to filter/add/remove donors
2. AI uses `filter_donors` tool, responds with `[TABLE_REMOVE:...]` or `[TABLE_ADD:...]`
3. Frontend displays DatasetUpdateCard in chat
4. User clicks "Update" on card → `triggerUpdate(datasetId)` fires
5. Workspace consumes trigger → marks rows as deleted/added → auto-commits
6. Table refreshes with changes applied

#### 3.3.7 Undo/Redo System

- Per-dataset undo/redo history stored in `tableHistories`
- Each action (select, delete, add) pushes to history stack
- Undo pops from `past` → pushes to `future`
- Redo pops from `future` → pushes to `past`
- "Update Dataset" clears undo/redo history (committed = permanent)

---

### 3.4 Dataset Detail Modal

**Trigger:** "View details" link on DatasetRecommendation card

**Content:**
- Header: Dataset title + description + close button
- Stats row: Donor count, age range, cell type, modality tags
- Metadata grid: 2-column grid showing all metadata fields (ageRange, sex, bmiRange, clinicalDiagnosis, t1dStage, diseaseStatus, diseaseDuration, autoAntibody)
- Sample data table: Read-only table of all demo donor rows with all columns

---

### 3.5 Results Page (`/results`)

#### 3.5.1 Breadcrumb Navigation

`← Back | Selection > Results`

#### 3.5.2 Summary Card

| Field | Content |
|-------|---------|
| Title | "Experiment #N" |
| Timestamp | Date/time of run |
| Hypothesis | User's hypothesis text |
| Datasets | List of selected dataset IDs |
| Model | Selected foundation model name |

#### 3.5.3 Key Findings

Bulleted list of 3 AI-generated findings (currently mock data):
- Gene expression comparison results
- Cell-type specific patterns
- Statistical significance notes

#### 3.5.4 Visualizations

2-column grid with:

1. **Feature Importance Bar Chart** — Horizontal bars showing gene importance scores (INS, GCG, SST, PDX1, NKX6.1)
2. **Expression Heatmap** — Color-coded grid (genes × cell types) with opacity-based heat values

#### 3.5.5 Raw Data Table

Expandable section with gene-level results:

| Column | Example |
|--------|---------|
| Gene | INS |
| Importance | 0.89 |
| P-value | 0.001 |

#### 3.5.6 Run History

Sidebar list of all past experiment runs. Each entry shows:
- Run number + status badge
- Timestamp
- Selected datasets

Click to switch between historical results.

#### 3.5.7 Action Buttons

- **Reset & Re-run** — Navigate back to `/selection`
- **Save PDF** — Simulated export (logs to console)

---

## 4. Data Model

### 4.1 Available Datasets

| ID | Name | Donors | Age Range | Modalities | Cell Type | Diagnosis Types |
|----|------|--------|-----------|------------|-----------|-----------------|
| `hpap` | HPAP | 194 | 18–76 yrs | RNA-seq | Islet cells | T1D, Non-diabetic, T2D |
| `teddy` | TEDDY | 428 | 4–10 yrs | RNA-seq | Blood samples | At-risk, T1D |
| `immport` | ImmPort | 312 | 5–65 yrs | CyTOF, Flow Cytometry | PBMCs | T1D, At-risk, Control |
| `trialnet` | TrialNet | 245 | 3–55 yrs | scRNA-seq, CyTOF | PBMCs | At-risk, T1D, Control |

### 4.2 Donor Row Schema

```
donorId            string     Unique identifier (e.g., "HPAP-001")
age                number     Years
sex                string     "M" or "F"
bmi                number     Body Mass Index
clinicalDiagnosis  string     "T1D" | "Non-diabetic" | "T2D" | "At-risk" | "Control"
t1dStage           string     "Stage 0" | "Stage 1" | "Stage 2" | "Stage 3" | "—"
diseaseStatus      string     "AAb+" | "AAb−"
diseaseDuration    string     e.g., "5 yrs", "36 mo", "—"
autoAntibody       string     e.g., "GADA, IA-2", "—"
autoAntibodyPositive number   Count of positive autoantibodies (0–4)
cellType           string     "Islet cells" | "Blood samples" | "PBMCs"
```

### 4.3 Demo Sample Data

| Dataset | Demo Rows |
|---------|-----------|
| HPAP | 15 donors (HPAP-001 to HPAP-015) |
| TEDDY | 12 donors (TEDDY-001 to TEDDY-012) |
| ImmPort | 10 donors (IMP-001 to IMP-010) |
| TrialNet | 10 donors (TN-001 to TN-010) |

### 4.4 Foundation Models

| ID | Name | Compatible Modalities | Use Case |
|----|------|-----------------------|----------|
| `spatial-fm` | Spatial FM | spatial-transcriptomics, CODEX, scRNA-seq | Immune infiltration mapping, tissue architecture |
| `single-cell-fm` | Single Cell FM | scRNA-seq, RNA-seq, CyTOF, ATAC-seq | Cellular heterogeneity, cell-type expression, rare beta cells |
| `genomic-fm` | Genomic FM | WGS, RNA-seq, ATAC-seq | Genetic variants, polygenic risk scores |

---

## 5. State Management

### 5.1 ExperimentContext (Global State)

Single React Context provider wrapping the entire app.

```
config
├── hypothesis: string               Default: "Compare beta cell gene expression..."
├── selectedDatasets: string[]        IDs of datasets added to workspace
├── selectedModelId: string | null    Selected foundation model
└── pipelineConfigId: string | null   (Reserved for future use)

messages: ChatMessage[]               Full conversation history
history: ExperimentResult[]           Past experiment runs
currentResultIndex: number | null     Active result being viewed

tableStates: { [datasetId]: TableState }
├── selectedRows: Set<donorId>
├── deletedRows: Set<donorId>
├── addedRows: Row[]
├── sortConfig: { column, direction }
└── filters: { [column]: value }

tableHistories: { [datasetId]: { past: State[], future: State[] } }
committedData: { [datasetId]: Row[] }     Persisted after "Update Dataset"
pendingTableOps: TableOp[]                Queued from AI responses
updateTrigger: { datasetId, ts } | null   Cross-component update signal
```

### 5.2 Cross-Component Communication

```
Chat Card "Update" button
  → triggerUpdate(datasetId)     [sets updateTrigger in context]
  → DatasetWorkspace useEffect   [consumes trigger]
  → performUpdate(datasetId)     [commits changes, clears history]
  → addMessage(system)           [posts confirmation to chat]
```

---

## 6. API Specification

### 6.1 `POST /api/chat`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "recommend datasets for my T1D hypothesis" },
    { "role": "assistant", "content": "Based on..." },
    { "role": "user", "content": "remove non-diabetic donors from HPAP" }
  ]
}
```

**Response:**
```json
{
  "content": "I've identified the non-diabetic donors...\n[TABLE_REMOVE:hpap:HPAP-002,HPAP-005]",
  "usage": { "input_tokens": 1234, "output_tokens": 567 }
}
```

**Error Response:**
```json
{
  "error": "ANTHROPIC_API_KEY not set in .env",
  "content": "Sorry, I encountered an error connecting to the AI service."
}
```

### 6.2 Claude API Configuration

| Parameter | Value |
|-----------|-------|
| Model | `claude-sonnet-4-20250514` |
| Max tokens | 2048 |
| System prompt | `server/systemPrompt.js` |
| Tools | 7 tool definitions from `server/tools.js` |
| Max tool loops | 5 |

### 6.3 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | `.env` (local) / Vercel Dashboard (prod) | Claude API authentication |

---

## 7. User Workflows

### 7.1 Workflow: AI-Guided Dataset Discovery

```
User: "I want to compare beta cell expression in pediatric vs adult T1D"
  ↓
AI uses search_datasets + get_dataset_details tools
  ↓
AI responds with explanation + [DATASET:hpap] + [DATASET:teddy]
  ↓
Chat shows two DatasetRecommendation cards
  ↓
User clicks "Add" on HPAP → workspace shows HPAP tab with 15 donor rows
User clicks "Add" on TEDDY → workspace adds TEDDY tab with 12 donor rows
```

### 7.2 Workflow: AI-Driven Table Curation

```
User: "Remove non-diabetic donors from HPAP"
  ↓
AI uses filter_donors(hpap, clinicalDiagnosis, ==, Non-diabetic)
  ↓
AI responds with [TABLE_REMOVE:hpap:HPAP-002,HPAP-005,HPAP-007,HPAP-011,HPAP-014]
  ↓
Chat shows DatasetUpdateCard (red badge: −5)
  ↓
User clicks "Update" → rows permanently removed from HPAP table
```

### 7.3 Workflow: AI-Driven Row Addition

```
User: "Add more adult T1D donors to HPAP"
  ↓
AI generates new donor rows based on dataset profile
  ↓
AI responds with [TABLE_ADD:hpap:HPAP-016,35,M,26.2,T1D,Stage 3,AAb+,8 yrs,GADA IA-2,2,Islet cells]
  ↓
Chat shows DatasetUpdateCard (green badge: +N)
  ↓
User clicks "Update" → new rows added to HPAP table (green highlight)
```

### 7.4 Workflow: Manual Table Operations

```
User opens HPAP tab in workspace
  ↓
User clicks checkboxes on 3 rows
  ↓
Toolbar shows "Delete 3 selected" button
  ↓
User clicks Delete → rows turn red with strikethrough
  ↓
User clicks "Update Dataset" in toolbar → rows permanently removed
  ↓
System message posted to chat: "HPAP updated: 3 donors removed"
```

### 7.5 Workflow: Run Experiment

```
User has datasets selected + model chosen
  ↓
User clicks "Run Experiment" in workspace header
  ↓
ExperimentContext.runExperiment() generates mock results
  ↓
App navigates to /results
  ↓
ResultsPanel shows: Summary → Key Findings → Visualizations → Raw Data
  ↓
User can click "Reset & Re-run" to return to /selection
```

---

## 8. UI/UX Design System

### 8.1 Visual Style

- **Inspiration:** Notion-like minimal design
- **Typography:** System font stack (`-apple-system, BlinkMacSystemFont, Segoe UI, ...`)
- **Color palette:** Neutral greys + single accent blue (`#2383e2`)

### 8.2 Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#fff` | Main background |
| `--color-bg-surface` | `#f7f6f3` | Cards, table headers, panels |
| `--color-text-primary` | `#37352f` | Body text |
| `--color-text-secondary` | `#787774` | Labels, hints |
| `--color-accent-blue` | `#2383e2` | Buttons, links, active states |
| `--color-border-default` | `#e3e2e0` | Borders, dividers |
| `--color-success-green` | `#2d9f5d` | Added rows |
| Red (`#dc2626`) | — | Deleted rows, error states |

### 8.3 Spacing Scale

| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-xxl` | 48px |

### 8.4 Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| > 1024px | Full layout with resizable panels |
| ≤ 1024px | Equal 50/50 split, drag handles hidden |
| ≤ 640px | Stacked vertical layout, full-width panels |

---

## 9. Technical Architecture

### 9.1 Dependency List

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.2.4 | UI framework |
| `react-dom` | 19.2.4 | DOM rendering |
| `react-router-dom` | 7.13.2 | Client-side routing |
| `@anthropic-ai/sdk` | 0.81.0 | Claude API client |
| `vite` | 8.0.1 | Build tool + dev server |
| `@vitejs/plugin-react` | 6.0.1 | React HMR/JSX support |

### 9.2 File Structure

```
mai-t1d-chatbot/
├── api/
│   └── chat.js                    Vercel serverless function
├── server/
│   ├── api.js                     Claude API handler + tool-use loop
│   ├── systemPrompt.js            AI persona + response format rules
│   └── tools.js                   7 tool definitions + demo data + executors
├── src/
│   ├── main.jsx                   React entry point
│   ├── App.jsx                    Router (/ → /selection, /results)
│   ├── context/
│   │   └── ExperimentContext.jsx   Global state provider
│   ├── pages/
│   │   ├── SelectionPage.jsx      2-col or 3-col layout
│   │   └── ResultsPage.jsx        2-col layout with results
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatInterface.jsx  Main chat container
│   │   │   ├── ChatInterface.css
│   │   │   ├── ChatMessage.jsx    Single message bubble
│   │   │   ├── ChatMessage.css
│   │   │   ├── ChatInput.jsx      Input + dataset picker
│   │   │   ├── ChatInput.css
│   │   │   ├── DatasetRecommendation.jsx
│   │   │   ├── DatasetRecommendation.css
│   │   │   ├── ModelRecommendation.jsx
│   │   │   ├── ModelRecommendation.css
│   │   │   ├── DatasetUpdateCard.jsx
│   │   │   ├── DatasetUpdateCard.css
│   │   │   ├── DatasetDetailModal.jsx
│   │   │   └── DatasetDetailModal.css
│   │   ├── workspace/
│   │   │   ├── DatasetWorkspace.jsx   Tabs + table + toolbar orchestration
│   │   │   ├── DatasetWorkspace.css
│   │   │   ├── DatasetTable.jsx       Interactive data table
│   │   │   ├── DatasetTable.css
│   │   │   ├── DatasetTableHeader.jsx
│   │   │   ├── DatasetTableHeader.css
│   │   │   ├── DatasetToolbar.jsx     Undo/redo, sort, filter, delete, update
│   │   │   └── DatasetToolbar.css
│   │   ├── layout/
│   │   │   ├── TwoColumnLayout.jsx    Resizable 2-panel layout
│   │   │   ├── TwoColumnLayout.css
│   │   │   ├── ThreeColumnLayout.jsx  Resizable 3-panel layout
│   │   │   └── ThreeColumnLayout.css
│   │   ├── output/
│   │   │   ├── OutputPanel.jsx        Placeholder for experiment output
│   │   │   └── OutputPanel.css
│   │   └── results/
│   │       ├── ResultsPanel.jsx       Full results display
│   │       ├── ResultsPanel.css
│   │       ├── SummaryCard.jsx
│   │       ├── KeyFindings.jsx
│   │       ├── Visualizations.jsx
│   │       ├── RawDataTable.jsx
│   │       ├── Breadcrumb.jsx
│   │       └── Breadcrumb.css
│   ├── services/
│   │   └── chatService.js            API calls + response parsing + mock fallback
│   ├── data/
│   │   ├── demoDatasets.js            4 datasets with sample rows
│   │   ├── demoModels.js              3 foundation models
│   │   ├── demoPipelines.js           3 pipeline configs (reserved)
│   │   └── demoResults.js             Mock result generator
│   └── styles/
│       ├── variables.css              CSS custom properties
│       └── global.css                 Reset + base styles
├── index.html                         SPA entry point
├── vite.config.js                     Vite config + dev API proxy
├── vercel.json                        Vercel routing (SPA fallback + API)
├── package.json                       Dependencies
└── .env                               ANTHROPIC_API_KEY (local only)
```

### 9.3 Deployment

| Environment | Platform | API Route | Notes |
|-------------|----------|-----------|-------|
| Local dev | Vite dev server | Vite middleware proxy (`configureServer`) | Hot reload, instant feedback |
| Production | Vercel | `api/chat.js` serverless function | Auto-deploy from `main` branch |

**Vercel Configuration (`vercel.json`):**
```json
{
  "rewrites": [
    { "source": "/api/chat", "destination": "/api/chat" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

## 10. Current Limitations & Known Constraints

| Area | Limitation |
|------|-----------|
| Data | All dataset rows are demo/mock data (15 rows max per dataset) |
| Results | Experiment results are mock-generated, not from real analysis |
| Models | Foundation models are conceptual; no actual model execution |
| Auth | No user authentication or session persistence |
| Storage | All state is in-memory (lost on page refresh) |
| Export | PDF export is simulated (console.log only) |
| Charts | Visualizations use CSS-based bar charts and heatmaps (no charting library) |
| Pipelines | Pipeline configuration is defined but not wired to UI |

---

## 11. Future Roadmap

### Phase 2: Real Data Integration
- Connect to actual HPAP, TEDDY, ImmPort, TrialNet APIs
- Replace demo sample data with real donor-level data
- Implement server-side pagination for large datasets
- Add data caching layer

### Phase 3: Real Analysis Pipeline
- Integrate actual foundation model inference
- Real experiment execution with progress tracking
- Rich visualizations (Recharts / D3.js)
- Export results as PDF / CSV

### Phase 4: Collaboration & Persistence
- User authentication (OAuth)
- Save/load experiments to database
- Share experiments with team members
- Experiment versioning and comparison

### Phase 5: Advanced Features
- Multi-dataset cross-analysis
- Custom tool creation by researchers
- Batch processing mode
- Notification system for long-running analyses
- WCAG 2.1 accessibility audit
- Table virtualization for 1000+ row datasets
