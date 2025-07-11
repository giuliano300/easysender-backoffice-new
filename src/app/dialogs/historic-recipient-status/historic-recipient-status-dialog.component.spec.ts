import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricRecipientStatusDialogComponent } from './historic-recipient-status-dialog.component';

describe('HistoricRecipientStatusDialogComponent', () => {
  let component: HistoricRecipientStatusDialogComponent;
  let fixture: ComponentFixture<HistoricRecipientStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricRecipientStatusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricRecipientStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
