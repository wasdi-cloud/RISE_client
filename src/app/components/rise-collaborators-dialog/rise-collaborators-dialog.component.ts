import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserViewModel} from '../../models/UserViewModel';
import {TranslateModule} from '@ngx-translate/core';
import {RiseCollaboratorsComponent} from '../rise-collaborators/rise-collaborators.component';
import {AreaService} from "../../services/api/area.service";
import {NgForOf, NgIf} from "@angular/common";
import {RiseButtonComponent} from "../rise-button/rise-button.component";
import {RiseDropdownComponent} from "../rise-dropdown/rise-dropdown.component";
import {RiseTextInputComponent} from "../rise-text-input/rise-text-input.component";
import {MatTooltip} from "@angular/material/tooltip";
import {UserRole} from "../../models/UserRole";
import {OrganizationsService} from "../../services/api/organizations.service";
import {UserOfAreaViewModel} from "../../models/UserOfAreaViewModel";
import { PermissionService } from '../../services/api/permission.service';

@Component({
  selector: 'rise-collaborators-dialog',
  standalone: true,
  imports: [TranslateModule, RiseCollaboratorsComponent, NgForOf, NgIf, RiseButtonComponent, RiseDropdownComponent, RiseTextInputComponent, MatTooltip],
  templateUrl: './rise-collaborators-dialog.component.html',
  styleUrl: './rise-collaborators-dialog.component.css',
})
export class RiseCollaboratorsDialogComponent implements OnInit {
  m_aoUsers: Array<UserViewModel> = [];
  m_aoFieldOperators: Array<any> = [];
  m_aoFieldOperatorsMap: Map<string,UserViewModel>=new Map<string,UserViewModel> ;
  m_sResourceId: string = '';
  m_sResourceType: string = '';
  m_bAddingUser: boolean = false;
  m_bAddingExternalUser: boolean = false;
  m_oFieldOperatorOfArea: UserOfAreaViewModel
  protected readonly UserRole = UserRole;
  m_oFieldOperatorOfAreaUserId: string="";
  m_sExternalRiseUserId: string = "";
  m_oEntity = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public m_oData: any,
    private m_oDialogRef: MatDialogRef<RiseCollaboratorsDialogComponent>,
    private m_oAreaService: AreaService,
    private m_oOrgService: OrganizationsService,
    private m_oPermissionService: PermissionService
  ) {
  }

  ngOnInit(): void {
    if (this.m_oData) {
      this.m_oEntity = this.m_oData.entity;
      
      this.m_sResourceId = this.m_oData.id;
      this.m_sResourceType = this.m_oData.resourceType;

      this.updateUsersList(this.m_oData.users);
      //this.m_aoUsers = this.m_oData.users;
    }

    this.getFieldOperators()
  }

  updateUsersList(aoUserList: Array<UserViewModel>) {
    for (let iUsers=0; iUsers < aoUserList.length; iUsers++) {
      let oUser = aoUserList[iUsers];
      if (this.m_oEntity!=null) {
        if (this.m_oEntity.organizationId != oUser.organizationId) {
          oUser.role = UserRole.SHARED;
        }  
      }
    }    
    this.m_aoUsers = aoUserList;
  }

  onDismiss() {
    this.m_bAddingUser=false;
    this.m_oDialogRef.close();
  }

  addFieldUser() {
    if (this.m_oFieldOperatorOfArea) {
      this.m_oAreaService.addUserToArea(this.m_sResourceId, this.m_oFieldOperatorOfArea).subscribe({
        next: () => {
          this.m_bAddingUser=false;
          this.m_oAreaService.getUsersFromArea(this.m_sResourceId).subscribe({
            next: (oResponse) => {
              this.updateUsersList(oResponse);
              //this.m_aoUsers = oResponse
            },
            error: (oError) => {
              console.error(oError)
            }
          })
        }
        , error: (oError) => {
          console.error(oError)
        }
      })
    }
    else{
      console.log("please add field operator")
    }
  }

  addExternalUser() {
    if (this.m_sExternalRiseUserId) {

      this.m_oPermissionService.add("area", this.m_sResourceId,this.m_sExternalRiseUserId,"read").subscribe({
        next: () => {
          this.m_bAddingExternalUser=false;

          this.m_oAreaService.getUsersFromArea(this.m_sResourceId).subscribe({
            next: (oResponse) => {
              this.updateUsersList(oResponse);
              //this.m_aoUsers = oResponse
            },
            error: (oError) => {
              console.error(oError)
            }
          })
        }
        , error: (oError) => {
          console.error(oError)
        }
      })

      
    }
    else{
      console.log("please add field operator")
    }
  }  

  removeFieldOperator(oFieldOP: UserViewModel) {
    if(oFieldOP){
      let oUserToDelete:UserOfAreaViewModel={
        areaId:this.m_sResourceId,
        userId:oFieldOP.userId,
        role:oFieldOP.role,
        surname:oFieldOP.surname,
        name:oFieldOP.name,
        email:oFieldOP.email,
        organizationId:""
      }
      this.m_oAreaService.deleteUserFromArea(this.m_sResourceId,oUserToDelete).subscribe({
        next: () => {
          this.m_oAreaService.getUsersFromArea(this.m_sResourceId).subscribe({
            next: (oResponse) => {
              this.updateUsersList(oResponse);
              //this.m_aoUsers = oResponse
            },
            error: (oError) => {
              console.error(oError)
            }
          })
        }
        , error: (oError) => {
          console.error(oError)
        }
      })
    }
  }

  removeExternalOperator(oUser: UserViewModel) {
    if(oUser){
      this.m_oPermissionService.delete("area", this.m_sResourceId,oUser.userId).subscribe({
        next: () => {
          this.m_oAreaService.getUsersFromArea(this.m_sResourceId).subscribe({
            next: (oResponse) => {
              this.updateUsersList(oResponse);
              //this.m_aoUsers = oResponse
            },
            error: (oError) => {
              console.error(oError)
            }
          })
        }
        , error: (oError) => {
          console.error(oError)
        }
      })
    }
  }

  selectFieldOperator(oFieldOperator: any) {
    if (oFieldOperator) {
      let oFieldOp = this.m_aoFieldOperatorsMap.get(oFieldOperator.value);
      this.m_oFieldOperatorOfArea =
        {
          name: oFieldOp.name ? oFieldOp.name : "",
          email: oFieldOp.email ? oFieldOp.email : "",
          surname: oFieldOp.surname ? oFieldOp.surname : "",
          userId: oFieldOp.userId ? oFieldOp.userId : "",
          areaId: this.m_sResourceId ? this.m_sResourceId : "",
          role: UserRole.FIELD,
          organizationId:""
        }
    }
  }

  private getFieldOperators() {
    this.m_oOrgService.getOrganizationUsers().subscribe({
      next: (oResponse) => {
        this.m_aoFieldOperators = oResponse
        this.fillMap()
      },
      error: (oError) => {
        console.error(oError)
      }
    })
  }

  private fillMap() {
    for (let i = 0; i <this.m_aoFieldOperators.length ; i++) {
      let oFieldOperator = this.m_aoFieldOperators[i];
    }
  }

  getFieldOperatorKeys() {
    return Array.from(this.m_aoFieldOperatorsMap.keys());
  }
}
