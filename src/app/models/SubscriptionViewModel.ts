import { PaymentType } from './PaymentType';
export class SubscriptionViewModel {
  /**
   * Default Id
   */
  id: string;

  organizationId: string;

  name: string;

  type: string;

  description: string;

  creationDate: number;

  buyDate: number | Date;

  valid: boolean;

  expireDate: number;

  paymentType: PaymentType;

  price: number;

  currency: string;

  supportsArchive: boolean=false;

  plugins: string[];

  paymentMethod:string
}
