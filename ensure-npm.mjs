import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const VERSION_FILE = '.npm-version-cache';
const current = execSync('npm --version').toString().trim();
const stored = existsSync(VERSION_FILE) ? readFileSync(VERSION_FILE, 'utf-8').trim() : null;

if (stored === current) {
    console.log(`npm unchanged (${current}), skipping`);
    process.exit(0);
}

console.log(`npm version changed from ${stored ?? 'unknown'} to ${current}, checking for updates...`);

const latest = execSync('npm view npm dist-tags.latest').toString().trim();

if (current !== latest) {
    console.log(`Updating npm from ${current} to ${latest}...`);
    execSync('npm install -g npm@latest', { stdio: 'inherit' });
    execSync(`corepack use npm@${latest}`, { stdio: 'inherit' });
    writeFileSync(VERSION_FILE, latest);
    console.log('Done.');
} else {
    console.log(`npm is already at latest (${current}), updating corepack...`);
    execSync(`corepack use npm@${current}`, { stdio: 'inherit' });
    writeFileSync(VERSION_FILE, current);
    console.log('Done');
}