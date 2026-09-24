import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      'src/features/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/data/**/*.ts',
      'src/lib/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/**', '**/app/**'],
              message:
                'Route files compose features. Move shared implementation or assets out of app before importing them here.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
    'blob-report/**',
  ]),
]);
