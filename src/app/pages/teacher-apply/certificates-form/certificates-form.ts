import { Component, input, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputText } from '@components/form/input-text/input-text';
import { InputSelect, SelectOption } from '@components/form/input-select/input-select';
import { Button } from '@components/button/button';
import { MatIcon } from '@angular/material/icon';
import { TmfIconEnum } from '@share/icon.enum';
import { TagsService } from '../../../api/generated/tags/tags.service';

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
  private tagsService = inject(TagsService);
  
  // 輸入屬性 - 接收來自父元件的FormGroup
  formGroup = input.required<FormGroup>();

  // 主題選項
  subjectOptions = signal<SelectOption[]>([]);
  allTags = signal<any[]>([]);

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
    // 載入主題資料
    this.loadTags();
  }

  // 載入分類資料
  private loadTags() {
    this.tagsService.getApiTags().subscribe({
      next: (response: any) => {
        if (response.data && Array.isArray(response.data)) {
          this.allTags.set(response.data);
          this.buildSubjectOptions();
          
          // API 資料載入完成後，檢查並修復表單值的顯示
          this.refreshFormDisplayValues();
        }
      },
      error: (error) => {
        console.error('載入分類資料失敗:', error);
      }
    });
  }

  // 重新整理表單顯示值 - 確保選項載入後表單值正確顯示
  private refreshFormDisplayValues() {
    // 觸發表單重新檢測值的變化，確保下拉選單正確顯示
    this.certificatesArray.controls.forEach((control, index) => {
      const categoryId = control.get('category_id')?.value;
      if (categoryId) {
        // 重新設置相同的值來觸發更新
        control.get('category_id')?.setValue(categoryId);
      }
    });
  }

  // 建構主題選項
  private buildSubjectOptions() {
    const tags = this.allTags();
    const options: SelectOption[] = tags.map(tag => ({
      value: tag.id.toString(),  // 轉換為字串以匹配表單值
      label: tag.main_category
    }));
    this.subjectOptions.set(options);
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
      id: [null], // 用於更新現有證照時的 ID
      holder_name: ['', Validators.required], // 持有人姓名
      license_number: ['', Validators.required], // 證書號碼
      license_name: ['', Validators.required], // 證照名稱
      category_id: ['', Validators.required], // 證書主題分類 ID
      verifying_institution: ['', Validators.required], // 核發機構
      issue_year: ['', Validators.required], // 核發年份
      issue_month: ['', Validators.required], // 核發月份
      file_path: [null], // 證照檔案路徑
      file_name: [''] // 檔案名稱，供模板顯示使用
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
      certificateControl.patchValue({ 
        file_path: file,
        file_name: file.name
      });
    }
  }

  // 移除檔案
  removeFile(certificateIndex: number): void {
    const certificateControl = this.certificatesArray.at(certificateIndex);
    certificateControl.patchValue({ 
      file_path: null,
      file_name: ''
    });
  }
}
