import { NgModule } from '@angular/core';
import {
   MatButtonModule,
   MatCardModule, MatDatepickerModule,
   MatDividerModule,
   MatFormFieldModule,
   MatIconModule,
   MatInputModule,
   MatProgressBarModule,
   MatSidenavModule,
   MatToolbarModule
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
   exports: [
      MatToolbarModule,
      MatIconModule,
      MatButtonModule,
      MatSidenavModule,
      MatFormFieldModule,
      MatInputModule,
      MatCardModule,
      MatDividerModule,
      DragDropModule,
      MatDatepickerModule,
      MatMomentDateModule,
      MatProgressBarModule
   ]
})
export class AppMaterialModule {
}
