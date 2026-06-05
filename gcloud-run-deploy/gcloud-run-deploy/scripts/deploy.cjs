#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

function log(msg) {
  console.log(`[Deploy] ${msg}`);
}

function error(msg) {
  console.error(`[Deploy Error] ${msg}`);
  process.exit(1);
}

// 1. Determine service name from package.json
let serviceName = 'cozy-clay-canines';
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.name) {
      serviceName = pkg.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
    }
  } catch (e) {
    log(`Warning: Failed to parse package.json, using default service name '${serviceName}'`);
  }
}

log(`Service name determined as: ${serviceName}`);

// 2. Parse .env file
const envPath = path.join(process.cwd(), '.env');
let envVars = {};
if (fs.existsSync(envPath)) {
  log(`Found .env file at ${envPath}. Parsing environment variables...`);
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        if (key.toUpperCase() === 'PORT') continue; // Cloud Run reserves and sets PORT automatically
        let val = trimmed.substring(eqIdx + 1).trim();
        // Strip outer quotes if any
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        envVars[key] = val;
      }
    }
    log(`Parsed ${Object.keys(envVars).length} environment variables.`);
  } catch (e) {
    error(`Failed to read or parse .env file: ${e.message}`);
  }
} else {
  log(`No .env file found at ${envPath}. Continuing deployment without setting additional environment variables.`);
}

// 3. Build and deploy to Cloud Run
const project = 'davidstanke-dash-2026';
const region = 'us-central1';

log(`Deploying to Google Cloud Run (Project: ${project}, Region: ${region})...`);

const args = [
  'run',
  'deploy',
  serviceName,
  `--project=${project}`,
  '--source=.',
  `--region=${region}`,
  '--allow-unauthenticated'
];

// Add environment variables if present
const envKeys = Object.keys(envVars);
if (envKeys.length > 0) {
  const envStr = envKeys.map(k => `${k}=${envVars[k]}`).join(',');
  args.push(`--set-env-vars=${envStr}`);
}

log(`Running command: gcloud ${args.join(' ')}`);

// Using spawnSync directly with inherited stdio so progress and prompt are visible
const deployResult = spawnSync('gcloud', args, { stdio: 'inherit' });

if (deployResult.status !== 0) {
  error(`gcloud run deploy failed with exit status ${deployResult.status}`);
}

log('Deployment successful! Fetching service URL...');

// 4. Retrieve service URL
try {
  const urlCmd = `gcloud run services describe ${serviceName} --project=${project} --region=${region} --format="value(status.url)"`;
  const url = execSync(urlCmd, { encoding: 'utf8' }).trim();
  console.log(`\n==================================================`);
  console.log(`SUCCESS: Service is live!`);
  console.log(`URL: ${url}`);
  console.log(`==================================================\n`);
} catch (e) {
  error(`Failed to retrieve service URL: ${e.message}`);
}
