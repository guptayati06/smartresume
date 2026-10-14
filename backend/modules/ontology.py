import re
from collections import defaultdict

# Canonical skill ontology from SmartResume_Research_Experiments.ipynb (Cell 6)
SKILL_ONTOLOGY = {
    "python": (["python", "python programming"], "Programming"),
    "java": (["java"], "Programming"),
    "javascript": (["javascript", "js"], "Programming"),
    "c++": (["c++", "cpp"], "Programming"),
    "sql": (["sql", "structured query language"], "Data"),
    "excel": (["excel", "microsoft excel", "ms excel"], "Tools"),
    "microsoft word": (["microsoft word", "ms word"], "Tools"),
    "machine learning": (["machine learning", "ml", "statistical learning"], "AI/ML"),
    "deep learning": (["deep learning", "dl"], "AI/ML"),
    "natural language processing": (["natural language processing", "nlp"], "AI/ML"),
    "computer vision": (["computer vision"], "AI/ML"),
    "generative ai": (["generative ai", "gen ai", "genai"], "AI/ML"),
    "large language models": (["large language model", "large language models", "llm", "llms"], "AI/ML"),
    "pandas": (["pandas"], "Data"),
    "numpy": (["numpy"], "Data"),
    "scikit-learn": (["scikit-learn", "sklearn", "scikit learn"], "AI/ML"),
    "tensorflow": (["tensorflow"], "AI/ML"),
    "pytorch": (["pytorch"], "AI/ML"),
    "power bi": (["power bi", "powerbi"], "BI/Visualization"),
    "tableau": (["tableau"], "BI/Visualization"),
    "data visualization": (["data visualization", "data visualisation"], "BI/Visualization"),
    "statistics": (["statistics", "statistical analysis"], "Data"),
    "data analysis": (["data analysis", "data analytics", "analysing data", "analyzing data"], "Data"),
    "data science": (["data science"], "Data"),
    "data engineering": (["data engineering"], "Data Engineering"),
    "etl": (["etl", "extract transform load"], "Data Engineering"),
    "pyspark": (["pyspark"], "Data Engineering"),
    "apache spark": (["apache spark", "spark"], "Data Engineering"),
    "mysql": (["mysql"], "Database"),
    "postgresql": (["postgresql", "postgres"], "Database"),
    "mongodb": (["mongodb", "mongo db"], "Database"),
    "flask": (["flask"], "Web Development"),
    "fastapi": (["fastapi", "fast api"], "Web Development"),
    "streamlit": (["streamlit"], "Web Development"),
    "django": (["django"], "Web Development"),
    "rest api": (["rest api", "restful api", "rest apis"], "Web Development"),
    "git": (["git"], "Developer Tools"),
    "github": (["github"], "Developer Tools"),
    "docker": (["docker"], "DevOps/Cloud"),
    "kubernetes": (["kubernetes", "k8s"], "DevOps/Cloud"),
    "aws": (["aws", "amazon web services"], "DevOps/Cloud"),
    "azure": (["azure", "microsoft azure"], "DevOps/Cloud"),
    "google cloud": (["google cloud", "gcp", "google cloud platform"], "DevOps/Cloud"),
    "communication": (["communication", "written communication", "verbal communication"], "Soft Skills"),
    "teamwork": (["teamwork", "team work", "collaboration"], "Soft Skills"),
    "project management": (["project management", "project planning"], "Soft Skills"),
    "human resources": (["human resources"], "HR"),
    "hris": (["hris", "human resources information system", "human resource information system"], "HR"),
    "employee relations": (["employee relations"], "HR"),
    "recruitment": (["recruitment", "talent acquisition", "candidate sourcing"], "HR"),
    "training and development": (["training and development", "learning and development", "l&d"], "HR"),
    "employment law": (["employment law", "labor law", "labour law"], "HR"),
    "confidentiality": (["confidentiality", "confidential information"], "Professional Skills"),
}

def make_alias_pattern(alias: str):
    body = r"\s+".join(re.escape(part) for part in alias.strip().split())
    # Boundary logic prevents substring false positives (e.g., 'c' in 'action')
    return re.compile(r"(?<![a-z0-9])" + body + r"(?![a-z0-9])", re.IGNORECASE)

ALIAS_RULES = []
for canonical, (aliases, category) in SKILL_ONTOLOGY.items():
    for alias in aliases:
        ALIAS_RULES.append((canonical, alias, category, make_alias_pattern(alias)))
# Sort by descending length so more specific aliases match first
ALIAS_RULES.sort(key=lambda x: len(x[1]), reverse=True)
