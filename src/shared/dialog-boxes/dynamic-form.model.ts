export interface DynamicField {
  name: string;
  label: string;
 type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'file'| 'year' | 'date' | 'table'; // Change this from string[] to an object array
options?: { name: string; value: any; id?: any }[];
 hidden?: boolean;
  required?: boolean; 
   readonly?: boolean;
    notRequiredForSave?: boolean; 
  change?: any;
  multiple?: any; // New property to indicate if it's a multi-select
}

export interface DynamicDialogData {
  title: string;
  fields: DynamicField[];
}
