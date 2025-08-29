import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

export interface CourseCardData {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  level: string;
  category: string;
  price: number;
  teacher: {
    name: string;
    avatar: string;
  };
  rating: {
    score: number;
    count: number;
  };
}

@Component({
  selector: 'tmf-course-card',
  imports: [MatIcon],
  templateUrl: './course-card.html',
  styles: ``
})
export class CourseCard {
  @Input() course!: CourseCardData;

  // Math object for template use
  Math = Math;

  get TmfIcon() {
    return TmfIconEnum;
  }
}
