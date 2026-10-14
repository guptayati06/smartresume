import json
import os

AUDIT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "audit_store.json")

def load_audit_data() -> dict:
    if os.path.exists(AUDIT_DB_PATH):
        try:
            with open(AUDIT_DB_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "evidence_decisions": {}, # key: f"{candidate}_{skill}_{alias}" -> { "decision": "supported", "notes": "" }
        "recommendation_decisions": {}, # key: f"{candidate}_{skill}" -> { "checked": "", "status": "" }
        "relevance_labels": {}, # candidate -> int (0..3)
        "layout_errors": [], # list of layout issues
    }

def save_audit_data(data: dict):
    os.makedirs(os.path.dirname(AUDIT_DB_PATH), exist_ok=True)
    with open(AUDIT_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def update_evidence_decision(candidate: str, skill: str, alias: str, decision: str, notes: str):
    data = load_audit_data()
    key = f"{candidate}::{skill}::{alias}"
    data["evidence_decisions"][key] = {
        "candidate": candidate,
        "skill": skill,
        "alias": alias,
        "decision": decision,
        "notes": notes
    }
    save_audit_data(data)
    return data["evidence_decisions"][key]

def update_recommendation_status(candidate: str, skill: str, checked: str, status: str):
    data = load_audit_data()
    key = f"{candidate}::{skill}"
    data["recommendation_decisions"][key] = {
        "candidate": candidate,
        "skill": skill,
        "checked": checked,
        "status": status
    }
    save_audit_data(data)
    return data["recommendation_decisions"][key]

def set_relevance_label(candidate: str, label: int):
    data = load_audit_data()
    data["relevance_labels"][candidate] = label
    save_audit_data(data)
    return data["relevance_labels"]

def save_all_relevance_labels(labels: dict):
    data = load_audit_data()
    data["relevance_labels"].update(labels)
    save_audit_data(data)
    return data["relevance_labels"]

def add_layout_error(entry: dict):
    data = load_audit_data()
    data["layout_errors"].append(entry)
    save_audit_data(data)
    return data["layout_errors"]
