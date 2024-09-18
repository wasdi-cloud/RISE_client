import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiseTimebarComponent } from './rise-timebar.component';

describe('RiseTimebarComponent', () => {
  let component: RiseTimebarComponent;
  let fixture: ComponentFixture<RiseTimebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiseTimebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RiseTimebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
