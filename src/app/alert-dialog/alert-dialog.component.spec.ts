import { ComponentFixture, TestBed } from '@angular/core/testing';

import { alertDialogComponent } from './alert-dialog.component';

describe('alertDialogComponent', () => {
  let component: alertDialogComponent;
  let fixture: ComponentFixture<alertDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [alertDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(alertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
