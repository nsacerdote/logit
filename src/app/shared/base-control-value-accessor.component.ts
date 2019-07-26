import { ControlValueAccessor } from '@angular/forms';
import { Observable } from 'rxjs';

export abstract class BaseControlValueAccessorComponent
   implements ControlValueAccessor {
   registerChange: (value: any) => void;
   registerTouch: () => void;
   isDisabled: boolean;

   public registerOnChange(fn: any): void {
      this.registerChange = fn;
      this.valueChangeObservable().subscribe((value: any) =>
         this.registerChange(value)
      );
   }

   public registerOnTouched(fn: any): void {
      this.registerTouch = fn;
   }

   public setDisabledState(isDisabled: boolean): void {
      this.isDisabled = isDisabled;
   }

   public abstract writeValue(obj: any): void;

   abstract valueChangeObservable(): Observable<any>;
}
