import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function emailValidator(ctrl: AbstractControl): ValidationErrors | null {
  if (Validators.email(ctrl)) {
    return { error: 'Email is invalid' };
  }
  return null;
}
