import { Injectable } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { HttpClient } from '@angular/common/http';
import FadeoutUtils from '../../shared/utilities/FadeoutUtils';
import { AttachmentListViewModel } from '../../models/AttachmentListViewModel';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private APIURL: string = this.m_oConstantsService.getAPIURL();

  constructor(
    private m_oConstantsService: ConstantsService,
    private m_oHttp: HttpClient
  ) {}

  /**
   * Uplaod an attachment
   * @param sCollection 
   * @param sFolder 
   * @param sName 
   * @param bNotSameName 
   * @param oBody 
   * @returns 
   */
  upload(sCollection: string, sFolder: string, sName: string, oBody, bNotSameName=false) {

    let sUrlParams = '?collection=' + sCollection + '&folder=' + sFolder + '&name=' + encodeURI(sName);

    if (bNotSameName) {
      sUrlParams += '&notsamename=true';
    }
    else {
      sUrlParams += '&notsamename=false';
    }
    return this.m_oHttp.post<any>(
      this.APIURL + '/attachment/upload' + sUrlParams,
      oBody
    );
  }

  /**
   * Get an attachment file
   * @param sCollection 
   * @param sFolder 
   * @param sName 
   * @param sToken 
   * @returns 
   */
  get(sCollection: string, sFolder: string, sName: string, sToken: string) {
    let sUrlParams = '?collection=' + sCollection + '&folder=' + sFolder + '&name=' + encodeURI(sName);

    if (sToken) {
      sUrlParams += '&token=' + sToken;
    }

    return this.m_oHttp.get(this.APIURL + '/attachment/get' + sUrlParams, { responseType: "blob"});
  }

  /**
   * Check if an attachment file exists
   * @param sCollection 
   * @param sFolder 
   * @param sName 
   * @returns 
   */
  exists(sCollection: string, sFolder: string, sName: string) {
    let sUrlParams = '?collection=' + sCollection + '&folder=' + sFolder + '&name=' + encodeURI(sName);

    return this.m_oHttp.get<any>(this.APIURL + '/attachment/exists' + sUrlParams);
  }

  /**
   * List all the attachment files in a folder
   * @param sCollection 
   * @param sFolder 
   * @returns 
   */
  list(sCollection: string, sFolder: string) {
    let sUrlParams = '?collection=' + sCollection + '&folder=' + sFolder;
    return this.m_oHttp.get<AttachmentListViewModel>(this.APIURL + '/attachment/list' + sUrlParams);
  }

  /**
   * Delete an attachment file
   * @param sCollection 
   * @param sFolder 
   * @param sName 
   * @returns 
   */
  delete(sCollection: string, sFolder: string, sName: string) {
    let sUrlParams = '?collection=' + sCollection + '&folder=' + sFolder + '&name=' + encodeURI(sName);
    return this.m_oHttp.delete(this.APIURL + "/attachment/delete" + sUrlParams);
  };

  /**
   * Get the link to an attachment file
   * @param sCollection 
   * @param sFolder 
   * @param sName 
   * @returns 
   */
  getAttachmentLink(sCollection: string, sFolder: string, sName: string) {

    if (FadeoutUtils.utilsIsStrNullOrEmpty(sName)) return sName;

    let sUrl = this.APIURL + '/attachment/get?collection=' + sCollection + '&folder=' + sFolder + '&name=' + encodeURI(sName);

    if (this.m_oConstantsService != null) {
      let sSessionId = this.m_oConstantsService.getSessionId();
      let sTokenParam = "&token=" + sSessionId;
      if (!sUrl.includes(sTokenParam)) {
        sUrl = sUrl + sTokenParam;
      }
    }

    return sUrl;
  }
}
