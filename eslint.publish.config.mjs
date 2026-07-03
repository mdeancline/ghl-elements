// eslint.publish.config.mjs
// @ts-check
import { defineConfig } from 'eslint/config';
import baseConfig from './eslint.config.mjs';

export default defineConfig(
    baseConfig,
    {
        files: ['src/**/*.ts'],
        rules: {
            'no-warning-comments': ['error', {
                terms: ['todo', 'fixme', 'fixit', 'bug', 'hack', 'xxx'],
                location: 'anywhere',
            }],
        },
    },
);