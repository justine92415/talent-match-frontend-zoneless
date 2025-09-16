import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Pagination from '../../../../../components/pagination/pagination';
import { Button } from "@components/button/button";
import { Table } from '../../../../../components/table/table';

@Component({
  selector: 'tmf-courses',
  imports: [CommonModule, Pagination, Button, Table],
  templateUrl: './courses.html',
  styles: ``
})
export default class Courses {
  // 分頁相關的信號
  currentPage = signal(1);
  totalResults = signal(3); // 目前有 3 個課程項目
  itemsPerPage = signal(10); // 每頁顯示 10 個項目

  // 課程資料
  courses = signal([
    {
      id: 1,
      name: '從零開始學吉他：初學者入門指南',
      image: '/assets/images/guitar-course.png',
      tags: ['新手班', '音樂', '吉他'],
      isPublished: true,
      actions: ['view']
    },
    {
      id: 2,
      name: '築夢廚藝：美食烹飪工作坊',
      image: '/assets/images/reel_cooking_1.jpg',
      tags: ['高手班', '烹飪料理'],
      isPublished: false,
      actions: ['view', 'edit', 'delete']
    },
    {
      id: 3,
      name: '琴韻魔法：鋼琴彈奏交響指南',
      image: null,
      tags: ['大師班', '音樂', '鋼琴'],
      isPublished: false,
      actions: ['view', 'edit', 'delete']
    }
  ]);

  // 處理分頁變更事件
  onPageChange(page: number): void {
    this.currentPage.set(page);
    // 這裡可以加入 API 呼叫來載入新的課程資料
    console.log('切換到頁面:', page);
  }
}
