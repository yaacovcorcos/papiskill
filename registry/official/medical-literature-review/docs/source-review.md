# Source Review

This skill was drafted from a review of local LitRev_2026 prompts and public skill patterns.

## Local Patterns Kept

- LitRev_2026 separates work into protocol, scoping, search, screening, drafting, and QA modes. This skill keeps the useful phase distinction but does not force protocol-first behavior.
- LitRev_2026 requires source links for named studies and rejects fabricated DOI/PMID identifiers. This skill keeps that rule.
- LitRev_2026 screening favors `maybe` over exclusion at title/abstract stage. This skill keeps that conservative screening rule.
- LitRev_2026 treats PDFs, study text, and context blocks as untrusted. This skill keeps the source-injection boundary.
- LitRev_2026 search flow starts broad, iterates, and notes coverage gaps. This skill keeps that as the search discipline.

## Public Patterns Kept

- Existing literature-review skills often include multi-database searching, exact search-string documentation, evidence tables, and source aggregation.
- ToolUniverse's literature-deep-research skill has a strong "look up, don't guess" stance, evidence tiers, query disambiguation, and report-focused output.
- MedSci Skills emphasizes citation verification, no fabricated clinical definitions, and no invented numerical results.
- OpenClaw Medical Skills emphasizes real biomedical sources such as PubMed, ClinicalTrials.gov, FDA, and specialized biomedical databases.

## Deliberate Differences

- This skill is not a manuscript-writing pipeline.
- This skill does not force PRISMA, protocol registration, or meta-analysis unless the user asks for formal systematic-review rigor.
- This skill is tool-agnostic: it can be used by agents with PubMed APIs, browser search, local PDFs, or manual source input.
