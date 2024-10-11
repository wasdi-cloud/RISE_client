import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyNewSubscriptionComponent } from './buy-new-subscription.component';

describe('BuyNewSubscriptionComponent', () => {
  let component: BuyNewSubscriptionComponent;
  let fixture: ComponentFixture<BuyNewSubscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyNewSubscriptionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuyNewSubscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
