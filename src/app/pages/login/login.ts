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
import { AuthService } from '@app/services/auth.service';

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
export default class Login {
  fb = inject(FormBuilder);
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  isLoading = this.authService.isLoading;
  errorMessage = this.authService.error;


  get TmfIcon() {
    return TmfIconEnum;
  }

  form = this.fb.group({
    email: ['', emailValidator],
    password: ['', passwordValidator],
  });

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
