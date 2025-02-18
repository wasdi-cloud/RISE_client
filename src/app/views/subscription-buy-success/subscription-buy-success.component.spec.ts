import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionBuySuccessComponent } from './subscription-buy-success.component';

describe('SubscriptionBuySuccessComponent', () => {
  let component: SubscriptionBuySuccessComponent;
  let fixture: ComponentFixture<SubscriptionBuySuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionBuySuccessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionBuySuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
