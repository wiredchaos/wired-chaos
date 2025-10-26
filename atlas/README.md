# Atlas Workspace Assets

This directory contains curated assets for running the WIRED CHAOS worldbuilding and
ARG pipelines inside OpenAI Atlas.

## Structure

- `red-light-district/` – Atlas-ready bundle for the motherboard city's Red Light District hub.
  - `renders/octane/` – Prompt packs used to generate cinematic stills.
  - `metadata/grok/` – Structured metadata payloads (GROK schema compliant).
  - `api/cipher/` – REST scaffolds and request collections for the cipher core.
  - `schema/mongo/` – Data model references for the Lore Registry integrations.

Each bundle ships with a primary `.atx` notebook that links all resources together.
