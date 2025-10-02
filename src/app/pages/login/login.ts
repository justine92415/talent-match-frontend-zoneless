import { Component, inject, OnInit } from '@angular/core';
import { InputText } from '@components/form/input-text/input-text';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { emailValidator, passwordValidator } from '@share/validator';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@share/services/notification.service';

@Component({
  selector: 'tmf-login',
  imports: [
    MatIcon,
    InputText,
    Button,
    Layout1Wapper,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login implements OnInit {
  fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);

  isLoading = this.authService.isLoading;
  errorMessage = this.authService.error;


  get TmfIcon() {
    return TmfIconEnum;
  }

  form = this.fb.group({
    email: ['', emailValidator],
    password: ['', passwordValidator],
  });

  ngOnInit() {
    // 檢查是否有從註冊頁面傳來的信箱
    const state = history.state;

    if (state?.['email']) {
      this.form.patchValue({
        email: state['email']
      });
    }
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 清除之前的錯誤訊息
    this.authService.clearError();

    const loginData = {
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.authService.login(loginData).subscribe({
      next: (success) => {
        if (success) {
          // 顯示成功訊息
          const userName = this.authService.userName();
          if (userName) {
            this.notification.success(`歡迎回來，${userName}！`);
          } else {
            this.notification.success('登入成功！');
          }

          // 檢查是否有重定向目標
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
      },
    });
  }
}
