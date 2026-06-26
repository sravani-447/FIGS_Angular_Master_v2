import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  HostListener, 
  OnInit, 
  ElementRef, 
  forwardRef,
  ChangeDetectorRef, OnChanges, SimpleChanges 
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  templateUrl: './custom-dropdown.component.html',
  styleUrls: ['./custom-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ]
})
export class CustomDropdownComponent implements OnInit, ControlValueAccessor, OnChanges  {

  @Input() label = '';
  @Input() placeholder = 'Select option';
  @Input() options: any[] = [];
  @Input() displayKey = 'label'; // Key to show in list (e.g. 'trainingName')
  @Input() valueKey = 'value';   // Key to bind to ngModel (e.g. 'id' or 'trainingName')

  @Output() selectionChange = new EventEmitter<any>();

  isOpen = false;
  selectedItem: any = null;

  // Callbacks for ControlValueAccessor
  onChange = (_: any) => { };
  onTouched = () => { };

  constructor(private _eref: ElementRef,  private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void { }

  /**
   * Toggles the dropdown.
   * We do NOT stop propagation here. This allows the click event to bubble up
   * to the document, triggering the 'clickout' listener in OTHER dropdowns,
   * causing them to close.
   */
  toggle(event: MouseEvent) {
    this.isOpen = !this.isOpen;
     this.cdr.detectChanges(); 
  }

   ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      // If the options list changed, update UI immediately
      this.cdr.detectChanges();
    }
  }

  /**
   * Selects an option.
   */
  select(item: any, event: MouseEvent) {
    event.stopPropagation(); // Stop propagation to prevent immediate toggling/issues
    this.selectedItem = item;
    this.isOpen = false;

    // Determine the value to emit
    // If item is an object, try to use valueKey, otherwise use the item itself
    const val = (item && typeof item === 'object' && this.valueKey in item) 
                ? item[this.valueKey] 
                : item;

    this.onChange(val); // Update ngModel
    this.selectionChange.emit(val); // Emit change event
     this.cdr.detectChanges();
  }

  /**
   * Listen for clicks anywhere in the document.
   * If the click is OUTSIDE this element, close the dropdown.
   */
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this._eref.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.isOpen = false;
        // 5. Force update on close
        this.cdr.detectChanges();
      }
    }
  }

  // --- ControlValueAccessor Implementation (Required for ngModel) ---

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      // Try to find the matching object in options
      const found = this.options.find(opt => {
        const optVal = (opt && typeof opt === 'object' && this.valueKey in opt) 
                       ? opt[this.valueKey] 
                       : opt;
        return optVal === value;
      });
      
      this.selectedItem = found || value;
    } else {
      this.selectedItem = null;
    }
    this.cdr.markForCheck(); 
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}