from app.services.qa_rules import evaluate

RULES = {
    "banned_phrases": [
        {"name": "no-guarantees", "phrase": "guaranteed returns", "weight": 2},
    ],
    "required_disclosures": [
        {"name": "recording", "phrase": "this call may be recorded", "weight": 2},
    ],
}


def test_perfect_transcript():
    result = evaluate("Hi, this call may be recorded. How can I help?", RULES)
    assert result["score"] == 1.0
    assert result["passed"] is True


def test_banned_phrase_fails():
    result = evaluate("This call may be recorded. We offer guaranteed returns!", RULES)
    assert result["passed"] is False
    assert result["score"] == 0.5
    failed = [f for f in result["findings"] if not f["passed"]]
    assert failed[0]["type"] == "banned_phrase"


def test_missing_disclosure_fails():
    result = evaluate("Hello, how can I help you today?", RULES)
    assert result["passed"] is False
    types = {f["type"] for f in result["findings"] if not f["passed"]}
    assert types == {"required_disclosure"}


def test_empty_rules_pass():
    assert evaluate("anything", {})["score"] == 1.0
