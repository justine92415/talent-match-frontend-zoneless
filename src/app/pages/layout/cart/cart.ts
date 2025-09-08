import { Component, signal, computed } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Stepper, StepItem } from '../../../../components/stepper/stepper';
import { Table } from '../../../../components/table/table';
import { Button } from "@components/button/button";
import { CourseDetailSectionTitle } from "@components/course-detail-section-title/course-detail-section-title";
import { CourseCard, CourseCardData } from "@components/course-card/course-card";

// 定義課程項目介面
export interface CourseItem {
  id: string | number;
  image: string;
  title: string;
  type: string;
  price: number;
  tags: string[];
  selected?: boolean;
}

@Component({
  selector: 'tmf-cart',
  imports: [MatIcon, CommonModule, Stepper, Table, Button, CourseDetailSectionTitle, CourseCard],
  templateUrl: './cart.html',
  styles: ``
})
export default class Cart {
  // 步驟定義
  steps: StepItem[] = [
    { id: 1, label: '購物清單' },
    { id: 2, label: '訂單資訊' },
    { id: 3, label: '訂單完成' }
  ];

  // 當前步驟 (1: 購物清單, 2: 訂單資訊, 3: 訂單完成)
  currentStep = signal(3);

  // 課程清單資料
  courseData = signal<CourseItem[]>([
    {
      id: 1,
      image: 'assets/images/guitar-course.png',
      title: '從零開始學吉他：初學者入門指南',
      type: '單堂課程',
      price: 1200,
      tags: ['新手班', '音樂', '吉他'],
      selected: true
    },
    {
      id: 2,
      image: 'assets/images/reel_cooking_1.jpg',
      title: '饗宴廚藝：美食烹飪工作坊',
      type: '十堂課程',
      price: 12000,
      tags: ['高手班', '烹飪料理'],
      selected: false
    },
    {
      id: 3,
      image: 'assets/images/reel_art_1.jpg',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      type: '單堂課程',
      price: 1200,
      tags: ['大師班', '音樂', '鋼琴'],
      selected: false
    }
  ]);

  // 選中的項目
  selectedItems = signal<Set<string | number>>(new Set([1]));

  // 我的收藏課程資料
  favoriteCoursesData = signal<CourseCardData[]>([
    {
      id: 'fav-1',
      title: '從零開始學吉他：初學者入門指南',
      description: '想要學習彈奏吉他嗎？這門課程專為初學者而設，無論你是完全沒有音樂背景還是有些基礎但想要加強技巧，都適合參加。在這門課程中,你將從最基本的吉他知識開始,逐步學習如何正確握持吉他、彈奏基本和弦......',
      imageSrc: 'assets/images/guitar-course.png',
      level: '新手班',
      category: '音樂－吉他',
      price: 1200,
      teacher: {
        name: 'Eric Clapton',
        avatar: 'assets/images/guitar-course.png'
      },
      rating: {
        score: 5.0,
        count: 23
      }
    },
    {
      id: 'fav-2',
      title: '細針縫夢：手作裁縫入門',
      description: '無論您是對裁縫有濃厚興趣，還是想要學習一技之長，這門課程都將是您的理想選擇。在這個由專業裁縫師親自指導的課程中，您將從基礎開始，逐步學習裁剪、縫紉和製作各種服裝和布藝作品所需的技能和知識。',
      imageSrc: 'assets/images/reel_art_1.jpg',
      level: '新手班',
      category: '手工藝－裁縫',
      price: 770,
      teacher: {
        name: '王太郎',
        avatar: 'assets/images/reel_art_1.jpg'
      },
      rating: {
        score: 4.5,
        count: 12
      }
    },
    {
      id: 'fav-3',
      title: '饗宴廚藝：美食烹飪工作坊',
      description: '我是文文，你們的烹飪大師！非常榮幸能夠與你們分享我的烹飪熱情和廚藝技巧。從我學習烹飪的那一刻起，我就深深著迷於美食的世界,並一直在不斷地探索和創新。無論是烤、煮、炸還是蒸,每一.....',
      imageSrc: 'assets/images/reel_cooking_1.jpg',
      level: '高手班',
      category: '烹飪－西式',
      price: 1200,
      teacher: {
        name: '文文',
        avatar: 'assets/images/reel_cooking_1.jpg'
      },
      rating: {
        score: 4.0,
        count: 333
      }
    },
    {
      id: 'fav-4',
      title: '琴韻魔法：鋼琴彈奏交響指南',
      description: '我專業且有耐心，致力於幫助學生掌握鋼琴演奏技巧，同時注重培養他們的音樂感和表達能力。',
      imageSrc: 'assets/images/reel_finance.jpg',
      level: '大師班',
      category: '音樂－鋼琴',
      price: 600,
      teacher: {
        name: '齊齊cy',
        avatar: 'assets/images/reel_finance.jpg'
      },
      rating: {
        score: 4.5,
        count: 100
      }
    }
  ]);

  // Computed properties 替換模板方法調用
  isAllSelected = computed(() => {
    const data = this.courseData();
    return data.length > 0 && data.every(item => this.selectedItems().has(item.id));
  });

  isSomeSelected = computed(() => {
    const data = this.courseData();
    const selectedCount = data.filter(item => this.selectedItems().has(item.id)).length;
    return selectedCount > 0 && selectedCount < data.length;
  });

  // 統一數據結構：課程資料 + 選中狀態
  itemsWithSelection = computed(() => {
    const selected = this.selectedItems();
    return this.courseData().map(item => ({
      ...item,
      isSelected: selected.has(item.id)
    }));
  });

  // 處理步驟變更
  onStepChange(step: number): void {
    this.currentStep.set(step);
  }

  // 切換全選
  toggleSelectAll(): void {
    const allSelected = this.isAllSelected();
    if (allSelected) {
      this.selectedItems.set(new Set());
    } else {
      const allIds = this.courseData().map(item => item.id);
      this.selectedItems.set(new Set(allIds));
    }
  }

  // 切換單個項目選擇
  toggleSelectItem(course: CourseItem): void {
    const currentSelection = new Set(this.selectedItems());
    if (currentSelection.has(course.id)) {
      currentSelection.delete(course.id);
    } else {
      currentSelection.add(course.id);
    }
    this.selectedItems.set(currentSelection);
  }


  // 刪除課程
  deleteCourse(course: CourseItem): void {
    const updatedData = this.courseData().filter(item => item.id !== course.id);
    this.courseData.set(updatedData);
    
    // 同時從選中項目中移除
    const currentSelection = new Set(this.selectedItems());
    currentSelection.delete(course.id);
    this.selectedItems.set(currentSelection);
  }

  // 加入收藏
  toggleFavorite(course: CourseItem): void {
    console.log('Toggle favorite for:', course.title);
    // 實作收藏功能
  }
}
