export interface GridColumn {
  field: string;
  header: string;
  
  type?: 'text' | 'status' | 'actions' | 'button' | 'html' | 'image'|'grid'| 'textarea' | 'date' | 'datetime';
  actions?: GridAction[];

}
export interface GridAction {
  label?: string;          // optional if icon only
  icon: string;            // font-awesome class
  action: string;          // emit key
  tooltip?: string;
  color?: string;
  class?: string;
  button?: string;

  visible?: (row: any) => boolean;

}


export interface DynamicField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'file' | 'date'; // Added 'date'
  options?: { name: string; value: any; id?: any }[];
  hidden?: boolean;
  required?: boolean;
  change?: any;
  multiple?: any;
}