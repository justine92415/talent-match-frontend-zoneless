import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Stepper, StepItem } from '../../../../components/stepper/stepper';
import { Table } from '../../../../components/table/table';
import { Button } from "@components/button/button";
import { CourseDetailSectionTitle } from "@components/course-detail-section-title/course-detail-section-title";
import { CourseCard, CourseCardData } from "@components/course-card/course-card";
import { Skeleton } from "@components/skeleton/skeleton";
import { CartService } from '@app/services/cart.service';
import { CartItemWithDetails } from '@app/api/generated/talentMatchAPI.schemas';

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
  imports: [MatIcon, CommonModule, Stepper, Table, Button, CourseDetailSectionTitle, CourseCard, Skeleton],
  templateUrl: './cart.html',
  styles: ``
})
export default class Cart {
  cartService = inject(CartService);
  // 步驟定義
  steps: StepItem[] = [
    { id: 1, label: '購物清單' },
    { id: 2, label: '訂單資訊' },
    { id: 3, label: '訂單完成' }
  ];

  // 當前步驟 (1: 購物清單, 2: 訂單資訊, 3: 訂單完成)
  currentStep = signal(1);

  // 購物車資源和資料
  cartResource = this.cartService.cartResource;
  cartItems = this.cartService.cartItems;
  totalItems = this.cartService.cartItemCount;
  totalPrice = this.cartService.totalAmount;

  // 選中的項目（用於結帳）
  selectedItems = signal<Set<number>>(new Set());

  // 操作狀態
  isUpdating = signal<Set<number>>(new Set());
  isRemoving = signal<Set<number>>(new Set());

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

  // 計算所有購物車項目是否被選中
  isAllSelected = computed(() => {
    const items = this.cartItems();
    const selected = this.selectedItems();
    return items.length > 0 && items.every(item => item.id && selected.has(item.id));
  });

  // 計算是否有部分項目被選中
  isSomeSelected = computed(() => {
    const items = this.cartItems();
    const selected = this.selectedItems();
    const selectedCount = items.filter(item => item.id && selected.has(item.id)).length;
    return selectedCount > 0 && selectedCount < items.length;
  });

  // 購物車項目加上選中狀態
  itemsWithSelection = computed(() => {
    const selected = this.selectedItems();
    const items = this.cartItems();

    return items.map(item => ({
      ...item,
      isSelected: item.id ? selected.has(item.id) : false
    }));
  });

  // 選中項目的總金額
  selectedTotalPrice = computed(() => {
    const selected = this.selectedItems();
    return this.cartItems()
      .filter(item => item.id && selected.has(item.id))
      .reduce((total, item) => {
        const price = item.price_option?.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
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
      const allIds = this.cartItems()
        .map(item => item.id)
        .filter(id => id !== undefined) as number[];
      this.selectedItems.set(new Set(allIds));
    }
  }

  // 切換單個項目選擇
  toggleSelectItem(item: CartItemWithDetails): void {
    if (!item.id) return;

    const currentSelection = new Set(this.selectedItems());
    if (currentSelection.has(item.id)) {
      currentSelection.delete(item.id);
    } else {
      currentSelection.add(item.id);
    }
    this.selectedItems.set(currentSelection);
  }

  // 更新購物車項目數量
  updateQuantity(itemId: number, newQuantity: number): void {
    if (newQuantity < 1) return;

    const updatingSet = new Set(this.isUpdating());
    updatingSet.add(itemId);
    this.isUpdating.set(updatingSet);

    this.cartService.updateQuantity(itemId, newQuantity).subscribe({
      next: () => {
        const updatingSet = new Set(this.isUpdating());
        updatingSet.delete(itemId);
        this.isUpdating.set(updatingSet);
      },
      error: (error) => {
        console.error('更新數量失敗:', error);
        const updatingSet = new Set(this.isUpdating());
        updatingSet.delete(itemId);
        this.isUpdating.set(updatingSet);
      }
    });
  }

  // 移除購物車項目
  removeItem(itemId: number): void {
    const removingSet = new Set(this.isRemoving());
    removingSet.add(itemId);
    this.isRemoving.set(removingSet);

    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        // 從選中項目中移除
        const currentSelection = new Set(this.selectedItems());
        currentSelection.delete(itemId);
        this.selectedItems.set(currentSelection);

        const removingSet = new Set(this.isRemoving());
        removingSet.delete(itemId);
        this.isRemoving.set(removingSet);
      },
      error: (error) => {
        console.error('移除項目失敗:', error);
        const removingSet = new Set(this.isRemoving());
        removingSet.delete(itemId);
        this.isRemoving.set(removingSet);
      }
    });
  }

  // 清空購物車
  clearCart(): void {
    if (confirm('確定要清空購物車嗎？')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.selectedItems.set(new Set());
        },
        error: (error) => {
          console.error('清空購物車失敗:', error);
        }
      });
    }
  }

  // 結帳（替代方案）
  checkout(): void {
    const selectedCount = this.selectedItems().size;
    if (selectedCount === 0) {
      alert('請選擇要結帳的課程');
      return;
    }

    const totalAmount = this.selectedTotalPrice();
    alert(`結帳功能開發中！\n選中 ${selectedCount} 個項目\n總金額：NT$ ${totalAmount.toLocaleString()}`);
  }
}
