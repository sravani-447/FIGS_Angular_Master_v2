import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicDialogData, DynamicField } from '../dialog-boxes/dynamic-form.model';

//@Component({
//  selector: 'app-dynamic-dialog',
//  templateUrl: './dynamic-dialog.component.html'
//})
//export class DynamicDialogComponent implements OnInit {

//  form!: FormGroup;

//  constructor(
//    @Inject(MAT_DIALOG_DATA) public data: DynamicDialogData,
//    private fb: FormBuilder,
//    private dialogRef: MatDialogRef<DynamicDialogComponent>,
//    private dialog: MatDialog
//  ) { }

//  ngOnInit() {
//    const group: any = {};

//    this.data.fields.forEach(f => {
//      group[f.name] = [''];
//    });

//    this.form = this.fb.group(group);
//  }

//  getOptions(field: DynamicField) {
//    if (!field.dependsOn) {
//      return field.options || [];
//    }
//    const parentValue = this.form.value[field.dependsOn];
//    return field.optionMap?.[parentValue] || [];
//  }

//  submit() {
//    this.dialogRef.close(this.form.value);
//  }

//  close() {
//    this.dialogRef.close();
//  }


//}
