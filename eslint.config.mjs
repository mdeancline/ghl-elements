// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig(
    globalIgnores([
        'dist/**',
        'temp/**',
        'etc/**',
        'node_modules/**',
        '**/*.d.ts',
    ]),
    {
        files: ['src/**/*.ts'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            tseslint.configs.stylistic,
        ],
        plugins: {
            '@stylistic': stylistic,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/class-methods-use-this': ['warn', {
                ignoreClassesThatImplementAnInterface: 'public-fields',
            }],
            '@typescript-eslint/no-extraneous-class': 'warn',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/unbound-method': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            'eqeqeq': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            '@stylistic/new-parens': 'error',
            'spaced-comment': [
                'error',
                'always',
                {
                    markers: [
                        '!',
                        '?',
                        '*',
                        '//',
                        '#region',
                        '#endregion'
                    ],
                    exceptions: ['-', '+']
                }
            ],
        },
    },
    {
        files: ['*.mjs', '*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    },
);