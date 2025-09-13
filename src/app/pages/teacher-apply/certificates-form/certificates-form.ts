import { Component, inject, signal, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
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
export class CertificatesForm {
  private fb = inject(FormBuilder);

  // 輸入屬性
  initialData = input<any>(null);

  // 輸出事件
  formSubmit = output<any>();
  formValid = output<boolean>();

  get TmfIcon() {
    return TmfIconEnum;
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

  // 教學證照表單
  certificateForm = this.fb.group({
    certificates: this.fb.array([])
  });

  get certificatesArray(): FormArray {
    return this.certificateForm.get('certificates') as FormArray;
  }

  constructor() {
    // 監聽表單狀態變化
    this.certificateForm.statusChanges.subscribe(status => {
      this.formValid.emit(status === 'VALID');
    });

    // 如果有初始資料，填入表單
    if (this.initialData()) {
      this.loadInitialData();
    } else {
      // 預設新增一個證照
      this.addCertificate();
    }
  }

  private loadInitialData() {
    const data = this.initialData();
    if (data?.certificates && Array.isArray(data.certificates)) {
      // 清空現有的證照
      while (this.certificatesArray.length !== 0) {
        this.certificatesArray.removeAt(0);
      }
      
      // 加載初始資料
      data.certificates.forEach((cert: any) => {
        const certificateGroup = this.createCertificate();
        certificateGroup.patchValue(cert);
        this.certificatesArray.push(certificateGroup);
      });
    } else {
      this.addCertificate();
    }
  }

  // 建立證照 FormGroup
  createCertificate(): FormGroup {
    return this.fb.group({
      certificate_name: ['', Validators.required],
      issuer: ['', Validators.required],
      year: ['', Validators.required],
      month: ['', Validators.required],
      certificate_file: [null]
    });
  }

  addCertificate(): void {
    this.certificatesArray.push(this.createCertificate());
  }

  removeCertificate(index: number): void {
    if (this.certificatesArray.length > 1) {
      this.certificatesArray.removeAt(index);
    }
  }

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

  onSubmit() {
    if (this.certificateForm.valid) {
      this.formSubmit.emit(this.certificateForm.value);
    } else {
      this.certificateForm.markAllAsTouched();
    }
  }

  // 取得表單資料
  getFormData() {
    return this.certificateForm.value;
  }

  // 檢查表單是否有效
  isFormValid() {
    return this.certificateForm.valid;
  }

  // 檢查表單是否有變更
  isFormDirty() {
    return this.certificateForm.dirty;
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
