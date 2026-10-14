import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .skill_extractor import extract_skills

# Global holder for sentence transformer
_EMBEDDING_MODEL = None
_SEMANTIC_MODEL_STATUS = "TF-IDF fallback"

def init_embedding_model():
    global _EMBEDDING_MODEL, _SEMANTIC_MODEL_STATUS
    if _EMBEDDING_MODEL is not None:
        return _EMBEDDING_MODEL, _SEMANTIC_MODEL_STATUS
    try:
        from sentence_transformers import SentenceTransformer
        _EMBEDDING_MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        _SEMANTIC_MODEL_STATUS = "Sentence Transformers: all-MiniLM-L6-v2"
    except Exception as e:
        _SEMANTIC_MODEL_STATUS = "TF-IDF fallback"
        _EMBEDDING_MODEL = None
    return _EMBEDDING_MODEL, _SEMANTIC_MODEL_STATUS


def tfidf_similarity(resume_text: str, job_text: str) -> float:
    """
    Computes TF-IDF cosine similarity between resume text and job text using unigram + bigram features.
    Matches notebook Cell 8.
    """
    if not resume_text.strip() or not job_text.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True)
        matrix = vectorizer.fit_transform([resume_text, job_text])
        sim = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
        return max(0.0, min(1.0, sim))
    except Exception:
        return 0.0


def compute_corpus_tfidf(resume_texts: list[str], job_text: str) -> list[float]:
    """
    Computes TF-IDF similarity over the joint corpus as done in Experiment 2 (Cell 12 / 16).
    """
    if not resume_texts or not job_text.strip():
        return [0.0] * len(resume_texts)
    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True, max_features=50000)
        matrix = vectorizer.fit_transform(resume_texts + [job_text])
        scores = cosine_similarity(matrix[-1], matrix[:-1]).ravel()
        return [float(max(0.0, min(1.0, s))) for s in scores]
    except Exception:
        return [tfidf_similarity(txt, job_text) for txt in resume_texts]


def semantic_similarity(resume_text: str, job_text: str, fallback_score: float) -> tuple[float, str]:
    """
    Calculates semantic cosine similarity using sentence-transformers (all-MiniLM-L6-v2)
    or falls back to TF-IDF score. Matches notebook Cell 10.
    """
    model, status = init_embedding_model()
    if model is None:
        return fallback_score, status
    try:
        embeddings = model.encode([resume_text, job_text], normalize_embeddings=True)
        score = float(np.dot(embeddings[0], embeddings[1]))
        return max(0.0, min(1.0, score)), status
    except Exception:
        return fallback_score, "TF-IDF fallback"


def compute_corpus_embeddings(resume_texts: list[str], job_text: str) -> tuple[list[float], str]:
    """
    Encodes multiple resume texts and job description for Experiment 2.
    """
    model, status = init_embedding_model()
    if model is None:
        return [np.nan] * len(resume_texts), status
    try:
        all_texts = resume_texts + [job_text]
        embeddings = model.encode(all_texts, normalize_embeddings=True)
        scores = np.dot(embeddings[:-1], embeddings[-1])
        return [float(max(0.0, min(1.0, s))) for s in scores], status
    except Exception:
        return [np.nan] * len(resume_texts), "TF-IDF fallback"


def calculate_compatibility(coverage: float, semantic_sim: float, skill_weight: float = 0.65, semantic_weight: float = 0.35) -> float:
    """
    Calculates transparent composite compatibility index:
    Index = 100 * (W_skill * coverage + W_semantic * semantic)
    """
    raw = (skill_weight * coverage) + (semantic_weight * semantic_sim)
    return round(float(raw * 100), 2)
