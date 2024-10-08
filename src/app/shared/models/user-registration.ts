import { Organization } from "./organization"
import { User } from "./user"
export interface UserRegistration {
    admin: User, 
    organization: Organization, 
    password: string
}