import os
import re
import io
from flask import Flask, request, jsonify, Response, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np

from modules.ontology import SKILL_ONTOLOGY, ALIAS_RULES
from modules.skill_extractor import (
    extract_skill_evidence,
    extract_skills,
    skills_by_category,
    exact_canonical_match,
    alias_canonical_match
)
from modules.section_detector import detect_sections, resume_improvement_suggestions
from modules.document_parser import extract_text_from_bytes
from modules.ranker import (
    tfidf_similarity,
    semantic_similarity,
    calculate_compatibility,
    init_embedding_model,
    compute_corpus_tfidf,
    compute_corpus_embeddings
)
from modules.sample_data import (
    DEFAULT_JOB_DESCRIPTION,
    SAMPLE_CANDIDATES,
    GOLD_SKILL_DATA_EXP1,
    BENCHMARK_RELEVANCE_LABELS
)
from modules.experiments import (
    evaluate_exp1_skill_extraction,
    evaluate_exp2_ranking
)
from modules.audit_store import (
    load_audit_data,
    update_evidence_decision,
    update_recommendation_status,
    save_all_relevance_labels,
    add_layout_error
)
from modules.export_generator import (
    build_candidate_ranking_csv,
    build_candidate_feedback_csv,
    generate_csv_response
)

app = Flask(__name__)
CORS(app)

# In-memory session state for current analysis
CURRENT_STATE = {
    "job_description": DEFAULT_JOB_DESCRIPTION,
    "results": [],
    "errors": [],
    "extraction_log": [],
    "job_skills": [],
    "skill_weight": 0.65,
    "semantic_weight": 0.35,
    "extraction_mode": "alias-aware"
}

def analyze_single_candidate(filename: str, resume_text: str, job_text: str, skill_weight: float = 0.65, semantic_weight: float = 0.35, mode: str = "alias-aware"):
    """Runs full NLP extraction, evidence gathering, section detection, and scoring for one candidate."""
    if mode == "exact":
        resume_skills_set = exact_canonical_match(resume_text)
        job_skills_set = exact_canonical_match(job_text)
        resume_evidence = {s: [{"canonical_skill": s, "matched_alias": s, "category": SKILL_ONTOLOGY.get(s, ([], "General"))[1], "snippet": f"Exact mention of '{s}'"}] for s in resume_skills_set}
        job_evidence = {s: [{"canonical_skill": s, "matched_alias": s, "category": SKILL_ONTOLOGY.get(s, ([], "General"))[1], "snippet": f"Exact mention of '{s}'"}] for s in job_skills_set}
    else:
        resume_evidence = extract_skill_evidence(resume_text)
        job_evidence = extract_skill_evidence(job_text)
        resume_skills_set = set(resume_evidence.keys())
        job_skills_set = set(job_evidence.keys())

    resume_skills = sorted(list(resume_skills_set))
    job_skills = sorted(list(job_skills_set))

    matched = sorted(list(resume_skills_set & job_skills_set))
    missing = sorted(list(job_skills_set - resume_skills_set))
    extra = sorted(list(resume_skills_set - job_skills_set))

    coverage = len(matched) / len(job_skills) if job_skills else 0.0

    lexical = tfidf_similarity(resume_text, job_text)
    semantic, semantic_method = semantic_similarity(resume_text, job_text, lexical)
    compatibility = calculate_compatibility(coverage, semantic, skill_weight, semantic_weight)

    sections = detect_sections(resume_text)
    suggestions = resume_improvement_suggestions(resume_text, missing, sections)

    word_count = len(re.findall(r"\b[\w+#.-]+\b", resume_text))

    return {
        "Candidate": filename,
        "Compatibility Index": compatibility,
        "Skill Coverage (%)": round(coverage * 100, 2),
        "Semantic Similarity (%)": round(semantic * 100, 2),
        "TF-IDF Similarity (%)": round(lexical * 100, 2),
        "Resume Skills": resume_skills,
        "Skill Evidence": resume_evidence,
        "Skills by Category": skills_by_category(resume_text),
        "Job Skills Detected": job_skills,
        "Matched Skills": matched,
        "Skills Not Detected": missing,
        "Additional Resume Skills": extra,
        "Sections": sections,
        "Suggestions": suggestions,
        "Semantic Method": semantic_method,
        "Resume Word Count": word_count,
        "Resume Text": resume_text
    }


