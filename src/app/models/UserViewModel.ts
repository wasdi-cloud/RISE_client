import {UserRole} from "./UserRole";
import {RiseViewModel} from "./RiseViewModel";


export class UserViewModel extends RiseViewModel {
  userId?:string;

  email?:string;

  name?:string;

  surname?:string;

  mobile?:string;

  role?:UserRole;

  acceptedTermsAndConditions?:boolean;

  acceptedPrivacy?:boolean;

  lastLoginDate?:number;

  notifyNewsletter?:boolean;

  notifyMaintenance?:boolean;

  notifyActivities?:boolean;

  defaultLanguage?:string;

  organizationId?:string;

  internationalPrefix?:string

}
