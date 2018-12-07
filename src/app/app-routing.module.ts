import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorklogsComponent } from './components/worklogs/worklogs.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'worklogs', pathMatch: 'full' },
  { path: 'worklogs', component: WorklogsComponent },
  { path: 'settings', component: SettingsComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