def run_benchmark_analysis():
    """Initializes current state with benchmark dataset from notebook."""
    CURRENT_STATE["job_description"] = DEFAULT_JOB_DESCRIPTION
    CURRENT_STATE["results"] = []
    CURRENT_STATE["errors"] = []
    CURRENT_STATE["extraction_log"] = []
    CURRENT_STATE["job_skills"] = extract_skills(DEFAULT_JOB_DESCRIPTION)

    for item in SAMPLE_CANDIDATES:
        cand_result = analyze_single_candidate(
            filename=item["filename"],
            resume_text=item["text"],
            job_text=DEFAULT_JOB_DESCRIPTION,
            skill_weight=0.65,
            semantic_weight=0.35,
            mode="alias-aware"
        )
        CURRENT_STATE["results"].append(cand_result)
        CURRENT_STATE["extraction_log"].append({
            "Candidate": item["filename"],
            "Format": item["format"],
            "Extraction method": item["extraction_method"],
            "Characters": item["characters"],
            "Status": item["status"]
        })

    # Sort results descending by Compatibility Index, then Skill Coverage
    CURRENT_STATE["results"].sort(
        key=lambda x: (x["Compatibility Index"], x["Skill Coverage (%)"], x["Semantic Similarity (%)"]),
        reverse=True
    )
    for idx, r in enumerate(CURRENT_STATE["results"]):
        r["Rank"] = idx + 1

# Initialize benchmark on startup
run_benchmark_analysis()


@app.route("/api/health", methods=["GET"])
def health_check():
    _, model_status = init_embedding_model()
    return jsonify({
        "status": "healthy",
        "service": "SmartResume NLP Engine",
        "model_status": model_status,
        "ontology_size": len(SKILL_ONTOLOGY),
        "active_candidates": len(CURRENT_STATE["results"])
    })


@app.route("/api/defaults", methods=["GET"])
def get_defaults():
    categories = sorted(list({cat for _, (_, cat) in SKILL_ONTOLOGY.items()}))
    return jsonify({
        "job_description": DEFAULT_JOB_DESCRIPTION,
        "default_weights": {"skill_weight": 0.65, "semantic_weight": 0.35},
        "sample_candidates_count": len(SAMPLE_CANDIDATES),
        "sample_candidate_names": [c["filename"] for c in SAMPLE_CANDIDATES],
        "categories": categories,
        "ontology_summary": {
            "total_canonical_skills": len(SKILL_ONTOLOGY),
            "total_alias_rules": len(ALIAS_RULES),
            "categories": categories
        }
    })


@app.route("/api/state", methods=["GET"])
def get_current_state():
    return jsonify({
        "job_description": CURRENT_STATE["job_description"],
        "job_skills": CURRENT_STATE["job_skills"],
        "total_candidates": len(CURRENT_STATE["results"]),
        "results": CURRENT_STATE["results"],
        "errors": CURRENT_STATE["errors"],
        "extraction_log": CURRENT_STATE["extraction_log"],
        "skill_weight": CURRENT_STATE["skill_weight"],
        "semantic_weight": CURRENT_STATE["semantic_weight"],
        "extraction_mode": CURRENT_STATE["extraction_mode"]
    })


@app.route("/api/analyze", methods=["POST"])
def analyze_resumes():
    """
    Analyzes uploaded files or benchmark resumes against the job description.
    Supports multipart/form-data file uploads or JSON payload.
    """
    
if request.is_json:
    payload = request.get_json(silent=True) or {}
    job_text = payload.get("job_description")
else:
    job_text = request.form.get("job_description")
    
