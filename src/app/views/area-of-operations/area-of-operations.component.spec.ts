import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaOfOperationsComponent } from './area-of-operations.component';

describe('AreaOfOperationsComponent', () => {
  let component: AreaOfOperationsComponent;
  let fixture: ComponentFixture<AreaOfOperationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaOfOperationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AreaOfOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
