import {CommonModule} from '@angular/common';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {provideRouter} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {RiseMapChipComponent} from '../components/rise-map-chip/rise-map-chip.component';
import {LayerViewModel} from '../models/LayerViewModel';
import {AreaService} from '../services/api/area.service';
import {AttachmentService} from '../services/api/attachment.service';
import {EventService} from '../services/api/event.service';
import {LayerService} from '../services/api/layer.service';
import {MapAPIService} from '../services/api/map.service';
import {PluginService} from '../services/api/plugin.service';
import {ConstantsService} from '../services/constants.service';
import {MapService} from '../services/map.service';
import {NotificationsDialogsService} from '../services/notifications-dialogs.service';
import {FilterPipe} from '../shared/pipes/filter.pipe';
import {MonitorComponent} from '../views/monitor/monitor.component';

describe('Monitor plugin selection badges', () => {
  it('keeps each plugin count in sync across switching, deselection, removal and date changes', async () => {
    const makeLayer = (pluginId: string, mapId: string, name: string) => Object.assign(new LayerViewModel(), {
      pluginId, mapId, name, layerId: mapId, icon: 'layers', disabled: false,
    });
    const oFlood = makeLayer('flood', 'extent', 'Extent');
    const oRoads = makeLayer('impacts', 'roads', 'Roads');
    const oBuildings = makeLayer('impacts', 'buildings', 'Buildings');
    const oLayerService = {
      findAvailableLayers: jasmine.createSpy().and.callFake(
        (_maps: string, _area: string, _date: number, sPluginId: string) =>
          of(sPluginId === 'flood' ? [oFlood] : [oRoads, oBuildings]),
      ),
    };
    spyOn(MonitorComponent.prototype, 'ngOnInit');
    await TestBed.configureTestingModule({
      imports: [MonitorComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        ...[AreaService, AttachmentService, ConstantsService, EventService, MapAPIService,
          MatDialog, NotificationsDialogsService, PluginService].map(provide => ({provide, useValue: {}})),
        {provide: LayerService, useValue: oLayerService},
        {provide: MapService, useValue: {
          getMap: () => ({eachLayer: () => {}}),
          addLayerMap2DByServer: jasmine.createSpy(),
          setSelectedLayers: jasmine.createSpy(),
        }},
      ],
    }).overrideComponent(MonitorComponent, {
      set: {
        imports: [CommonModule, FilterPipe, RiseMapChipComponent, TranslateModule],
        schemas: [NO_ERRORS_SCHEMA],
      },
    }).compileComponents();
    const oFixture = TestBed.createComponent(MonitorComponent);
    const oMonitor = oFixture.componentInstance;
    const oRoot: HTMLElement = oFixture.nativeElement;
    oMonitor.m_aoAreaPlugins = [
      {id: 'flood', stringCode: 'flood', icon: 'flood'},
      {id: 'impacts', stringCode: 'impacts', icon: 'impact'},
    ];
    oFixture.detectChanges();

    const getChip = (sLevel: string, iIndex: number) =>
      oRoot.querySelectorAll<HTMLElement>(`.${sLevel} .map-chip-container`)[iIndex];
    const clickChip = (sLevel: string, iIndex: number) => {
      getChip(sLevel, iIndex).click();
      oFixture.detectChanges();
    };
    const readCount = (iIndex: number) =>
      getChip('plugin-level', iIndex).querySelector('.selected-sub-chip-count')?.textContent?.trim();

    clickChip('plugin-level', 1);
    expect(readCount(1)).toBeUndefined();
    clickChip('maps-level', 0);
    expect(readCount(1)).toBe('1');
    clickChip('maps-level', 1);
    expect(readCount(1)).toBe('2');

    clickChip('plugin-level', 0);
    expect(getChip('plugin-level', 0).classList).toContain('active');
    expect(getChip('plugin-level', 1).classList).not.toContain('active');
    expect(getChip('plugin-level', 1).classList).toContain('has-selected-sub-chips');
    expect(readCount(1)).toBe('2');
    expect(readCount(0)).toBeUndefined();
    clickChip('maps-level', 0);
    expect(readCount(0)).toBe('1');

    oMonitor.removeLayer(oBuildings);
    oFixture.detectChanges();
    expect(readCount(1)).toBe('1');
    clickChip('plugin-level', 1);
    expect(getChip('maps-level', 0).classList).toContain('active');
    expect(getChip('maps-level', 1).classList).not.toContain('active');
    clickChip('maps-level', 0);
    expect(readCount(1)).toBeUndefined();
    expect(getChip('plugin-level', 1).classList).not.toContain('has-selected-sub-chips');
    expect(readCount(0)).toBe('1');

    oLayerService.findAvailableLayers.and.returnValue(of([{...oFlood, disabled: true}]));
    oMonitor.updateMapAndLayerButtons();
    oFixture.detectChanges();
    expect(readCount(0)).toBeUndefined();
    expect(getChip('plugin-level', 0).classList).not.toContain('has-selected-sub-chips');
  });
});
