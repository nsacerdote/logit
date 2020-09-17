import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DialogService } from '../../services/dialog.service';

@Component({
   selector: 'app-header',
   templateUrl: './header.component.html',
   styleUrls: ['./header.component.scss'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
   constructor(private dialogService: DialogService) {}

   ngOnInit() {}

   openLogin() {
      this.dialogService.showLogin().subscribe();
   }
}
