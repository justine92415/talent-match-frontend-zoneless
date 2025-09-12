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
          class="w-32 h-32 rounded-full"
        ></tmf-skeleton>
      </div>

      <!-- Personal Information Cards Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Nickname Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              class="w-10 h-10 rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton class="w-16 h-3 mb-2"></tmf-skeleton>
              <tmf-skeleton class="w-24 h-4"></tmf-skeleton>
            </div>
          </div>

          <!-- Real Name Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              class="w-10 h-10 rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton class="w-20 h-3 mb-2"></tmf-skeleton>
              <tmf-skeleton class="w-32 h-4"></tmf-skeleton>
            </div>
          </div>

          <!-- Email Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              class="w-10 h-10 rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton class="w-10 h-3 mb-2"></tmf-skeleton>
              <tmf-skeleton class="w-48 h-4"></tmf-skeleton>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Birthday Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              class="w-10 h-10 rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton class="w-10 h-3 mb-2"></tmf-skeleton>
              <tmf-skeleton class="w-28 h-4"></tmf-skeleton>
            </div>
          </div>

          <!-- Phone Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              class="w-10 h-10 rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton class="w-20 h-3 mb-2"></tmf-skeleton>
              <tmf-skeleton class="w-36 h-4"></tmf-skeleton>
            </div>
          </div>

          <!-- Join Date Card Skeleton -->
          <div class="flex items-center gap-4 p-4 bg-grey-f7 rounded-lg">
            <tmf-skeleton 
              class="w-10 h-10 rounded-full flex-shrink-0"
            ></tmf-skeleton>
            <div class="flex-1">
              <tmf-skeleton class="w-16 h-3 mb-2"></tmf-skeleton>
              <tmf-skeleton class="w-32 h-4"></tmf-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InfoViewSkeleton {}