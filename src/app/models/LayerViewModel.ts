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

  opacity:number=100;

  pluginName:string;

}
