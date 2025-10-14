import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiseButtonComponent } from '../rise-button/rise-button.component';
import { Router } from '@angular/router';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import { MapService } from '../../services/map.service';
import { RiseUserMenuComponent } from '../rise-user-menu/rise-user-menu.component';
import {UserService} from "../../services/api/user.service";
import {ConstantsService} from "../../services/constants.service";
import {UserViewModel} from "../../models/UserViewModel";
import FadeoutUtils from "../../shared/utilities/FadeoutUtils";

@Component({
  selector: 'rise-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RiseButtonComponent,
    RiseUserMenuComponent,
    TranslateModule,
  ],
  templateUrl: './rise-toolbar.component.html',
  styleUrl: './rise-toolbar.component.css',
})
export class RiseToolbarComponent implements OnInit {
  @Input() public m_bUserIsSigned: boolean = false;
  m_oUser: UserViewModel;
  m_bShowLanguageDropdown: boolean = false;
  m_aoLanguages = [
    {
      name: 'English',
      value: 'en',
    },
    {
      name: 'Español',
      value: 'es',
    },
    {
      name: 'Français',
      value: 'fr',
    },
    {
      name: 'عربي',
      value: 'ar',
    },
    {
      name: "Italiano",
      value: 'it'
    }
  ];
  @Output() m_oCurrentLanguageChange = new EventEmitter();
   m_sCurrentLanguage: string;
  m_sCurrentLanguageName: string = 'Language';

  constructor(
    private m_oTranslate: TranslateService,
    private m_oMapService: MapService,
    private m_oUserService: UserService,
    private m_oConstantsService: ConstantsService,
    private m_oRouter: Router) {}


  ngOnInit() {
    this.getCurrentUser()
  }
  toggleLanguageDropdown() {
    this.m_bShowLanguageDropdown = !this.m_bShowLanguageDropdown;
  }
  getCurrentUser(){
    if(this.m_bUserIsSigned){
      this.m_oUser=this.m_oConstantsService.getUser();
      if(FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUser)){
        this.m_oUserService.getUser().subscribe({
          next: (oResponse) => {
            this.m_oConstantsService.setUser(oResponse);
            this.m_oUser = oResponse;
            this.updateCurrentLanguageName();
          },
          error:(oError)=>{
            console.error(oError)
          }
        })
      }else{
        this.updateCurrentLanguageName();
      }
    }else{
     this.updateCurrentLanguageName()
    }


  }

  updateCurrentLanguageName() {
    if(this.m_bUserIsSigned){
      if(!FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oUser.defaultLanguage)){
        this.m_sCurrentLanguage=this.m_oUser.defaultLanguage;
      }else{
        this.m_sCurrentLanguage='en';

      }
      const sCurrentLang = this.m_aoLanguages.find(lang => lang.value === this.m_sCurrentLanguage);
      this.m_sCurrentLanguageName = sCurrentLang ? sCurrentLang.name : this.m_sCurrentLanguage.toUpperCase();
      console.log(this.m_sCurrentLanguageName)
    }else{
      if(FadeoutUtils.utilsIsStrNullOrEmpty(this.m_oTranslate.currentLang)){
        this.m_sCurrentLanguage='en';
      }else{
        this.m_sCurrentLanguage=this.m_oTranslate.currentLang;
      }

      const sCurrentLang = this.m_aoLanguages.find(lang => lang.value === this.m_sCurrentLanguage);
      this.m_sCurrentLanguageName = sCurrentLang ? sCurrentLang.name : this.m_sCurrentLanguage.toUpperCase();
    }
  }
  changeLanguage(value: string) {
    if(this.m_bUserIsSigned){
      this.m_oUser = this.m_oConstantsService.getUser();
      if (FadeoutUtils.utilsIsObjectNullOrUndefined(this.m_oUser)) {
        //there is no user
        this.m_oUserService.getUser().subscribe({
          next: (oResponse) => {
            this.m_oConstantsService.setUser(oResponse);
            this.m_oUser = oResponse;
            this.m_oUser.defaultLanguage = value;
            this.m_oUserService.changeUserLanguageSetting(this.m_oUser).subscribe({
              next: (oResponse) => {
                this.m_oTranslate.use(this.m_oUser.defaultLanguage);
                this.m_bShowLanguageDropdown = false;
                this.updateCurrentLanguageName();
              },
              error: (oError) => {
                console.error(oError);
                this.m_bShowLanguageDropdown = false;
              },
            });
          },
          error:(oError)=>{
            console.error(oError)
            this.m_bShowLanguageDropdown = false;
          }
        })
      } else {
        this.m_oUser.defaultLanguage = value;
        this.m_oUserService.changeUserLanguageSetting(this.m_oUser).subscribe({
          next: (oResponse) => {
            this.m_oTranslate.use(this.m_oUser.defaultLanguage);
            this.m_bShowLanguageDropdown = false;
            this.updateCurrentLanguageName();
          },
          error: (oError) => {
            console.error(oError);
            this.m_bShowLanguageDropdown = false;

          },
        });
      }
    }else{
      this.m_bShowLanguageDropdown=false
      this.m_oTranslate.use(value);
      this.m_sCurrentLanguage=value
      const sCurrentLang = this.m_aoLanguages.find(lang => lang.value === this.m_sCurrentLanguage);
      this.m_sCurrentLanguageName = sCurrentLang ? sCurrentLang.name : this.m_sCurrentLanguage.toUpperCase();
      this.m_oCurrentLanguageChange.emit(value);
      //here its either login or sign up, so it's a good thing to send this to the the other comp and from there we save the default language
    }
  }

  /**
   * Getter for user's logged-in/out status'
   * @returns boolean
   */
  public get userIsSigned(): boolean {
    return this.m_bUserIsSigned;
  }

  /**
   * Handle routing on clicks of visible buttons
   */
  public navigateRoute(sLocation: string) {
    if (sLocation === 'dashboard') {
      this.m_oMapService.closeWorkspace();
    }
    this.m_oRouter.navigateByUrl(`/${sLocation}`);
  }
}
