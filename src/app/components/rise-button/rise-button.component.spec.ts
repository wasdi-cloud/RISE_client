import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseButtonComponent } from './rise-button.component';

describe('RiseButtonComponent', () => {
  let component: RiseButtonComponent;
  let fixture: ComponentFixture<RiseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
