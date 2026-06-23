import { readFile, readdir, mkdir, copyFile } from 'fs/promises';
import { join, parse } from 'path';
import { execSync } from 'child_process';
import esbuild from 'esbuild';
import chalk from 'chalk';

// Read package.json
const pkg = JSON.parse(await readFile('package.json', 'utf-8'));

// Read tsconfig.json
let tsconfig;
try {
    tsconfig = JSON.parse(await readFile('tsconfig.json', 'utf-8'));
} catch {
    console.error('Error: tsconfig.json not found');
    process.exit(1);
}

const compilerOptions = tsconfig.compilerOptions || {};

if (!compilerOptions.target) {
    console.error('Error: tsconfig.json missing "target" in compilerOptions');
    process.exit(1);
}

const buildTarget = compilerOptions.target.toLowerCase();

const libs = compilerOptions.lib || [];
const buildPlatform = libs.some(lib => lib.toLowerCase().includes('dom')) ? 'browser' : 'node';

// Resolve entry point from package.json "main"
const mainEntry = pkg.main
    ?.replace('./dist/', 'src/')
    .replace(/\.js$/, '.ts');

if (!mainEntry) {
    console.error('Error: No "main" field found in package.json');
    process.exit(1);
}

// External packages — never bundle peer dependencies
const external = Object.keys(pkg.peerDependencies ?? {});

console.log('Linting...');
try {
    execSync('npx eslint .', { stdio: 'inherit' });
} catch {
    process.exit(1);
}

console.log('Type checking...');
try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
} catch {
    process.exit(1);
}

console.log('Building JS...');
await mkdir('dist', { recursive: true });

const { name } = parse(mainEntry);

await esbuild.build({
    entryPoints: [mainEntry],
    bundle: true,
    outfile: `dist/${name}.js`,
    format: 'esm',
    platform: buildPlatform,
    target: buildTarget,
    minify: true,
    treeShaking: true,
    keepNames: true,
    external,
});

console.log('Generating type declarations...');
try {
    execSync('npx tsc --project tsconfig.json', { stdio: 'inherit' });
} catch {
    process.exit(1);
}

console.log('Rolling up public API surface...');
try {
    execSync('npx api-extractor run --local --verbose', { stdio: 'inherit' });
} catch {
    process.exit(1);
}

// Copy non-TypeScript files preserving directory structure
async function copyNonTsFiles(srcDir, destDir) {
    const entries = await readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(srcDir, entry.name);
        const destPath = join(destDir, entry.name);

        if (entry.isDirectory()) {
            await mkdir(destPath, { recursive: true });
            await copyNonTsFiles(srcPath, destPath);
        } else if (!entry.name.endsWith('.ts')) {
            await copyFile(srcPath, destPath);
        }
    }
}

await copyNonTsFiles('src', 'dist');

const distFiles = await readdir('dist', { recursive: true });
const jsFiles = distFiles.filter(f => f.endsWith('.js')).length;
const dtsFiles = distFiles.filter(f => f.endsWith('.d.ts')).length;

console.log(chalk.green(`Build complete: ${name}.js (${jsFiles} JS, ${dtsFiles} type declarations)`));