if not job_text or not job_text.strip():
        job_text = CURRENT_STATE["job_description"]

    skill_weight = float(request.form.get("skill_weight", 0.65) if not request.is_json else request.json.get("skill_weight", 0.65))
    semantic_weight = float(request.form.get("semantic_weight", 0.35) if not request.is_json else request.json.get("semantic_weight", 0.35))
    mode = request.form.get("extraction_mode", "alias-aware") if not request.is_json else request.json.get("extraction_mode", "alias-aware")
    use_benchmark = request.form.get("use_benchmark", "false").lower() == "true" if not request.is_json else request.json.get("use_benchmark", False)

    CURRENT_STATE["job_description"] = job_text
    CURRENT_STATE["job_skills"] = sorted(list(exact_canonical_match(job_text) if mode == "exact" else extract_skills(job_text)))
    CURRENT_STATE["skill_weight"] = skill_weight
    CURRENT_STATE["semantic_weight"] = semantic_weight
    CURRENT_STATE["extraction_mode"] = mode
    CURRENT_STATE["results"] = []
    CURRENT_STATE["errors"] = []
    CURRENT_STATE["extraction_log"] = []

    uploaded_files = request.files.getlist("resumes") if "resumes" in request.files else []

    if use_benchmark or (not uploaded_files and not (request.is_json and request.json.get("resumes"))):
        # Process benchmark candidates
        for item in SAMPLE_CANDIDATES:
            try:
                res = analyze_single_candidate(
                    filename=item["filename"],
                    resume_text=item["text"],
                    job_text=job_text,
                    skill_weight=skill_weight,
                    semantic_weight=semantic_weight,
                    mode=mode
                )
                CURRENT_STATE["results"].append(res)
                CURRENT_STATE["extraction_log"].append({
                    "Candidate": item["filename"],
                    "Format": item["format"],
                    "Extraction method": item["extraction_method"],
                    "Characters": item["characters"],
                    "Status": "ok"
                })
            except Exception as e:
                CURRENT_STATE["errors"].append({"Candidate": item["filename"], "Error": str(e)})
                CURRENT_STATE["extraction_log"].append({
                    "Candidate": item["filename"],
                    "Format": item["format"],
                    "Extraction method": "failed",
                    "Characters": 0,
                    "Status": "error",
                    "Error": str(e)
                })
    else:
        # Process uploaded file blobs
        for f in uploaded_files:
            filename = f.filename
            try:
                file_bytes = f.read()
                ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
                resume_text, method, warnings = extract_text_from_bytes(filename, file_bytes)
                
                CURRENT_STATE["extraction_log"].append({
                    "Candidate": filename,
                    "Format": ext,
                    "Extraction method": method,
                    "Characters": len(resume_text),
                    "Status": "warning" if warnings else "ok",
                    "Warnings": warnings
                })

                res = analyze_single_candidate(
                    filename=filename,
                    resume_text=resume_text,
                    job_text=job_text,
                    skill_weight=skill_weight,
                    semantic_weight=semantic_weight,
                    mode=mode
                )
                CURRENT_STATE["results"].append(res)
            except Exception as e:
                CURRENT_STATE["errors"].append({"Candidate": filename, "Error": str(e)})
                CURRENT_STATE["extraction_log"].append({
                    "Candidate": filename,
                    "Format": os.path.splitext(filename)[1].lower(),
                    "Extraction method": "failed",
                    "Characters": 0,
                    "Status": "error",
                    "Error": str(e)
                })

    # Sort candidates
    CURRENT_STATE["results"].sort(
        key=lambda x: (x["Compatibility Index"], x["Skill Coverage (%)"], x["Semantic Similarity (%)"]),
        reverse=True
    )
    for idx, r in enumerate(CURRENT_STATE["results"]):
        r["Rank"] = idx + 1

    return jsonify({
        "status": "success",
        "total_analyzed": len(CURRENT_STATE["results"]),
        "errors_count": len(CURRENT_STATE["errors"]),
        "job_skills": CURRENT_STATE["job_skills"],
        "results": CURRENT_STATE["results"],
        "extraction_log": CURRENT_STATE["extraction_log"],
        "errors": CURRENT_STATE["errors"]
    })


@app.route("/api/experiments/exp1", methods=["GET"])
def get_experiment_1():
    """
    Returns Experiment 1: Exact Phrase vs. Alias-Aware extraction metrics,
    per-example breakdown, and errors table on gold test set.
    Also compares exact vs alias counts across all loaded candidate resumes.
    """
    exp1_data = evaluate_exp1_skill_extraction()

    # Compare exact vs alias on current active resumes
    resume_comparisons = []
    for r in CURRENT_STATE["results"]:
        text = r.get("Resume Text", "")
        exact_s = exact_canonical_match(text)
        alias_s = alias_canonical_match(text)
        added_by_alias = sorted(list(alias_s - exact_s))
        resume_comparisons.append({
            "Candidate": r["Candidate"],
            "Exact skill count": len(exact_s),
            "Alias-aware skill count": len(alias_s),
            "Skills added by aliases": added_by_alias,
            "Exact skills": sorted(list(exact_s)),
            "Alias-aware skills": sorted(list(alias_s))
        })

    return jsonify({
        "summary": exp1_data["summary"],
        "per_example": exp1_data["per_example"],
        "errors": exp1_data["errors"],
        "resume_comparison": resume_comparisons
    })


