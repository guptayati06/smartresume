import re
from collections import defaultdict
from .ontology import SKILL_ONTOLOGY, ALIAS_RULES

def extract_skill_evidence(text: str) -> dict[str, list[dict]]:
    """
    Scans text against ALIAS_RULES and returns all detected canonical skills
    with matched aliases, categories, and 280-char contextual evidence snippets.
    Matches notebook Cell 6 logic.
    """
    hits = defaultdict(list)
    for canonical, alias, category, pattern in ALIAS_RULES:
        for match in pattern.finditer(text):
            start, end = match.span()
            line_start = text.rfind("\n", 0, start) + 1
            line_end = text.find("\n", end)
            if line_end < 0:
                line_end = min(len(text), end + 120)
            
            snippet = re.sub(r"\s+", " ", text[line_start:line_end]).strip()
            if not snippet:
                snippet = text[max(0, start - 60):min(len(text), end + 60)].strip()
            
            item = {
                "canonical_skill": canonical,
                "matched_alias": match.group(0),
                "category": category,
                "snippet": snippet[:280]
            }
            if item not in hits[canonical]:
                hits[canonical].append(item)
    return dict(hits)


def extract_skills(text: str) -> list[str]:
    """Returns sorted list of detected canonical skill names."""
    return sorted(extract_skill_evidence(text).keys())


def skills_by_category(text: str) -> dict[str, list[str]]:
    """Returns dictionary mapping category -> sorted list of canonical skills."""
    grouped = defaultdict(list)
    for skill, evidence in extract_skill_evidence(text).items():
        grouped[evidence[0]["category"]].append(skill)
    return {category: sorted(skills) for category, skills in sorted(grouped.items())}


def exact_canonical_match(text: str) -> set[str]:
    """
    Experiment 1 - Method A: Matches only exact canonical skill names (no aliases).
    Boundary rules avoid partial string matches.
    """
    text_lower = (text or "").lower()
    found = set()
    for canonical in SKILL_ONTOLOGY:
        pat = re.compile(r"(?<![a-z0-9+#])" + re.escape(canonical.lower()) + r"(?![a-z0-9+#])")
        if pat.search(text_lower):
            found.add(canonical)
    return found


def alias_canonical_match(text: str) -> set[str]:
    """
    Experiment 1 - Method B: Alias-aware matching into canonical skills.
    """
    return set(extract_skills(text))
