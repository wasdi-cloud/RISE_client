export interface Subscription {
    id: string,
    organizationId: string,
    name: string,
    type: string,
    description: string,
    creationDate: string,
    buyDate: string,
    valid: boolean,
    expireDate: number,
    paymentType: string,
    price: number,
    currency: string,
    supportsArchive: boolean
}