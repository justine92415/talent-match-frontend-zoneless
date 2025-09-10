import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TmfIconEnum } from '@share/icon.enum';
import { nickNameValidator, userEmailValidator, passwordValidator, confirmPasswordValidator, passwordMatchValidator } from '@share/validator';
import { Button } from "@components/button/button";
import { InputText } from "@components/form/input-text/input-text";
import { Layout1Wapper } from '@components/layout-1-wapper/layout-1-wapper';
import { AuthenticationService } from '../../api/generated/authentication/authentication.service';
import { RegisterRequest } from '../../api/generated/talentMatchAPI.schemas';

@Component({
  selector: 'tmf-sign-up',
  imports: [MatIcon, Button, InputText, Layout1Wapper, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './sign-up.html',
  styles: ``
})
export default class SignUp {
  private fb = inject(FormBuilder);
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  signUpForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.signUpForm = this.fb.group({
      nickName: ['', [nickNameValidator]],
      email: ['', [userEmailValidator]],
      password: ['', [passwordValidator]],
      confirmPassword: ['', [confirmPasswordValidator]]
    }, { validators: passwordMatchValidator });
  }

  get TmfIcon() {
    return TmfIconEnum;
  }

  onSubmit() {
    if (this.signUpForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const formValue = this.signUpForm.value;
      const registerRequest: RegisterRequest = {
        nick_name: formValue.nickName,
        email: formValue.email,
        password: formValue.password
      };

      this.authService.postApiAuthRegister(registerRequest).subscribe({
        next: () => {
          this.isLoading.set(false);
          // 註冊成功後導向到登入頁面或首頁
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || '註冊失敗，請稍後再試');
        }
      });
    }
  }

}
