import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TmfIcon } from './tmf-icon';

describe('TmfIcon', () => {
  let component: TmfIcon;
  let fixture: ComponentFixture<TmfIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TmfIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TmfIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
