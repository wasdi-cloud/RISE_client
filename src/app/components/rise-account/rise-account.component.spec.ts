import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseAccountComponent } from './rise-account.component';

describe('RiseAccountComponent', () => {
  let component: RiseAccountComponent;
  let fixture: ComponentFixture<RiseAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
