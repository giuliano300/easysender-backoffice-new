import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendUpdateDialogComponent } from './send-update-dialog.component';

describe('SendUpdateDialogComponent', () => {
  let component: SendUpdateDialogComponent;
  let fixture: ComponentFixture<SendUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendUpdateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
