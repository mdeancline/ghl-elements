// @ts-check
import { defineConfig } from 'eslint/config';
import baseConfig from './eslint.config.mjs';

export default defineConfig(
    baseConfig,
    {
        files: ['src/**/*.ts'],
        rules: {
            'no-warning-comments': ['error', {
                terms: ['bug', 'fixme', 'todo', 'xxx'],
                location: 'anywhere',
            }],
        },
    },
);