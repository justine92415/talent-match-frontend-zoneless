import { CurrencyPipe, JsonPipe, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CourseDetailSectionTitle } from "@components/course-detail-section-title/course-detail-section-title";
import { Button } from "@components/button/button";
import { StarRating } from "@components/star-rating/star-rating";
import { ReviewCard } from "@components/review-card/review-card";
import { WeeklyCalendar } from "@components/weekly-calendar/weekly-calendar";
import { InputPlan } from "@components/form/input-plan/input-plan";
import { InputSelect } from "@components/form/input-select/input-select";

@Component({
  selector: 'tmf-course-detail',
  imports: [MatIconModule, NgClass, RouterLink, ReactiveFormsModule, CourseDetailSectionTitle, Button, StarRating, ReviewCard, WeeklyCalendar, InputPlan, JsonPipe, InputSelect],
  templateUrl: './course-detail.html',
  styles: `
  `
})
export default class CourseDetail {
  fb = inject(FormBuilder);

  activeSection = signal('sectionA');
  formGroup = this.fb.group({
    purchase_item_id: this.fb.control(''),
    category: this.fb.control('')
  });

  navigateToTeacherDetail(){}
  addFavorite(){}
  copyToClipboard(){}
  openAllReviews(){}
  openTeacherDetailPage(){}
  addToCart(){}
  openSurvey(){}
}
