import { Organization } from "./organization"
import { User } from "./user"
export interface UserRegistration {
    user: User, 
    organization: Organization, 
    password: string
}