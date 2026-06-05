---
name: gcloud-run-deploy
description: Deploy the current application to Google Cloud Run in GCP project davidstanke-dash-2026. Use when asked to deploy the application, codebase, or container to Cloud Run, GCP, or Google Cloud.
---

# GCP Cloud Run Deploy Skill

Deploy the application to Google Cloud Run in project `davidstanke-dash-2026`.

## Overview

This skill automates building and deploying Node.js applications to Google Cloud Run. It reads any local `.env` file to set environment variables on the Cloud Run service, deploys a new revision, routes all traffic to that revision, and returns the live service URL.

## Workflow

To perform a deployment, execute the bundled deployment script. This script automatically handles project targeting, region configuration, `.env` parsing, service naming, and URL extraction.

### Step 1: Run the Deployment Script

Execute the `deploy.cjs` script located inside the skill's `scripts/` directory:

```bash
node <path-to-skill>/scripts/deploy.cjs
```

The script will:
1. Detect and sanitize the service name from `package.json` (defaults to `cozy-clay-canines`).
2. Read and parse any `.env` file in the current working directory to set environment variables on the Cloud Run service.
3. Deploy a new revision to the `davidstanke-dash-2026` GCP project in the `us-central1` region using the `gcloud run deploy` command, routing 100% traffic to the new revision.
4. Retrieve and display the final service URL.

## Usage Guidelines

- Ensure you are logged into the GCP CLI (`gcloud auth login`) if required, and that the `gcloud` CLI tool is accessible.
- If subsequent deployments are needed, run the script again. It will automatically deploy a new revision to the same Cloud Run service and shift all traffic to it.
