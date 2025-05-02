import {RiseViewModel} from "./RiseViewModel";


export class LayerViewModel extends RiseViewModel {

  layerId: string;

  referenceDate: number;

  source: string;

  properties: Map<string, string>;

  mapId: string;

  pluginId: string;

  areaId: string;

  id: string;

  geoserverUrl: string;

  isVisible:boolean=true;

  pluginName:string;

}
