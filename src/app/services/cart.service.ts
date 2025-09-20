import { Injectable, inject, signal, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CartService as CartApiService } from '@app/api/generated/cart/cart.service';
import {
  AddCartItemRequest,
  GetCartSuccessResponse,
  CartData,
  CartItemWithDetails
} from '@app/api/generated/talentMatchAPI.schemas';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartApiService = inject(CartApiService);
  private router = inject(Router);

  // 購物車資源管理
  cartResource = rxResource({
    stream: () => this.cartApiService.getApiCart().pipe(
      map(response => {
        if (response.status && response.data) {
          return response.data;
        }
        throw new Error('載入購物車失敗');
      })
    )
  });

  // 購物車項目數量計算
  cartItemCount = computed(() => {
    const cartData = this.cartResource.value() as CartData | undefined;
    return cartData?.items?.length || 0;
  });

  // 購物車總金額計算
  totalAmount = computed(() => {
    const cartData = this.cartResource.value() as CartData | undefined;
    return cartData?.summary?.total_amount || 0;
  });

  // 購物車項目列表
  cartItems = computed(() => {
    const cartData = this.cartResource.value() as CartData | undefined;
    return cartData?.items || [];
  });

  // 加入購物車
  addToCart(courseId: number, priceOptionId: number): Observable<any> {
    const request: AddCartItemRequest = {
      course_id: courseId,
      price_option_id: priceOptionId,
      quantity: 1
    };

    return this.cartApiService.postApiCartItems(request).pipe(
      tap(() => {
        // 重新載入購物車
        this.cartResource.reload();
      })
    );
  }

  // 加入購物車並導向購物車頁面 (立即購買)
  buyNow(courseId: number, priceOptionId: number): Observable<any> {
    return this.addToCart(courseId, priceOptionId).pipe(
      tap(() => {
        this.router.navigate(['/cart']);
      })
    );
  }

  // 移除購物車項目
  removeFromCart(itemId: number): Observable<any> {
    return this.cartApiService.deleteApiCartItemsItemId(itemId).pipe(
      tap(() => {
        // 重新載入購物車
        this.cartResource.reload();
      })
    );
  }

  // 更新購物車項目數量
  updateQuantity(itemId: number, quantity: number): Observable<any> {
    return this.cartApiService.putApiCartItemsItemId(itemId, { quantity }).pipe(
      tap(() => {
        // 重新載入購物車
        this.cartResource.reload();
      })
    );
  }

  // 清空購物車
  clearCart(): Observable<any> {
    return this.cartApiService.deleteApiCart().pipe(
      tap(() => {
        // 重新載入購物車
        this.cartResource.reload();
      })
    );
  }

  // 導向搜尋頁面
  goToSearch(): void {
    this.router.navigate(['/result-tag']);
  }

  // 導向購物車頁面
  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}