@app.route("/api/experiments/exp2", methods=["GET"])
def get_experiment_2():
    """
    Returns Experiment 2 ranking comparison:
    Candidate ranking across TF-IDF, Sentence Embeddings, and Hybrid.
    Includes nDCG@K, Precision@K, and Spearman correlation if relevance labels are provided.
    """
    audit = load_audit_data()
    relevance_labels = audit.get("relevance_labels", {})
    if not relevance_labels:
        # Pre-seed with benchmark labels if on benchmark candidates
        relevance_labels = BENCHMARK_RELEVANCE_LABELS.copy()

    # Check candidates
    scores_list = []
    for r in CURRENT_STATE["results"]:
        scores_list.append({
            "Candidate": r["Candidate"],
            "TF-IDF Similarity (%)": r["TF-IDF Similarity (%)"],
            "Semantic Similarity (%)": r["Semantic Similarity (%)"],
            "Skill Coverage (%)": r["Skill Coverage (%)"],
            "Compatibility Index": r["Compatibility Index"]
        })

    eval_result = evaluate_exp2_ranking(scores_list, relevance_labels, ks=(3, 5))

    return jsonify({
        "scores_table": scores_list,
        "relevance_labels": relevance_labels,
        "evaluation": eval_result
    })


@app.route("/api/experiments/exp2/labels", methods=["POST"])
def update_exp2_labels():
    """Updates relevance labels from human reviewer (0, 1, 2, 3)."""
    payload = request.json or {}
    updated = save_all_relevance_labels(payload)
    return jsonify({"status": "success", "labels": updated})


@app.route("/api/experiments/exp3", methods=["GET"])
def get_experiment_3():
    """
    Returns Experiment 3:
    - Skill Evidence Review rows (Candidate, Skill, Alias, Category, Evidence snippet, Reviewer decision, Reviewer notes)
    - Recommendation Support Audit rows
    - Document Extraction Robustness Log & Summary
    - Layout Error Template / documented issues
    """
    audit = load_audit_data()
    evidence_decisions = audit.get("evidence_decisions", {})
    recommendation_decisions = audit.get("recommendation_decisions", {})

    evidence_rows = []
    for r in CURRENT_STATE["results"]:
        cand = r["Candidate"]
        evidence_dict = r.get("Skill Evidence", {})
        for skill, hits in evidence_dict.items():
            for h in hits:
                alias = h["matched_alias"]
                key = f"{cand}::{skill}::{alias}"
                saved = evidence_decisions.get(key, {})
                evidence_rows.append({
                    "id": key,
                    "Candidate": cand,
                    "Skill": skill,
                    "Alias": alias,
                    "Category": h["category"],
                    "Evidence snippet": h["snippet"],
                    "Reviewer decision": saved.get("decision", ""),
                    "Reviewer notes": saved.get("notes", "")
                })

    # Recommendation support audit
    job_evidence = extract_skill_evidence(CURRENT_STATE["job_description"])
    recommendation_rows = []
    job_skills_set = set(CURRENT_STATE["job_skills"])

    for r in CURRENT_STATE["results"]:
        cand = r["Candidate"]
        resume_skills_set = set(r.get("Resume Skills", []))
        missing_skills = sorted(list(job_skills_set - resume_skills_set))
        for skill in missing_skills:
            jd_hits = job_evidence.get(skill, [])
            jd_evidence = jd_hits[0]["snippet"] if jd_hits else "Mentioned in role requirements"
            key = f"{cand}::{skill}"
            saved = recommendation_decisions.get(key, {})
            recommendation_rows.append({
                "id": key,
                "Candidate": cand,
                "JD skill not detected": skill,
                "Job-description evidence": jd_evidence,
                "Resume evidence checked": saved.get("checked", ""),
                "Suggested action": "If you genuinely have this experience, add a specific example and outcome in your project or experience section.",
                "Reviewer support status": saved.get("status", "")
            })

    # Format robustness summary
    log_df = pd.DataFrame(CURRENT_STATE["extraction_log"])
    robustness_summary = []
    if not log_df.empty and "Format" in log_df.columns:
        summary_grouped = log_df.groupby(["Format", "Extraction method"], dropna=False).agg(
            Files=("Candidate", "count"),
            Mean_characters=("Characters", "mean"),
            Failures=("Status", lambda x: int((x != "ok").sum()))
        ).reset_index()
        for _, row in summary_grouped.iterrows():
            robustness_summary.append({
                "Format": row["Format"],
                "Extraction method": row["Extraction method"],
                "Files": int(row["Files"]),
                "Mean_characters": round(float(row["Mean_characters"]), 1),
                "Failures": int(row["Failures"])
            })

    return jsonify({
        "evidence_audit": evidence_rows,
        "recommendation_audit": recommendation_rows,
        "robustness_log": CURRENT_STATE["extraction_log"],
        "robustness_summary": robustness_summary,
        "layout_errors": audit.get("layout_errors", [
            {
                "Candidate/file": "Multi-column_Resume_Sample.pdf",
                "Format": ".pdf",
                "Layout type": "Two-column lateral",
                "Observed issue": "Sidebar contact info merged into main column header",
                "Expected text/skill": "Separated personal header and skill block",
                "Extracted text/skill": "Consecutive lines mixed without whitespace break",
                "Impact": "Low (skills still detected via regex boundary)",
                "Severity": "Minor",
                "Corrective action": "Ensure column-aware extraction heuristic or pdf2image layout analysis"
            }
        ])
    })


