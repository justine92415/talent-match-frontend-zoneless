import { Component, input, OnInit, inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';

@Component({
  selector: 'tmf-certificates-form',
  imports: [
    InputText,
    InputSelect,
    Button,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './certificates-form.html',
  styles: ``
})
export class CertificatesForm implements OnInit {
  private fb = inject(FormBuilder);
  
  // 輸入屬性 - 接收來自父元件的FormGroup
  formGroup = input.required<FormGroup>();

  get TmfIcon() {
    return TmfIconEnum;
  }

  // 取得 FormArray
  get certificatesArray(): FormArray {
    return this.formGroup().get('certificates') as FormArray;
  }

  // 年份選項 (1980-2024)
  yearOptions: SelectOption[] = Array.from({ length: 45 }, (_, i) => {
    const year = 2024 - i;
    return { value: year.toString(), label: `${year}年` };
  });

  // 月份選項 (1-12)
  monthOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { value: month.toString(), label: `${month}月` };
  });

  ngOnInit() {
    // FormGroup 已經由父元件創建和管理，這裡不需要額外的初始化
  }

  // 新增證照
  addCertificate(): void {
    const certificateGroup = this.createCertificate();
    this.certificatesArray.push(certificateGroup);
  }

  // 移除證照
  removeCertificate(index: number): void {
    if (this.certificatesArray.length > 1) {
      this.certificatesArray.removeAt(index);
    }
  }

  // 建立證照 FormGroup
  private createCertificate(): FormGroup {
    return this.fb.group({
      certificate_name: ['', Validators.required],
      issuer: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required],
      certificate_file: [null]
    });
  }

  // 檔案上傳處理
  onCertificateFileChange(event: any, certificateIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      // 檔案大小限制 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過 5MB');
        return;
      }
      
      // 檔案類型限制
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('只允許上傳 PDF、JPG、PNG 格式的檔案');
        return;
      }

      const certificateControl = this.certificatesArray.at(certificateIndex);
      certificateControl.patchValue({ certificate_file: file });
    }
  }

  // 取得檔案名稱
  getFileName(certificateIndex: number): string {
    const certificateControl = this.certificatesArray.at(certificateIndex);
    const file = certificateControl.get('certificate_file')?.value;
    return file ? file.name : '';
  }

  // 移除檔案
  removeFile(certificateIndex: number): void {
    const certificateControl = this.certificatesArray.at(certificateIndex);
    certificateControl.patchValue({ certificate_file: null });
  }
}
