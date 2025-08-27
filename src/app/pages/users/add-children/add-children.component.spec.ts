import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddChildrenComponent } from './add-children.component';

describe('AddChildrenComponent', () => {
  let component: AddChildrenComponent;
  let fixture: ComponentFixture<AddChildrenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddChildrenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddChildrenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
