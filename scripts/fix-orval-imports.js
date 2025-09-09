const fs = require('fs');
const path = require('path');

// 定義要替換的內容
const problematicImport = `import type { DeepNonNullable } from '@orval/core/src/utils/deep-non-nullable';`;

const replacementCode = `// import type { DeepNonNullable } from '@orval/core/src/utils/deep-non-nullable';

// 使用 TypeScript 內建的 NonNullable 型別
type DeepNonNullable<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
  ? _DeepNonNullableArray<T[number]>
  : T extends object
  ? _DeepNonNullableObject<T>
  : NonNullable<T>;

type _DeepNonNullableArray<T> = Array<DeepNonNullable<NonNullable<T>>>;

type _DeepNonNullableObject<T> = {
  [P in keyof T]-?: DeepNonNullable<NonNullable<T[P]>>;
};`;

// 要處理的檔案目錄
const apiDir = path.join(__dirname, '../src/app/api/generated');

// 處理目錄中的所有 TypeScript 檔案
function fixOrvalImports(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`目錄不存在: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 遞迴處理子目錄
      fixOrvalImports(filePath);
    } else if (path.extname(file) === '.ts') {
      // 處理 TypeScript 檔案
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes(problematicImport)) {
        console.log(`修正檔案: ${filePath}`);
        content = content.replace(problematicImport, replacementCode);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  });
}

console.log('開始修正 Orval 匯入問題...');
fixOrvalImports(apiDir);
console.log('修正完成！');