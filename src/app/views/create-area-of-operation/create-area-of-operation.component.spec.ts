import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAreaOfOperationComponent } from './create-area-of-operation.component';

describe('CreateAreaOfOperationComponent', () => {
  let component: CreateAreaOfOperationComponent;
  let fixture: ComponentFixture<CreateAreaOfOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAreaOfOperationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateAreaOfOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
