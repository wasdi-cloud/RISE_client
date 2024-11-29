import { Pipe, PipeTransform } from '@angular/core';
import FadeoutUtils from '../utilities/FadeoutUtils';

@Pipe({
  name: 'filter',
  standalone: true,
})
export class FilterPipe implements PipeTransform {
  transform(items: Array<any>, searchText: any): Array<any> {
    if (!items) {
      return [];
    }

    if (FadeoutUtils.utilsIsObjectNullOrUndefined(searchText)) {
      return items;
    }

    if (typeof searchText !== 'string') {
      if (searchText.workspaceName) {
        searchText = searchText.workspaceName;
      }
      if (searchText.name) {
        searchText = searchText.name;
      }
    }
    searchText = searchText.toLocaleLowerCase();
    return items.filter((item) => {
      if (item.name) {
        if (typeof item.name === 'number') {
          return item.name === parseInt(searchText);
        }
        return item.name.toLocaleLowerCase().includes(searchText);
      }
      // Search implementation for LAYER ITEMS - Search by mapId
      if (item.mapId) {
        console.log(item);
        if (typeof item.mapId === 'number') {
          return item.mapId === parseInt(searchText);
        }
        return item.mapId.toLocaleLowerCase().includes(searchText);
      }
    });
  }
}
