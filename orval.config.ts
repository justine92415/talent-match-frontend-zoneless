import { defineConfig } from 'orval';

export default defineConfig({
  talentMatch: {
    input: {
      target: 'http://localhost:8080/api-docs.json', // 您的 OpenAPI/Swagger 規格檔案路徑
    },
    output: {
      target: './src/app/api/generated',
      client: 'angular',
      mode: 'tags-split', // 根據 OpenAPI tags 自動分組
      override: {
        angular: {
          provideIn: 'root',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: [
        'prettier --write',
        // 在產生檔案後執行自訂腳本來修正匯入問題
        'node ./scripts/fix-orval-imports.js',
      ],
    },
  },
});