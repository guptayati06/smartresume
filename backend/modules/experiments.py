import re
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from .skill_extractor import exact_canonical_match, alias_canonical_match, extract_skills, extract_skill_evidence
from .sample_data import GOLD_SKILL_DATA_EXP1

def evaluate_exp1_skill_extraction(gold_data=None):
    """
    Experiment 1: Evaluates Method A (Exact phrase) vs Method B (Alias-aware)
    on gold-labelled benchmark test cases.
    Returns:
        summary_table: list of dicts for each method with TP, FP, FN, Precision, Recall, F1
        per_example_table: breakdown by example ID and method
        error_table: false positive and false negative occurrences with snippet text
    """
    if gold_data is None:
        gold_data = GOLD_SKILL_DATA_EXP1

    def prf(gold: set, pred: set):
        tp = len(gold & pred)
        fp = len(pred - gold)
        fn = len(gold - pred)
        p = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        r = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f = (2 * p * r) / (p + r) if (p + r) > 0 else 0.0
        return {"TP": tp, "FP": fp, "FN": fn, "Precision": round(p, 4), "Recall": round(r, 4), "F1": round(f, 4)}

    per_example = []
    errors = []

    for row in gold_data:
        gold = set(row["gold_skills"])
        methods = [
            ("A: exact phrase", exact_canonical_match(row["text"])),
            ("B: alias-aware", alias_canonical_match(row["text"]))
        ]
        for method_name, pred in methods:
            metrics = prf(gold, pred)
            per_example.append({
                "ID": row["id"],
                "Method": method_name,
                "Text": row["text"],
                "Gold": sorted(list(gold)),
                "Predicted": sorted(list(pred)),
                **metrics
            })
            for skill in sorted(pred - gold):
                errors.append({
                    "ID": row["id"],
                    "Method": method_name,
                    "Error": "False positive",
                    "Skill": skill,
                    "Text": row["text"]
                })
            for skill in sorted(gold - pred):
                errors.append({
                    "ID": row["id"],
                    "Method": method_name,
                    "Error": "False negative",
                    "Skill": skill,
                    "Text": row["text"]
                })

    # Summary table
    methods_list = ["A: exact phrase", "B: alias-aware"]
    summary = []
    for m in methods_list:
        m_rows = [r for r in per_example if r["Method"] == m]
        sum_tp = sum(r["TP"] for r in m_rows)
        sum_fp = sum(r["FP"] for r in m_rows)
        sum_fn = sum(r["FN"] for r in m_rows)
        prec = sum_tp / (sum_tp + sum_fp) if (sum_tp + sum_fp) > 0 else 0.0
        rec = sum_tp / (sum_tp + sum_fn) if (sum_tp + sum_fn) > 0 else 0.0
        f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
        summary.append({
            "Method": m,
            "TP": sum_tp,
            "FP": sum_fp,
            "FN": sum_fn,
            "Precision": round(prec, 4),
            "Recall": round(rec, 4),
            "F1": round(f1, 4)
        })

    return {
        "summary": summary,
        "per_example": per_example,
        "errors": errors
    }


def dcg_at_k(relevances, k):
    rel = np.asarray(relevances, dtype=float)[:k]
    if len(rel) == 0:
        return 0.0
    return float(np.sum((2**rel - 1) / np.log2(np.arange(2, len(rel) + 2))))


def ndcg_at_k(relevances, k=5):
    actual = dcg_at_k(relevances, k)
    ideal = dcg_at_k(sorted(relevances, reverse=True), k)
    return round(float(actual / ideal), 4) if ideal > 0 else 0.0


def precision_at_k(relevances, k, threshold=2):
    rel = np.asarray(relevances, dtype=float)[:k]
    if len(rel) == 0:
        return 0.0
    return round(float(np.mean(rel >= threshold)), 4)


def evaluate_exp2_ranking(candidates_scores: list[dict], relevance_labels: dict, ks=(3, 5)):
    """
    Experiment 2: Evaluates 3 rankers (TF-IDF, Sentence Embeddings, Hybrid)
    against human relevance labels.
    """
    candidate_names = [c["Candidate"] for c in candidates_scores]
    missing = [c for c in candidate_names if c not in relevance_labels]
    
    # If any candidate missing relevance labels, report awaiting status
    if missing or not relevance_labels:
        return {
            "status": "awaiting_labels",
            "message": f"Awaiting evaluation labels for {len(missing)} candidate(s): {', '.join(missing[:3])}",
            "missing_candidates": missing,
            "metrics": [],
            "correlations": []
        }

    # Verify scores are valid ints (0, 1, 2, 3)
    for c in candidate_names:
        label = relevance_labels.get(c)
        if label not in (0, 1, 2, 3):
            return {
                "status": "invalid_labels",
                "message": f"Relevance label for '{c}' must be 0, 1, 2, or 3. Received: {label}",
                "metrics": [],
                "correlations": []
            }

    methods = [
        ("TF-IDF cosine", "TF-IDF Similarity (%)"),
        ("Sentence embeddings", "Semantic Similarity (%)"),
        ("Hybrid ranker", "Compatibility Index")
    ]

    metrics_rows = []
    ranks = {}

    for method_label, col in methods:
        # Sort candidates descending by score
        sorted_candidates = sorted(candidates_scores, key=lambda x: x.get(col, 0.0), reverse=True)
        ordered_names = [c["Candidate"] for c in sorted_candidates]
        rels = [relevance_labels[name] for name in ordered_names]
        ranks[method_label] = {name: idx + 1 for idx, name in enumerate(ordered_names)}

        row = {
            "Method": method_label,
            "Total_Candidates": len(rels)
        }
        for k in ks:
            eff_k = min(k, len(rels))
            row[f"nDCG@{eff_k}"] = ndcg_at_k(rels, eff_k)
            row[f"Precision@{eff_k}"] = precision_at_k(rels, eff_k, threshold=2)
        metrics_rows.append(row)

    # Calculate Spearman rank correlations
    correlations = []
    method_keys = list(ranks.keys())
    for i in range(len(method_keys)):
        for j in range(i + 1, len(method_keys)):
            m_a, m_b = method_keys[i], method_keys[j]
            ranks_a = [ranks[m_a][name] for name in candidate_names]
            ranks_b = [ranks[m_b][name] for name in candidate_names]
            try:
                corr = spearmanr(ranks_a, ranks_b).statistic
                correlations.append({
                    "Method A": m_a,
                    "Method B": m_b,
                    "Spearman rank correlation": round(float(corr), 4)
                })
            except Exception:
                pass

    return {
        "status": "completed",
        "message": f"Evaluated {len(candidate_names)} candidates across 3 ranking strategies.",
        "metrics": metrics_rows,
        "correlations": correlations
    }
