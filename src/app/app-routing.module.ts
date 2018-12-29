import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WorkdayComponent } from './components/workday/workday.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
   {path: '', redirectTo: 'workday', pathMatch: 'full'},
   {path: 'workday', component: WorkdayComponent},
   {path: 'settings', component: SettingsComponent}
];

@NgModule({
   imports: [RouterModule.forRoot(routes, {useHash: true})],
   exports: [RouterModule]
})
export class AppRoutingModule {
}
