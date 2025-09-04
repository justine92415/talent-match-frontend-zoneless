import { Component, signal, computed } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from '@angular/common';
import { CourseCard, CourseCardData } from '@components/course-card/course-card';
import Pagination from '@components/pagination/pagination';
import { TmfIconEnum } from '@share/icon.enum';

// 定義分類介面
interface Category {
  id: string;
  name: string;
  icon: string;
}

interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

interface FilterOption {
  id: string;
  name: string;
}

@Component({
  selector: 'tmf-result-tag',
  imports: [MatIconModule, CommonModule, CourseCard, Pagination],
  templateUrl: './result-tag.html',
  styles: ``
})
export default class ResultTag {
  selectedMainCategoryId = 'art'; // 預設選中藝術創作
  selectedSubCategoryId = 'all-art'; // 預設選中所有藝術
  selectedFilterId = 'latest'; // 預設篩選：最新課程

  // 分頁相關 (使用 signals)
  currentPage = signal(1);
  totalResults = signal(120);
  itemsPerPage = signal(12);

  // 主要分類資料
  mainCategories: Category[] = [
    { id: 'all', name: '探索全部', icon: 'key' },
    { id: 'cooking', name: '烹飪料理', icon: 'restaurant' },
    { id: 'finance', name: '理財投資', icon: 'savings' },
    { id: 'art', name: '藝術創作', icon: 'draw' },
    { id: 'craft', name: '手作工藝', icon: 'build' },
    { id: 'dance', name: '舞蹈表演', icon: 'directions_run' }
  ];

  // 子分類資料（藝術創作相關）
  subCategories: SubCategory[] = [
    { id: 'all-art', name: '所有藝術', parentId: 'art' },
    { id: 'digital-art', name: '電腦繪圖', parentId: 'art' },
    { id: '3d-model', name: '3D 模型', parentId: 'art' },
    { id: 'pencil-sketch', name: '鉛筆素描', parentId: 'art' },
    { id: 'web-design', name: '網頁設計', parentId: 'art' },
    { id: 'animation', name: '動畫特效', parentId: 'art' },
    { id: 'color-theory', name: '色彩學', parentId: 'art' },
    { id: 'graphic-design', name: '平面設計', parentId: 'art' },
    { id: 'watercolor', name: '水彩插畫', parentId: 'art' }
  ];

  // 模擬課程資料
  courses: CourseCardData[] = [
    {
      id: '1',
      title: '細針縫夢：手作裁縫入門',
      description: '無論您是對裁縫有濃厚興趣，還是想要學習一技之長，這門課程都將是您的理想選擇。在這個由專業裁縫師親自指導的課程中，您將從基礎開始，逐步學習裁剪、縫紉和製作各種服裝和布藝作品所需的技能和知識。',
      imageSrc: 'assets/images/reel_art_1.jpg',
      level: '新手班',
      category: '手工藝－裁縫',
      price: 770,
      teacher: {
        name: '王太郎',
        avatar: 'assets/images/teacher-avatar-1.jpg'
      },
      rating: {
        score: 4.5,
        count: 12
      }
    },
    {
      id: '2',
      title: '饗宴廚藝：美食烹飪工作坊',
      description: '我是文文，你們的烹飪大師！非常榮幸能夠與你們分享我的烹飪熱情和廚藝技巧。從我學習烹飪的那一刻起，我就深深著迷於美食的世界,並一直在不斷地探索和創新。無論是烤、煮、炸還是蒸,每一.....',
      imageSrc: 'assets/images/reel_cooking_1.jpg',
      level: '高手班',
      category: '烹飪－西式',
      price: 1200,
      teacher: {
        name: '文文',
        avatar: 'assets/images/teacher-avatar-2.jpg'
      },
      rating: {
        score: 4.0,
        count: 333
      }
    },
    {
      id: '3',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      description: '我專業且有耐心，致力於幫助學生掌握鋼琴演奏技巧，同時注重培養他們的音樂感和表達能力。',
      imageSrc: 'assets/images/reel_cooking_2.jpg',
      level: '大師班',
      category: '音樂－鋼琴',
      price: 600,
      teacher: {
        name: '齊齊cy',
        avatar: 'assets/images/teacher-avatar-3.jpg'
      },
      rating: {
        score: 4.5,
        count: 100
      }
    },
    {
      id: '4',
      title: '下班晚餐吃什麼？教你快出做出一道菜',
      description: '美味料理的速成指南，千萬別錯過\n教你如何先備料，以及做菜的順序。\n擺脫手忙腳亂的狀況！',
      imageSrc: 'assets/images/reel_cooking_3.jpg',
      level: '新手班',
      category: '烹飪－中式',
      price: 600,
      teacher: {
        name: '林雯',
        avatar: 'assets/images/teacher-avatar-4.jpg'
      },
      rating: {
        score: 4.5,
        count: 500
      }
    },
    {
      id: '5',
      title: '細針縫夢：手作裁縫入門',
      description: '無論您是對裁縫有濃厚興趣，還是想要學習一技之長，這門課程都將是您的理想選擇。',
      imageSrc: 'assets/images/reel_art_1.jpg',
      level: '新手班',
      category: '手工藝－裁縫',
      price: 770,
      teacher: {
        name: '王太郎',
        avatar: 'assets/images/teacher-avatar-1.jpg'
      },
      rating: {
        score: 4.5,
        count: 12
      }
    },
    {
      id: '6',
      title: '饗宴廚藝：美食烹飪工作坊',
      description: '我是文文，你們的烹飪大師！非常榮幸能夠與你們分享我的烹飪熱情和廚藝技巧。',
      imageSrc: 'assets/images/reel_cooking_1.jpg',
      level: '高手班',
      category: '烹飪－西式',
      price: 1200,
      teacher: {
        name: '文文',
        avatar: 'assets/images/teacher-avatar-2.jpg'
      },
      rating: {
        score: 4.0,
        count: 333
      }
    },
    {
      id: '7',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      description: '我專業且有耐心，致力於幫助學生掌握鋼琴演奏技巧。',
      imageSrc: 'assets/images/reel_cooking_2.jpg',
      level: '大師班',
      category: '音樂－鋼琴',
      price: 600,
      teacher: {
        name: '齊齊cy',
        avatar: 'assets/images/teacher-avatar-3.jpg'
      },
      rating: {
        score: 4.5,
        count: 100
      }
    },
    {
      id: '8',
      title: '下班晚餐吃什麼？教你快出做出一道菜',
      description: '美味料理的速成指南，千萬別錯過。教你如何先備料，以及做菜的順序。',
      imageSrc: 'assets/images/reel_cooking_3.jpg',
      level: '新手班',
      category: '烹飪－中式',
      price: 600,
      teacher: {
        name: '林雯',
        avatar: 'assets/images/teacher-avatar-4.jpg'
      },
      rating: {
        score: 4.5,
        count: 500
      }
    }
  ];

