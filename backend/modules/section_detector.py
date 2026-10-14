import re

# Section alias mapping from SmartResume_Research_Experiments.ipynb (Cell 7)
SECTION_ALIASES = {
    "Education": ["education", "academic background", "qualifications"],
    "Experience": ["experience", "work experience", "professional experience", "internships"],
    "Projects": ["projects", "academic projects", "personal projects"],
    "Skills": ["skills", "technical skills", "core competencies"],
    "Certifications": ["certifications", "certificates", "licenses"],
    "Summary": ["summary", "profile", "objective", "professional summary"]
}

def detect_sections(text: str) -> dict[str, bool]:
    """
    Lightweight heuristic to detect key resume sections.
    Note: Returns boolean indicators; does not replace manual document review.
    """
    lower = text.lower()
    return {
        section: any(re.search(r"\b" + re.escape(alias) + r"\b", lower) for alias in aliases)
        for section, aliases in SECTION_ALIASES.items()
    }

def resume_improvement_suggestions(text: str, missing_skills: list[str], sections: dict[str, bool]) -> list[str]:
    """
    Generates rule-based, conditional improvement suggestions.
    Guarantees 'Not detected in extracted text' wording without claiming absence of candidate ability.
    """
    suggestions = []
    
    if not sections.get("Skills", False):
        suggestions.append("Add a clearly labelled Skills or Technical Skills section.")
    
    if not sections.get("Projects", False):
        suggestions.append("If relevant, add projects detailing your role, tools, and technical outcomes.")
        
    if not sections.get("Education", False):
        suggestions.append("Ensure your Education or academic qualifications section is prominently structured.")
        
    if not sections.get("Experience", False):
        suggestions.append("If applicable, include internships or relevant experience. Academic and project work can also be highlighted.")
        
    if not sections.get("Certifications", False):
        suggestions.append("If you hold relevant professional or coursework certifications, list them in a dedicated Certifications section.")
        
    if missing_skills:
        skills_str = ", ".join(missing_skills[:8]) + ("..." if len(missing_skills) > 8 else "")
        suggestions.append(
            f"Job requirements not detected in extracted text: {skills_str}. "
            "Add a skill only if you genuinely have it, ideally substantiated with evidence in a project or experience bullet."
        )
        
    # Check for strong action verbs
    action_verb_pattern = r"\b(developed|built|designed|implemented|analyzed|analysed|improved|automated|created|led|evaluated)\b"
    if not re.search(action_verb_pattern, text.lower()):
        suggestions.append("Describe contributions with active verbs such as developed, implemented, evaluated, or automated.")
        
    # Check for measurable metric outcomes
    metric_pattern = r"\b\d+%|\b\d+\s*(users|records|customers|projects|models|hours|days)\b"
    if not re.search(metric_pattern, text.lower()):
        suggestions.append("Where truthful, add measurable outcomes (e.g., records processed, latency reduced, or model F1-score).")
        
    if not suggestions:
        suggestions.append("Review overall readability, consistent typography, and alignment with the specific role requirements.")
        
    return suggestions
