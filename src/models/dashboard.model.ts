import { GridColumn } from "../shared/Grids/grid-column.model";

export interface DashboardConfig {
 fromDate?: string;
  toDate?: string;  
  title: string;
  filters: FilterItem[];
  kpis: KpiItem[];
  widgets: WidgetItem[];
}

export interface FilterItem {
  key: string;
  label: string;
  options: any[];
  value: any;
}

export interface KpiItem {
  title: string;
  value: number;
  icon: string;
  gradientClass: string; // e.g., 'kpi-1', 'kpi-2'
}

export interface WidgetItem {
  id: string;
  type: 'CHART' | 'MAP' | 'TABLE';
  title: string;
  data: any; // Raw data from DB
  chartType?: 'pie' | 'doughnut' | 'bar';
  cols?: number;
  columns?: any[]; 
  processedData?: any; 
}