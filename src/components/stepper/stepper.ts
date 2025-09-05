import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  id: number;
  label: string;
}

@Component({
  selector: 'tmf-stepper',
  imports: [CommonModule],
  templateUrl: './stepper.html',
  styles: `
    :host { display: block; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stepper {
  // Input properties using modern signal inputs
  steps = input.required<StepItem[]>();
  currentStep = input<number>(1);
  showOnlyCurrentLabel = input<boolean>(true);

  // Output events
  stepChange = output<number>();

  // 預計算步驟配置
  stepsConfig = computed(() => {
    const currentStep = this.currentStep();
    const showOnlyCurrentLabel = this.showOnlyCurrentLabel();
    const steps = this.steps();

    return steps.map((step, index) => ({
      ...step,
      isActive: step.id <= currentStep,
      isCurrent: step.id === currentStep,
      circleClasses: `flex h-6 w-6 items-center justify-center rounded-full text-white transition-colors duration-200 cursor-pointer ${
        step.id <= currentStep ? 'bg-primary' : 'bg-grey-9f'
      }`,
      labelClasses: `text-base transition-colors duration-200 ${
        step.id <= currentStep ? 'text-grey-33' : 'text-grey-66'
      }`,
      separatorClasses: `h-px w-6 transition-colors duration-200 ${
        index < steps.length - 1 && steps[index + 1].id <= currentStep
          ? 'bg-primary'
          : 'bg-grey-9f'
      }`,
      showLabel: !showOnlyCurrentLabel || step.id === currentStep,
      isLastStep: index === steps.length - 1,
    }));
  });

  // Methods
  onStepClick(step: number): void {
    this.stepChange.emit(step);
  }
}
