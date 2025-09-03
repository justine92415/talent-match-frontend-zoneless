import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface PaginationConfig {
  currentPage: number;
  totalResults: number;
  itemsPerPage: number;
}

@Component({
  selector: 'tmf-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './pagination.html'
})
export default class Pagination {
  // 輸入信號
  currentPage = input.required<number>();
  totalResults = input.required<number>();
  itemsPerPage = input.required<number>();

  // 輸出事件
  pageChange = output<number>();

  // 計算總頁數
  totalPages = computed(() => {
    return Math.ceil(this.totalResults() / this.itemsPerPage());
  });

  // 計算可見的頁碼
  visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages();
    const current = this.currentPage();

    if (totalPages <= 7) {
      // 如果總頁數 <= 7，顯示所有頁碼
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 否則顯示省略形式
      pages.push(1);
      
      if (current > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (current < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  });

  // 分頁導航方法
  goToFirstPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(1);
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  goToLastPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.totalPages());
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
