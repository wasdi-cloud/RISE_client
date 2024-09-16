import { Organization } from "./organization";
import { User } from "./user";

export interface Register {
    admin: User,
    organization: Organization,
    password: string
}