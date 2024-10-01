import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseCheckBoxComponent } from './rise-check-box.component';

describe('RiseCheckBoxComponent', () => {
  let component: RiseCheckBoxComponent;
  let fixture: ComponentFixture<RiseCheckBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseCheckBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseCheckBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