  // 計算總頁數 (使用 computed)
  totalPages = computed(() => {
    return Math.ceil(this.totalResults() / this.itemsPerPage());
  });

  // 獲取目前選中的分類名稱
  get selectedCategoryName(): string {
    const subCategory = this.subCategories.find(sub => sub.id === this.selectedSubCategoryId);
    return subCategory?.name || '所有藝術';
  }

  // TmfIcon getter for template
  get TmfIcon() {
    return TmfIconEnum;
  }

  // 頁碼變更處理
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  // 選擇主分類
  selectMainCategory(categoryId: string): void {
    this.selectedMainCategoryId = categoryId;
    this.updateSubCategories(categoryId);
    this.selectedSubCategoryId = this.getDefaultSubCategory(categoryId);
    this.currentPage.set(1); // 重置頁碼
  }

  // 選擇子分類
  selectSubCategory(subCategoryId: string): void {
    this.selectedSubCategoryId = subCategoryId;
    this.currentPage.set(1); // 重置頁碼
  }

  // 選擇篩選選項
  selectFilter(filterId: string): void {
    this.selectedFilterId = filterId;
    this.currentPage.set(1); // 重置頁碼
    // 這裡可以加入重新排序課程的邏輯
  }


  // 更新子分類（這裡先只處理藝術創作，其他分類可以後續擴展）
  private updateSubCategories(categoryId: string): void {
    if (categoryId === 'art') {
      this.subCategories = [
        { id: 'all-art', name: '所有藝術', parentId: 'art' },
        { id: 'digital-art', name: '電腦繪圖', parentId: 'art' },
        { id: '3d-model', name: '3D 模型', parentId: 'art' },
        { id: 'pencil-sketch', name: '鉛筆素描', parentId: 'art' },
        { id: 'web-design', name: '網頁設計', parentId: 'art' },
        { id: 'animation', name: '動畫特效', parentId: 'art' },
        { id: 'color-theory', name: '色彩學', parentId: 'art' },
        { id: 'graphic-design', name: '平面設計', parentId: 'art' },
        { id: 'watercolor', name: '水彩插畫', parentId: 'art' }
      ];
    } else {
      // 其他分類暫時顯示空數組，可以後續添加對應的子分類
      this.subCategories = [];
    }
  }

  // 獲取預設子分類
  private getDefaultSubCategory(categoryId: string): string {
    switch (categoryId) {
      case 'art':
        return 'all-art';
      default:
        return '';
    }
  }

  // TrackBy 函式以提升效能
  trackByCategory(index: number, category: Category): string {
    return category.id;
  }

  trackBySubCategory(index: number, subCategory: SubCategory): string {
    return subCategory.id;
  }

  trackByFilter(index: number, filter: FilterOption): string {
    return filter.id;
  }

  trackByCourse(index: number, course: CourseCardData): string {
    return course.id;
  }

  trackByPage(index: number, page: number | string): string {
    return page.toString();
  }
}
