import { Component, inject } from '@angular/core';
import { InputText } from '@components/form/input-text/input-text';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { emailValidator, passwordValidator } from '@share/validator';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'tmf-login',
  imports: [MatIcon, InputText, Button, Layout1Wapper, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export default class Login {
  fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthenticationService);
  private authStateService = inject(AuthStateService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  get TmfIcon() {
    return TmfIconEnum;
  }

  form = this.fb.group({
    email: ['test001@gmail.com', emailValidator],
    password: ['1qaz2wsx', passwordValidator],
  });

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const loginData = {
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.authService
      .postApiAuthLogin(loginData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (
            response?.data?.user &&
            response.data.access_token &&
            response.data.refresh_token
          ) {
            this.authStateService.setAuthState(
              response.data.user,
              response.data.access_token,
              response.data.refresh_token,
            );

            // 登入成功後導向原本要去的頁面，或首頁
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigateByUrl(returnUrl);
          } else {
            this.errorMessage.set('登入回應格式錯誤，請稍後再試');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
        },
      });
  }
}
