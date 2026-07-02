import { execSync } from 'child_process';
import { existsSync } from 'fs';

if (existsSync('.git')) {
    execSync('npx simple-git-hooks', { stdio: 'inherit' });
}
