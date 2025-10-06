import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stepper, StepItem } from '../../../../components/stepper/stepper';
import { Table } from '../../../../components/table/table';
import { Button } from "@components/button/button";
import { CourseDetailSectionTitle } from "@components/course-detail-section-title/course-detail-section-title";
import { CourseCard, CourseCardData } from "@components/course-card/course-card";
import { Skeleton } from "@components/skeleton/skeleton";
import { CartService } from '@app/services/cart.service';
import { CartItemWithDetails, CreateOrderRequest, CreateOrderRequestPurchaseWay } from '@app/api/generated/talentMatchAPI.schemas';
import { PaymentService } from '@app/api/generated/payment/payment.service';
import { OrdersService } from '@app/api/generated/orders/orders.service';
import { HttpClient } from '@angular/common/http';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';

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
  imports: [MatIcon, CommonModule, ReactiveFormsModule, Stepper, Table, Button, CourseDetailSectionTitle, CourseCard, Skeleton, InputText, InputSelect],
  templateUrl: './cart.html',
  styles: ``
})
export default class Cart {
  cartService = inject(CartService);
  private paymentService = inject(PaymentService);
  private ordersService = inject(OrdersService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  // 步驟定義
  steps: StepItem[] = [
    { id: 1, label: '購物清單' },
    { id: 2, label: '訂單資訊' },
    { id: 3, label: '付款完成' }
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
  isCheckingOut = signal<boolean>(false);

  // 響應式表單
  orderForm: FormGroup = this.fb.group({
    buyer_name: ['', [Validators.required, Validators.maxLength(50)]],
    buyer_phone: ['', [Validators.required, Validators.pattern(/^09\d{8}$/)]],
    buyer_email: ['', [Validators.required, Validators.email]],
    purchase_way: [CreateOrderRequestPurchaseWay.credit_card, Validators.required]
  });

  // 付款方式選項
  paymentOptions: SelectOption[] = [
    { value: CreateOrderRequestPurchaseWay.credit_card, label: '信用卡' },
    { value: CreateOrderRequestPurchaseWay.bank_transfer, label: '銀行轉帳' }
  ];

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

  // 選中的購物車項目
  selectedCartItems = computed(() => {
    const selected = this.selectedItems();
    return this.cartItems().filter(item => item.id && selected.has(item.id));
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

  // 第一步：前往訂單資訊頁面
  checkout(): void {
    const selectedCount = this.selectedItems().size;
    if (selectedCount === 0) {
      alert('請選擇要結帳的課程');
      return;
    }

    // 進入第二步驟
    this.currentStep.set(2);
  }

  // 第二步：提交訂單表單
  submitOrder(): void {
    // 標記所有欄位為已觸碰，以顯示驗證錯誤
    this.orderForm.markAllAsTouched();

    // 驗證表單
    if (this.orderForm.invalid) {
      return;
    }

    const selectedCount = this.selectedItems().size;
    const totalAmount = this.selectedTotalPrice();
    const selected = this.selectedItems();
    const selectedItems = this.cartItems().filter(item => item.id && selected.has(item.id));

    // 進入第三步驟（處理中）
    this.currentStep.set(3);

    // 建立訂單並進行付款
    this.processPayment(selectedItems, totalAmount);
  }

  // 取得表單欄位錯誤訊息
  getFieldError(fieldName: string): string | null {
    const field = this.orderForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        switch (fieldName) {
          case 'buyer_name': return '請輸入購買者姓名';
          case 'buyer_phone': return '請輸入手機號碼';
          case 'buyer_email': return '請輸入電子信箱';
          default: return '此欄位為必填';
        }
      }
      if (field.errors?.['maxlength']) {
        return '姓名不能超過50個字元';
      }
      if (field.errors?.['pattern']) {
        return '請輸入正確的手機號碼格式（09開頭的10位數字）';
      }
      if (field.errors?.['email']) {
        return '請輸入正確的電子信箱格式';
      }
    }
    return null;
  }

  // 檢查欄位是否有錯誤
  hasFieldError(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // 處理付款流程
  private processPayment(selectedItems: CartItemWithDetails[], totalAmount: number): void {
    this.isCheckingOut.set(true);

    // 先建立訂單
    this.createOrder(selectedItems, totalAmount);
  }

  // 建立訂單
  private createOrder(selectedItems: CartItemWithDetails[], totalAmount: number): void {

    // 檢查並取得有效的購物車項目ID
    const cartItemIds = selectedItems
      .map(item => item.id)
      .filter(id => id !== undefined && id !== null) as number[];


    if (cartItemIds.length === 0) {
      alert('沒有有效的購物車項目ID，無法建立訂單');
      this.isCheckingOut.set(false);
      return;
    }

    // 從響應式表單取得資料
    const formValue = this.orderForm.value;

    // 準備訂單請求資料
    const createOrderRequest: CreateOrderRequest = {
      cart_item_ids: cartItemIds,
      purchase_way: formValue.purchase_way,
      buyer_name: formValue.buyer_name.trim(),
      buyer_phone: formValue.buyer_phone.trim(),
      buyer_email: formValue.buyer_email.trim()
    };

    this.ordersService.postApiOrders(createOrderRequest).subscribe({
      next: (orderResponse) => {

        if (orderResponse.data?.order?.id) {
          // 使用真實的訂單ID進行付款
          this.processOrderPayment(orderResponse.data.order.id, totalAmount);
        } else {
          alert(`訂單建立失敗：無效的訂單資料\n回應狀態: ${orderResponse.status}\n回應訊息: ${orderResponse.message}\n訂單資料: ${JSON.stringify(orderResponse.data)}`);
          this.isCheckingOut.set(false);
        }
      },
      error: (error) => {

        let errorMessage = '建立訂單失敗，請稍後再試';
        if (error.error?.message) {
          errorMessage += `\n錯誤訊息: ${error.error.message}`;
        }
        if (error.error?.errors) {
          errorMessage += `\n詳細錯誤: ${JSON.stringify(error.error.errors)}`;
        }

        alert(errorMessage);
        this.isCheckingOut.set(false);
      }
    });
  }

  // 處理訂單付款
  private processOrderPayment(orderId: number, totalAmount: number): void {

    // 創建付款請求體，包含必要欄位
    const paymentRequest = {
      purchase_way: 'credit_card', // 付款方式
      amount: totalAmount     // 付款金額
    };

    // 直接使用 HttpClient 發送包含請求體的 POST 請求
    this.http.post<any>(`/api/orders/${orderId}/payment`, paymentRequest).subscribe({
      next: (response) => {
        if (response.data?.html_form) {
          // 使用綠界提供的 HTML 表單
          this.submitEcpayForm(response.data.html_form);
        } else if (response.data?.payment_url && response.data?.form_data) {
          // 手動創建表單並提交
          this.createAndSubmitForm(response.data.payment_url, response.data.form_data);
        } else {
          alert('付款資料格式錯誤');
          this.isCheckingOut.set(false);
        }
      },
      error: (error) => {
        console.error('創建付款失敗:', error);
        alert('創建付款失敗，請稍後再試');
        this.isCheckingOut.set(false);
      }
    });
  }

  // 提交綠界 HTML 表單
  private submitEcpayForm(htmlForm: string): void {
    // 創建一個隱藏的 div 來放置表單
    const div = document.createElement('div');
    div.innerHTML = htmlForm;
    div.style.display = 'none';
    document.body.appendChild(div);

    // 查找表單並自動提交
    const form = div.querySelector('form');
    if (form) {
      document.body.appendChild(form);
      form.submit();
    } else {
      alert('付款表單格式錯誤');
      this.isCheckingOut.set(false);
    }
  }

  // 手動創建並提交表單到綠界
  private createAndSubmitForm(paymentUrl: string, formData: any): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.style.display = 'none';

    // 添加表單欄位
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key].toString();
        form.appendChild(input);
      }
    });

    document.body.appendChild(form);
    form.submit();
  }
}
