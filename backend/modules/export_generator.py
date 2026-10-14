import io
import csv
import pandas as pd

def generate_csv_response(rows: list[dict], fieldnames: list[str] = None) -> str:
    """Utility to convert a list of dictionaries into a CSV string."""
    if not rows:
        return ""
    if fieldnames is None:
        fieldnames = list(rows[0].keys())
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


def build_candidate_ranking_csv(candidates: list[dict]) -> str:
    rows = []
    for idx, c in enumerate(candidates):
        rows.append({
            "Rank": idx + 1,
            "Candidate": c.get("Candidate", ""),
            "Compatibility Index": c.get("Compatibility Index", 0.0),
            "Skill Coverage (%)": c.get("Skill Coverage (%)", 0.0),
            "Semantic Similarity (%)": c.get("Semantic Similarity (%)", 0.0),
            "TF-IDF Similarity (%)": c.get("TF-IDF Similarity (%)", 0.0),
            "Matched Skills": ", ".join(c.get("Matched Skills", [])),
            "Skills Not Detected": ", ".join(c.get("Skills Not Detected", []))
        })
    fields = ["Rank", "Candidate", "Compatibility Index", "Skill Coverage (%)", "Semantic Similarity (%)", "TF-IDF Similarity (%)", "Matched Skills", "Skills Not Detected"]
    return generate_csv_response(rows, fields)


def build_candidate_feedback_csv(candidates: list[dict]) -> str:
    rows = []
    for c in candidates:
        sections_str = "; ".join(f"{k}: {'Detected' if v else 'Not detected'}" for k, v in c.get("Sections", {}).items())
        suggestions_str = " | ".join(c.get("Suggestions", []))
        rows.append({
            "Candidate": c.get("Candidate", ""),
            "Compatibility Index": c.get("Compatibility Index", 0.0),
            "Skill Coverage (%)": c.get("Skill Coverage (%)", 0.0),
            "Semantic Similarity (%)": c.get("Semantic Similarity (%)", 0.0),
            "TF-IDF Similarity (%)": c.get("TF-IDF Similarity (%)", 0.0),
            "Resume Skills": ", ".join(c.get("Resume Skills", [])),
            "Matched Skills": ", ".join(c.get("Matched Skills", [])),
            "Skills Not Detected": ", ".join(c.get("Skills Not Detected", [])),
            "Additional Resume Skills": ", ".join(c.get("Additional Resume Skills", [])),
            "Sections": sections_str,
            "Suggestions": suggestions_str,
            "Semantic Method": c.get("Semantic Method", ""),
            "Resume Word Count": c.get("Resume Word Count", 0)
        })
    fields = [
        "Candidate", "Compatibility Index", "Skill Coverage (%)", "Semantic Similarity (%)",
        "TF-IDF Similarity (%)", "Resume Skills", "Matched Skills", "Skills Not Detected",
        "Additional Resume Skills", "Sections", "Suggestions", "Semantic Method", "Resume Word Count"
    ]
    return generate_csv_response(rows, fields)
