import { Component } from '@angular/core';
import { Skeleton } from '@components/skeleton/skeleton';

@Component({
  selector: 'tmf-info-view-skeleton',
  imports: [Skeleton],
  template: `
    <div class="space-y-8">
      <!-- Profile Avatar Section Skeleton -->
      <div class="flex flex-col items-center mb-8">
        <tmf-skeleton 
          width="128px" 
          height="128px" 
          [class]="'rounded-full'"
        ></tmf-skeleton>
      </div>

      <!-- Personal Information Cards Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Nickname Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              width="40px" 
              height="40px" 
              class="rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton width="60px" height="12px" class="mb-2"></tmf-skeleton>
              <tmf-skeleton width="100px" height="16px"></tmf-skeleton>
            </div>
          </div>

          <!-- Real Name Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              width="40px" 
              height="40px" 
              class="rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton width="80px" height="12px" class="mb-2"></tmf-skeleton>
              <tmf-skeleton width="120px" height="16px"></tmf-skeleton>
            </div>
          </div>

          <!-- Email Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              width="40px" 
              height="40px" 
              class="rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton width="40px" height="12px" class="mb-2"></tmf-skeleton>
              <tmf-skeleton width="200px" height="16px"></tmf-skeleton>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Birthday Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              width="40px" 
              height="40px" 
              class="rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton width="40px" height="12px" class="mb-2"></tmf-skeleton>
              <tmf-skeleton width="110px" height="16px"></tmf-skeleton>
            </div>
          </div>

          <!-- Phone Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              width="40px" 
              height="40px" 
              class="rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton width="80px" height="12px" class="mb-2"></tmf-skeleton>
              <tmf-skeleton width="140px" height="16px"></tmf-skeleton>
            </div>
          </div>

          <!-- Join Date Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              width="40px" 
              height="40px" 
              class="rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton width="70px" height="12px" class="mb-2"></tmf-skeleton>
              <tmf-skeleton width="130px" height="16px"></tmf-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InfoViewSkeleton {}