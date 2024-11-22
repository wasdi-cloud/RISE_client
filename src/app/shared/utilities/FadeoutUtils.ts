export default class FadeoutUtils {
  /**
   *
   * @param sString
   * @returns {boolean}
   */
  static utilsIsStrNullOrEmpty(sString: string) {
    if (sString && typeof sString != 'string') {
      throw '[Utils.isStrNullOrEmpty] The value is NOT a string';
    }

    if (sString && sString.length > 0) return false; // string has content
    else return true; // string is empty or null
  }

  /**
   *
   * @param oObject
   * @returns {boolean}
   */
  static utilsIsObjectNullOrUndefined(oObject) {
    if (oObject == null || oObject == undefined) return true;
    return false;
  }
  /**
   *
   * @param sValue
   * @returns {boolean}
   */
  static utilsIsEmail(sValue: string) {
    if (this.utilsIsStrNullOrEmpty(sValue)) return false;

    let re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(sValue);
  }

  /**
   *
   * @param sString1
   * @param sString2
   * @returns {boolean}
   */
  //sString1 contains sString2
  static utilsIsSubstring(sString1: string, sString2: string) {
    if (
      this.utilsIsStrNullOrEmpty(sString1) ||
      this.utilsIsStrNullOrEmpty(sString2)
    ) {
      console.log('Error, Invalid String ');
      return false;
    }

    if (sString1.indexOf(sString2) == -1) return false;
    return true;
  }
  /**
   * Check if String contains case insensitive
   * @param sSource
   * @param sStrToSearch
   * @returns {boolean}
   */
  static utilsStrContainsCaseInsensitive(
    sSource: string,
    sStrToSearch: string
  ) {
    if (sSource == null) {
      return false;
    }
    let s1 = sSource.toLowerCase();
    let s2 = sStrToSearch.toLowerCase();
    return s1.indexOf(s2) > -1;
  }

  /**
   * Remove spaces from a string
   * @param sString
   */
  static utilsRemoveSpaces(sString: string) {
    sString.replace(/\s/g, '');
  }

  /**
   *
   * @param oValue
   * @returns {boolean}
   */
  static utilsIsANumber(oValue) {
    if (isNaN(oValue) == false) return true;

    return false;
  }

  /**
   * isInteger
   * @param oInput
   * @returns {boolean}
   */

  static utilsIsInteger(oInput: any) {
    if (this.utilsIsANumber(oInput) == false) return false;
    return oInput % 1 === 0;
  }

  /************************ TIMESTAMP ************************/
  static utilsGetTimeStamp() {
    // return (new Date().getTime());
    let currentdate = new Date();
    let datetime =
      'Last Sync: ' +
      currentdate.getDate() +
      '/' +
      (currentdate.getMonth() + 1) +
      '/' +
      currentdate.getFullYear() +
      ' @ ' +
      currentdate.getHours() +
      ':' +
      currentdate.getMinutes() +
      ':' +
      currentdate.getSeconds();
    return datetime;
  }

  //CHECK IF FEBRUARY HAS 29 DAYS
  static utilsLeapYear(year: string) {
    let iYear = parseInt(year);
    return (iYear % 4 == 0 && iYear % 100 != 0) || iYear % 400 == 0;
  }

  //from 1 to iValue
  static utilsGenerateArrayWithFirstNIntValue(
    iStartingValue: number,
    iEndValue: number
  ) {
    if (
      this.utilsIsObjectNullOrUndefined(iEndValue) === true ||
      this.utilsIsInteger(iEndValue) === false
    ) {
      return null;
    }
    if (
      this.utilsIsObjectNullOrUndefined(iStartingValue) === true ||
      this.utilsIsInteger(iStartingValue) === false
    ) {
      return null;
    }
    let aiReturnArray = [];
    for (
      let iIndexArray = iStartingValue;
      iIndexArray < iEndValue;
      iIndexArray++
    ) {
      aiReturnArray[iIndexArray] = iIndexArray;
    }
    return aiReturnArray;
  }

  static utilsGetMidPoint(
    iPointAX: number,
    iPointAY: number,
    iPointBX: number,
    iPointBY: number
  ) {
    if (
      this.utilsIsANumber(iPointAX) === false ||
      this.utilsIsANumber(iPointAY) === false ||
      this.utilsIsANumber(iPointBX) === false ||
      this.utilsIsANumber(iPointBY) === false
    ) {
      return null;
    }

    let iMidPointX = (iPointAX + iPointBX) / 2;
    let iMidPointY = (iPointAY + iPointBY) / 2;

    return {
      x: iMidPointX,
      y: iMidPointY,
    };
  }

  /**
   *
   * @param x
   * @param y
   * @param pointARectangleX
   * @param pointARectangleY
   * @param pointBRectangleX
   * @param pointBRectangleY
   * @returns {boolean}
   */
  static utilsIsPointInsideSquare(
    x: number,
    y: number,
    pointARectangleX: number,
    pointARectangleY: number,
    pointBRectangleX: number,
    pointBRectangleY: number
  ) {
    let x1 = Math.min(pointARectangleX, pointBRectangleX);
    let x2 = Math.max(pointARectangleX, pointBRectangleX);
    let y1 = Math.min(pointARectangleY, pointBRectangleY);
    let y2 = Math.max(pointARectangleY, pointBRectangleY);
    if (x1 <= x && x <= x2 && y1 <= y && y <= y2) {
      return true;
    } else {
      return false;
    }
  }

  static verboseLog(sLogLine: string) {
    if (true) {
      console.log(sLogLine);
    }
  }

  static utilsFindObjectInArray(oArray, oObject) {
    //ERROR PARAMS == NULL OR UNDEFINED
    if (
      this.utilsIsObjectNullOrUndefined(oArray) ||
      this.utilsIsObjectNullOrUndefined(oObject)
    )
      return -1;
    // 0 ELEMENTS IN ARRAY
    if (oArray.length == 0) return -1;

    var iArrayLength = oArray.length;
    for (var iIndex = 0; iIndex < iArrayLength; iIndex++) {
      if (oArray[iIndex] == oObject) return iIndex;
    }
    /* the object isn't inside array */
    return -1;
  }

  static utilsIsValidDate(d: any) {
    return d instanceof Date;
  }

  static formatTimestamp(date: any) {
    const year = date.getFullYear(),
      month = ('0' + (date.getMonth() + 1)).slice(-2),
      day = date.getDate();

    return [year, month, day].join('-');
  }
}
