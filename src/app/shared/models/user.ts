export interface User {
    userId: string,
    email: string,
    name: string,
    surname: string,
    mobile: string,
    role: string,
    registrationDate: number,
    confirmationDate: number,
    acceptedTermsAndConditions: boolean,
    termsAndConditionAcceptedDate: number,
    acceptedPrivacy: boolean
    privacyAcceptedDate: number,
    lastPasswordUpdateDate: number,
    lastLoginDate: number,
    lastResetPasswordRequest: number,
    notifyNewsletter: boolean,
    notifyMaintenance: boolean,
    notifyActivities: boolean,
    defaultLanguage: string,
    organizationId: string
}