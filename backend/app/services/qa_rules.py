"""QA / compliance rules engine.

Rules are defined in YAML (rules/qa_rules.yaml):
  - banned_phrases: fail if any phrase appears in the transcript
  - required_disclosures: fail if a required phrase is missing
Each rule carries a weight; the score is the weighted fraction of passed rules.
"""
import re
from pathlib import Path

import yaml


def load_rules(path: str | Path) -> dict:
    return yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}


def evaluate(transcript: str, rules: dict) -> dict:
    text = transcript.lower()
    findings: list[dict] = []
    total_weight = 0.0
    passed_weight = 0.0

    for rule in rules.get("banned_phrases", []):
        weight = float(rule.get("weight", 1))
        total_weight += weight
        hit = re.search(re.escape(rule["phrase"].lower()), text)
        if hit:
            findings.append({"rule": rule["name"], "type": "banned_phrase", "passed": False,
                             "detail": f"found banned phrase: {rule['phrase']!r}"})
        else:
            passed_weight += weight
            findings.append({"rule": rule["name"], "type": "banned_phrase", "passed": True})

    for rule in rules.get("required_disclosures", []):
        weight = float(rule.get("weight", 1))
        total_weight += weight
        if re.search(re.escape(rule["phrase"].lower()), text):
            passed_weight += weight
            findings.append({"rule": rule["name"], "type": "required_disclosure", "passed": True})
        else:
            findings.append({"rule": rule["name"], "type": "required_disclosure", "passed": False,
                             "detail": f"missing required disclosure: {rule['phrase']!r}"})

    score = round(passed_weight / total_weight, 4) if total_weight else 1.0
    return {"score": score, "findings": findings, "passed": all(f["passed"] for f in findings)}
