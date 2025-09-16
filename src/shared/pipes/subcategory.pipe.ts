import { Pipe, PipeTransform } from '@angular/core';

// 次分類映射表 - 根據 API 資料
const SUBCATEGORY_MAP: { [key: number]: string } = {
  // 樂器演奏 (id: 1)
  1: '鋼琴',
  2: '電吉他',
  3: '爵士鼓',
  4: '薩克斯風',
  5: '貝斯',
  6: '烏克麗麗',
  
  // 藝術創作 (id: 2)
  7: '水彩畫',
  8: '油畫',
  9: '素描',
  10: '版畫',
  11: '漫畫',
  12: '插畫',
  13: '數位繪畫',
  14: '塗鴉',
  15: '水墨畫',
  16: '粉彩畫',
  
  // 舞蹈表演 (id: 3)
  17: '芭蕾舞',
  18: '現代舞',
  19: '爵士舞',
  20: '嘻哈舞',
  21: '探戈',
  22: '莎莎舞',
  23: '街舞',
  24: '踢踏舞',
  25: '肚皮舞',
  26: '拉丁舞',
  
  // 手作工藝 (id: 4)
  27: '編織',
  28: '刺繡',
  29: '陶藝',
  30: '木工',
  31: '紙藝',
  32: '蠟藝',
  33: '金工',
  
  // 程式設計 (id: 5)
  34: '前端開發',
  35: '後端開發',
  36: 'Mobile App',
  37: '資料科學',
  38: '人工智慧',
  39: 'DevOps',
  
  // 語言學習 (id: 6)
  40: '英文',
  41: '日文',
  42: '韓文',
  43: '中文',
  44: '德文',
  45: '法文',
  46: '西班牙文',
  
  // 運動健身 (id: 7)
  47: '瑜伽',
  48: '重訓',
  49: '有氧運動',
  50: '游泳',
  51: '跑步',
  52: '格鬥運動',
  
  // 學術輔導 (id: 8)
  53: '數學',
  54: '物理',
  55: '化學',
  56: '生物',
  57: '歷史',
  58: '地理',
  59: '國文',
  
  // 商業技能 (id: 9)
  60: '行銷企劃',
  61: '財務管理',
  62: '專案管理',
  63: '簡報技巧',
  64: '銷售技巧',
  65: '創業諮詢'
};

@Pipe({
  name: 'subcategory',
  standalone: true,
  pure: true
})
export class SubcategoryPipe implements PipeTransform {
  transform(categoryIds: number[]): string {
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return '';
    }
    
    const categoryNames = categoryIds
      .map(id => SUBCATEGORY_MAP[id])
      .filter(name => name) // 過濾掉未定義的名稱
      .join(', ');
      
    return categoryNames;
  }
}