import {
   ChangeDetectionStrategy,
   Component,
   ElementRef,
   Input,
   OnInit,
   ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { TimeUtils } from '../utils/time.utils';

@Component({
   selector: 'app-timepicker',
   templateUrl: './timepicker.component.html',
   styleUrls: ['./timepicker.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimepickerComponent implements OnInit {

   @Input() minuteStep = 5;
   @Input() shouldFocus = false;
   @Input() timePickerControl: FormControl;

   @ViewChild('inputElement', { static: true }) input: ElementRef;

   options = [-2, -1, 0, 1, 2];
   hour = 0;
   minutes = 0;
   showTimeSelector = false;

   constructor() {
   }

   ngOnInit() {
      if (this.shouldFocus) {
         this.htmlInput.focus();
      }
      this.updateInternalValues();
      this.subscribeToInputChanges();
   }

   get htmlInput(): HTMLInputElement {
      return (<HTMLInputElement>this.input.nativeElement);
   }

   get controlValue(): string {
      return (<string>this.timePickerControl.value);
   }

   onFocus() {
      this.showTimeSelector = true;
      this.initializeIfNeeded();
      this.selectHour();
   }

   private initializeIfNeeded() {
      if (!this.timePickerControl.value) {
         this.initializeControlValue();
         // Set Timeout is needed because input is not updated right away,
         // we can't select the hour properly until next cycle
         setTimeout(() => {
            this.selectHour();
         });
      }
   }

   selectHour() {
      this.applySelection(0, 2);
   }

   private applySelection(start: number, end: number) {
      this.htmlInput.setSelectionRange(start, end);
   }

   private initializeControlValue() {
      this.hour = TimeUtils.getClosestHour(moment(), this.minuteStep);
      this.minutes = TimeUtils.getClosestMinutes(moment(), this.minuteStep);
      this.updateTimePickerControlValue();
   }

   private isTimePickerControlValueValid() {
      const parts = this.controlValue.split(':');
      if (parts.length !== 2) {
         return false;
      }
      const hours = +parts[0];
      const minutes = +parts[1];
      return Number.isInteger(hours) && hours >= 0 && hours < 24 &&
         Number.isInteger(minutes) && minutes >= 0 && minutes < 60;
   }

   private updateTimePickerControlValue() {
      this.timePickerControl.patchValue(
         this.formatNumber(this.hour) + ':' + this.formatNumber(this.minutes)
      );
   }

   formatNumber(n: number): string {
      return ('0' + n).slice(-2);
   }

   onBlur() {
      this.showTimeSelector = false;
   }

   onUpArrowKeyDown(event: Event) {
      if (this.isCursorInHourZone()) {
         this.hoursControlUp();
      } else if (this.isCursorInMinutesZone()) {
         this.minutesControlUp();
      }
      event.preventDefault();
   }

   onDownArrowKeyDown(event: Event) {
      if (this.isCursorInHourZone()) {
         this.hoursControlDown();
      } else if (this.isCursorInMinutesZone()) {
         this.minutesControlDown();
      }
      event.preventDefault();
   }

   onRightArrowKeyDown(event: Event) {
      if (this.controlValue.length === 5) {
         this.selectMinutes();
         event.preventDefault();
      }
   }

   onLeftArrowKeyDown(event: Event) {
      if (this.controlValue.length === 5) {
         this.selectHour();
         event.preventDefault();
      }
   }

   selectMinutes() {
      this.applySelection(3, 5);
   }

   hoursControlUp() {
      this.setHour(this.getHoursOption(-1));
   }

   hoursControlDown() {
      this.setHour(this.getHoursOption(1));
   }

   setHour(hour: number) {
      this.hour = hour;
      this.updateTimePickerControlValue();
      this.selectHour();
   }

   getHoursOption(steps: number) {
      return TimeUtils.keepInPositiveRange(
         this.hour + steps,
         24
      );
   }

   minutesControlUp() {
      this.setMinutes(this.getMinutesOption(-1));
   }

   minutesControlDown() {
      this.setMinutes(this.getMinutesOption(1));
   }

   setMinutes(minutes: number) {
      this.minutes = minutes;
      this.updateTimePickerControlValue();
      this.selectMinutes();
   }

   getMinutesOption(steps: number) {
      return TimeUtils.keepInPositiveRange(
         TimeUtils.roundToStep(this.minutes, this.minuteStep) + (steps * this.minuteStep),
         60
      );
   }

   onMouseDownMenu(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
   }

   private subscribeToInputChanges() {
      this.timePickerControl.valueChanges.subscribe(
         () => this.updateInternalValues()
      );
   }

   private updateInternalValues() {
      const values = this.controlValue.split(':');
      if (values.length === 2 && this.isTimePickerControlValueValid()) {
         this.hour = +(values[0]);
         this.minutes = +(values[1]);
      }
   }

   private isCursorInHourZone() {
      return this.htmlInput.selectionStart >= 0 && this.htmlInput.selectionStart < 3;
   }

   private isCursorInMinutesZone() {
      return this.htmlInput.selectionStart >= 3;
   }
}
