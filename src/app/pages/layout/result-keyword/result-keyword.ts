import { Component, signal } from '@angular/core';
import Pagination from '@components/pagination/pagination';
import { CourseCard } from '@components/course-card/course-card';
import { TmfIconEnum } from '@share/icon.enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tmf-result-keyword',
  imports: [MatIconModule, Pagination, CourseCard],
  templateUrl: './result-keyword.html',
  styles: ``,
})
export default class ResultKeyword {
  // 分頁相關 (使用 signals)
  currentPage = signal(1);
  totalResults = signal(120);
  itemsPerPage = signal(12);

  get TmfIcon() {
    return TmfIconEnum;
  }

  // 頁碼變更處理
  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}
