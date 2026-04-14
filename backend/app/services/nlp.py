import re
from collections import Counter

try:
    import spacy
except Exception:  # pragma: no cover - fallback when spaCy is unavailable
    spacy = None


URGENCY_KEYWORDS = {
    "urgent",
    "immediately",
    "asap",
    "hazard",
    "hazardous",
    "sick",
    "smell",
    "stink",
    "rats",
    "flies",
    "not cleaned for days",
    "overflow",
}

STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "is",
    "are",
    "was",
    "were",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "this",
    "that",
    "it",
    "as",
    "at",
    "by",
    "from",
    "be",
    "been",
    "has",
    "have",
    "had",
    "there",
    "here",
}

_spacy_model = None


def _get_spacy_model():
    global _spacy_model
    if _spacy_model is not None:
        return _spacy_model

    if spacy is None:
        _spacy_model = None
        return None

    for model_name in ("en_core_web_sm", "en_core_web_md"):
        try:
            _spacy_model = spacy.load(model_name)
            return _spacy_model
        except Exception:
            continue

    _spacy_model = spacy.blank("en")
    return _spacy_model


def detect_urgency(text: str) -> str:
    lowered = text.lower()
    if any(keyword in lowered for keyword in URGENCY_KEYWORDS):
        return "urgent"
    return "normal"


def extract_keywords(text: str, limit: int = 8) -> list[str]:
    normalized = re.findall(r"[a-zA-Z][a-zA-Z-']+", text.lower())
    filtered = [word for word in normalized if word not in STOPWORDS and len(word) > 2]

    model = _get_spacy_model()
    if model is not None and getattr(model, "pipe_names", None):
        doc = model(text)
        lemmatized = []
        for token in doc:
            if token.is_stop or token.is_punct or token.like_num:
                continue
            lemma = token.lemma_.strip().lower()
            if lemma and lemma not in STOPWORDS and len(lemma) > 2:
                lemmatized.append(lemma)
        if lemmatized:
            filtered = lemmatized

    counts = Counter(filtered)
    return [word for word, _count in counts.most_common(limit)]

