import { Component, Input, Output, EventEmitter, ChangeDetectorRef,ViewChild  } from '@angular/core';
import { DashboardConfig } from '../../models/dashboard.model';

@Component({
  selector: 'app-custom-dashboard',
  templateUrl: './custom-dashboard.component.html',
  styleUrls: ['./custom-dashboard.component.css']
})
export class CustomDashboardComponent {
  private _config!: DashboardConfig;
  @ViewChild('dashboardMap') dashboardMap: any;
 showBasemapMenu = false;
  activeBaseLayerName = 'streets';


  @Input() set config(value: DashboardConfig) {
    if (value) {
      // Create a fresh copy to trigger Angular Change Detection properly
      this._config = { ...value, widgets: this.processWidgetData(value.widgets || []) };
      this.cdr.detectChanges();
    }
  }
  get config() { return this._config; }

  @Output() filterChanged = new EventEmitter<any>();
  @Output() download = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  onBaseLayerChange(layerName: string) {
    this.activeBaseLayerName = layerName; // Update the variable here!
    
    if (this.dashboardMap && typeof this.dashboardMap.updateBaseLayer === 'function') {
      this.dashboardMap.updateBaseLayer(layerName);
    }
    this.showBasemapMenu = false; 
  }




  processWidgetData(widgets: any[]): any[] {
    return widgets.map(w => {
      // Deep copy the widget so we don't mutate original inputs
      const widget = { ...w }; 

      if (widget.type === 'CHART' && widget.data) {
        let labels: string[] = [];
        let values: any[] = [];

        // 1. Object format { "Male": 20, "Female": 10 }
        if (!Array.isArray(widget.data) && typeof widget.data === 'object') {
          labels = Object.keys(widget.data).map(k => `${k}: ${widget.data[k] || 0}`);
          values = Object.values(widget.data).map(v => v || 0);
        } 
        // 2. Array format [{ type: 'Dam', count: 5 }] or [{ name: 'Pond', amount: 10 }]
        else if (Array.isArray(widget.data)) {
          widget.data.forEach((item: any) => {
            const keys = Object.keys(item);
            
            // Dynamically find the string key (for label) and number key (for value)
            const labelKey = keys.find(k => typeof item[k] === 'string') || keys[0];
            const valueKey = keys.find(k => typeof item[k] === 'number' || k === 'count' || k === 'amount') || keys[1];

            if (labelKey && valueKey && item[valueKey] !== undefined) {
              labels.push(`${item[labelKey]}: ${item[valueKey]}`);
              values.push(item[valueKey]);
            }
          });
        }
        widget.processedData = { labels, values };
      }
      return widget;
    });
  }

  onFilterChange(key: string, value: any) { this.filterChanged.emit({ key, value }); }
  onDownload() { this.download.emit(); }
}