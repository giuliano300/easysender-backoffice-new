import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalReportComponent } from './total-report.component';

describe('TotalReportComponent', () => {
  let component: TotalReportComponent;
  let fixture: ComponentFixture<TotalReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
