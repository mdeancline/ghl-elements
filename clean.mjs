import chalk from 'chalk';
import { rm } from 'fs/promises';

console.log('Cleaning...');

await rm('dist', { recursive: true, force: true });
console.log('Removed dist/');

console.log(chalk.green('Clean complete'));