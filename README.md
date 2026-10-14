# SmartResume — NLP-Based Resume Analysis & Candidate Ranking

**Sixth-Semester Data Science Engineering Project**

SmartResume is a web application that analyzes resumes against a job description using NLP techniques — skill extraction, TF-IDF similarity, and hybrid candidate ranking.

---

## Features

- Upload multiple resumes (PDF, DOCX, TXT)
- OCR fallback for scanned PDFs
- Exact phrase and alias-aware skill extraction with evidence snippets
- 53 canonical skills with categories (Programming, Databases, ML/AI, Cloud, etc.)
- TF-IDF cosine similarity + Sentence Transformer semantic similarity (optional)
- Hybrid scoring: skill coverage + semantic similarity
- Candidate ranking table with match scores
- Skill gap analysis per candidate
- Precision, Recall, F1, nDCG@K, and Spearman rank correlation evaluation
- Explainability audit — evidence snippets, reviewer decisions
- CSV exports for rankings and experiments

---

## Project Structure

```
smartresume/
├── backend/                  # Flask REST API
│   ├── app.py                # Entry point
│   ├── requirements.txt      # Python dependencies
│   ├── modules/
│   │   ├── ontology.py       # 53 canonical skills + aliases
│   │   ├── skill_extractor.py
│   │   ├── document_parser.py
│   │   ├── ranker.py         # TF-IDF, Semantic, Hybrid scoring
│   │   ├── section_detector.py
│   │   ├── experiments.py    # Evaluation metrics
│   │   ├── sample_data.py    # Benchmark candidates
│   │   ├── audit_store.py
│   │   └── export_generator.py
│   └── uploads/              # Temp folder (git-ignored)
│
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/            # 7 page components
│   │   ├── components/       # Sidebar, Header, Badge
│   │   ├── api.js            # API layer
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── start.bat                 # One-click start (Windows)
├── .gitignore
└── README.md
```

---

## Setup & Running Locally

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to the Flask backend automatically.

### One-click Start (Windows)

Double-click `start.bat` — it starts both servers in separate terminal windows.

---

## Semantic Similarity (Optional)

By default, semantic similarity falls back to TF-IDF. To enable real Sentence Transformer scoring:

```bash
pip install sentence-transformers torch
```

Then uncomment the relevant lines in `backend/requirements.txt`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Lucide React |
| Backend | Python 3.12, Flask 3, Flask-CORS |
| NLP | scikit-learn (TF-IDF), sentence-transformers (optional) |
| Parsing | PyMuPDF, pypdf, python-docx |
| Evaluation | scipy (Spearman), pandas, numpy |

---

## License

Academic project — for educational use only.
