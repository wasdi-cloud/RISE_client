import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseMenuButtonComponent } from './rise-menu-button.component';

describe('RiseMenuButtonComponent', () => {
  let component: RiseMenuButtonComponent;
  let fixture: ComponentFixture<RiseMenuButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseMenuButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
