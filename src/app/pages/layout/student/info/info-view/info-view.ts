import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { GetProfileResponse } from '@app/api/generated/talentMatchAPI.schemas';

@Component({
  selector: 'tmf-info-view',
  imports: [DatePipe, MatIconModule],
  templateUrl: './info-view.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoView {
  user = input<GetProfileResponse>();
}
