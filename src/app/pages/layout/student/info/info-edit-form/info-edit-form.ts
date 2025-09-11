import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon";
import { GetProfileResponse } from '@app/api/generated/talentMatchAPI.schemas';
import { InputText } from "@components/form/input-text/input-text";

@Component({
  selector: 'tmf-info-edit-form',
  imports: [ReactiveFormsModule, MatIconModule, InputText],
  templateUrl: './info-edit-form.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoEditForm {
  user = input<GetProfileResponse>();
  profileForm = input.required<FormGroup>();
  errorMessage = input<string | null>();
  
  submitForm = output<void>();
  avatarUpload = output<void>();

  onSubmit(): void {
    this.submitForm.emit();
  }

  onAvatarUpload(): void {
    this.avatarUpload.emit();
  }
}
