import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseControlValueAccessorComponent } from '../base-control-value-accessor.component';
import { concat, Observable, Subject, Subscription } from 'rxjs';
import {
   debounceTime,
   distinctUntilChanged,
   filter,
   scan,
   share,
   shareReplay,
   switchMap,
   tap,
   withLatestFrom
} from 'rxjs/operators';
import { IssueAutocompleteService } from '../../services/issue-autocomplete.service';
import { Issue } from '../../models/issue.model';
import { TimeUtils } from '../utils/time.utils';

@Component({
   selector: 'app-issue-autocomplete',
   templateUrl: './issue-autocomplete.component.html',
   styleUrls: ['./issue-autocomplete.component.scss'],
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: IssueAutocompleteComponent,
         multi: true
      }
   ],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class IssueAutocompleteComponent extends BaseControlValueAccessorComponent implements OnInit, OnDestroy {

   private readonly SELECTION_EVENTS = {
      NEXT: 'NEXT',
      PREVIOUS: 'PREVIOUS',
      RESET: 'RESET',
      SELECT: 'SELECT'
   };

   @Input() disabled = false;

   issueGroup: FormGroup;
   opened = false;

   $options: Observable<Issue[]>;
   $selectedOption: Observable<Issue>;

   private optionSelected = false;
   private $input: Subject<string>;
   private $selectedOptionEvents: Subject<string>;
   private selectedOptionEventSubscription: Subscription;

   constructor(private fb: FormBuilder,
               private cdRef: ChangeDetectorRef,
               private issueAutocompleteService: IssueAutocompleteService) {
      super();
   }

   ngOnInit() {
      this.issueGroup = this.fb.group({
         'key': {value: '', disabled: this.disabled},
         'description': {value: '', disabled: this.disabled}
      });

      this.$input = new Subject<string>();
      this.$selectedOptionEvents = new Subject<string>();
      this.setOptionsObservable();
      this.setSelectedOptionObservable();
      this.watchForOptionSelectedEvent();
   }

   onMouseDownMenu(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
   }

   valueChangeObservable(): Observable<any> {
      return this.issueGroup.valueChanges;
   }

   writeValue(issue: Issue): void {
      if (issue) {
         this.issueGroup.patchValue(issue);
         this.cdRef.detectChanges();
      }
   }

   searchValue(value: string) {
      this.opened = true;
      this.$input.next(value.trim());
   }

   closeOptions() {
      this.opened = false;
      this.resetSelection();
   }

   selectOption(issue: Issue) {
      this.optionSelected = true;
      this.writeValue(issue);
      this.closeOptions();
   }

   inputEventHandler(value: string) {
      this.optionSelected = false;
      this.searchValue(value);
   }

   focusEventHandler(value: string) {
      if (!this.optionSelected) {
         this.searchValue(value);
      }
   }

   arrowDownEventHandler(event: Event) {
      if (!this.opened) {
         this.opened = true;
      } else {
         this.$selectedOptionEvents.next(this.SELECTION_EVENTS.NEXT);
      }
      event.preventDefault();
   }

   arrowUpEventHandler(event: Event) {
      if (this.opened) {
         this.$selectedOptionEvents.next(this.SELECTION_EVENTS.PREVIOUS);
      }
      event.preventDefault();
   }

   enterEventHandler() {
      if (this.opened) {
         this.$selectedOptionEvents.next(this.SELECTION_EVENTS.SELECT);
      }
   }

   private resetSelection() {
      this.$selectedOptionEvents.next(this.SELECTION_EVENTS.RESET);
   }

   private setOptionsObservable() {
      this.$options = this.$input.pipe(
         debounceTime(100),
         distinctUntilChanged(),
         switchMap(input => concat(
            this.issueAutocompleteService.searchIssuesFromCache(input).pipe(tap(() => this.resetSelection())),
            this.issueAutocompleteService.searchIssues(input)
            )
         ),
         share()
      );
   }

   private setSelectedOptionObservable() {
      this.$selectedOption = this.$selectedOptionEvents.pipe(
         withLatestFrom(this.$options),
         scan((acc: Issue, [event, options]: [string, Issue[]]) => {
            if (event === this.SELECTION_EVENTS.RESET) {
               return null;
            }
            const currentIndex = options.findIndex(o => acc && acc.key === o.key);
            let newIndex;
            if (event === this.SELECTION_EVENTS.NEXT) {
               newIndex = currentIndex + 1;
            } else if (event === this.SELECTION_EVENTS.PREVIOUS) {
               newIndex = currentIndex - 1;
            } else {
               newIndex = currentIndex;
            }
            return options[TimeUtils.keepInPositiveRange(newIndex, options.length)];
         }, null),
         shareReplay(1)
      );
   }

   private watchForOptionSelectedEvent() {
      this.selectedOptionEventSubscription = this.$selectedOptionEvents.pipe(
         filter(e => e === this.SELECTION_EVENTS.SELECT),
         withLatestFrom(this.$selectedOption),
         tap(([_, option]) => this.selectOption(option))
      ).subscribe();
   }

   ngOnDestroy(): void {
      this.selectedOptionEventSubscription.unsubscribe();
   }
}
