export enum PaymentType {
  MONTH = "MONTH",
  YEAR = "YEAR",
}

export class PaymentTypeHelper {
  static isValid(value: string): boolean {
    if (!value) return false;

    return Object.values(PaymentType).includes(value as PaymentType);
  }
}