@app.route("/api/audit/evidence", methods=["POST"])
def save_evidence_audit():
    body = request.json or {}
    res = update_evidence_decision(
        candidate=body.get("candidate", ""),
        skill=body.get("skill", ""),
        alias=body.get("alias", ""),
        decision=body.get("decision", ""),
        notes=body.get("notes", "")
    )
    return jsonify({"status": "success", "record": res})


@app.route("/api/audit/recommendation", methods=["POST"])
def save_recommendation_audit():
    body = request.json or {}
    res = update_recommendation_status(
        candidate=body.get("candidate", ""),
        skill=body.get("skill", ""),
        checked=body.get("checked", ""),
        status=body.get("status", "")
    )
    return jsonify({"status": "success", "record": res})


@app.route("/api/audit/layout-error", methods=["POST"])
def save_layout_error():
    body = request.json or {}
    errors = add_layout_error(body)
    return jsonify({"status": "success", "layout_errors": errors})


@app.route("/api/export/<export_name>", methods=["GET"])
def export_csv(export_name: str):
    """Generates real downloadable CSV exports corresponding to the 10 notebook tables."""
    if export_name == "smartresume_candidate_ranking.csv":
        csv_data = build_candidate_ranking_csv(CURRENT_STATE["results"])
    elif export_name == "smartresume_candidate_feedback.csv":
        csv_data = build_candidate_feedback_csv(CURRENT_STATE["results"])
    elif export_name == "smartresume_exp1_summary.csv":
        exp1 = evaluate_exp1_skill_extraction()
        csv_data = generate_csv_response(exp1["summary"])
    elif export_name == "smartresume_exp1_per_example.csv":
        exp1 = evaluate_exp1_skill_extraction()
        csv_data = generate_csv_response(exp1["per_example"])
    elif export_name == "smartresume_exp1_false_positive_false_negative.csv":
        exp1 = evaluate_exp1_skill_extraction()
        csv_data = generate_csv_response(exp1["errors"])
    elif export_name == "smartresume_exp1_resume_comparison.csv":
        comparisons = []
        for r in CURRENT_STATE["results"]:
            text = r.get("Resume Text", "")
            exact_s = exact_canonical_match(text)
            alias_s = alias_canonical_match(text)
            comparisons.append({
                "Candidate": r["Candidate"],
                "Exact skill count": len(exact_s),
                "Alias-aware skill count": len(alias_s),
                "Skills added by aliases": ", ".join(sorted(list(alias_s - exact_s))),
                "Exact skills": ", ".join(sorted(list(exact_s))),
                "Alias-aware skills": ", ".join(sorted(list(alias_s)))
            })
        csv_data = generate_csv_response(comparisons)
    elif export_name == "smartresume_exp2_scores.csv":
        scores = []
        for r in CURRENT_STATE["results"]:
            scores.append({
                "Candidate": r["Candidate"],
                "TF-IDF cosine": r["TF-IDF Similarity (%)"] / 100.0,
                "Sentence embedding cosine": r["Semantic Similarity (%)"] / 100.0,
                "Skill coverage": r["Skill Coverage (%)"] / 100.0,
                "Hybrid score": r["Compatibility Index"] / 100.0
            })
        csv_data = generate_csv_response(scores)
    elif export_name == "smartresume_exp3_extraction_log.csv":
        csv_data = generate_csv_response(CURRENT_STATE["extraction_log"])
    else:
        # Fallback to empty CSV
        csv_data = "Export not available\n"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={export_name}"}
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
