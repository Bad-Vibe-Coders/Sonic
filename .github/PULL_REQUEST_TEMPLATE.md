## Summary

<!-- What does this PR do and why? -->

## Checklist

- [ ] Tests added or updated for the behavior changed
- [ ] Relevant `docs/` Master Document updated (if this PR touches a documented control)
- [ ] Touches a security-sensitive or AI-governance path (`app/core/security.py`, `app/core/tenant_resolution.py`,
      `app/services/llm.py`, `app/pipeline/`, `app/prompts/`) — if yes, CODEOWNERS review requested and
      `docs/03-ARCHITECTURE/15-Security-Architecture-Assessment.md` or
      `docs/03-ARCHITECTURE/16-AI-Architecture-Governance.md` reviewed for impact
- [ ] If this PR changes a prompt template in `app/prompts/`, the prompt's version hash was also bumped
      (CI enforces this — see Master Document 16, P7-01 §4)
- [ ] Lint, build, and secret-scan CI checks pass
- [ ] No new hardcoded secrets or credentials introduced

## Related ticket

<!-- SON-XXX -->
