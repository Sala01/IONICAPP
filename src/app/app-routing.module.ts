import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'operation',
    loadChildren: () => import('./pages/operation/operation.module').then( m => m.OperationPageModule)
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./pages/maintenance/maintenance.module').then( m => m.MaintenancePageModule)
  },
  {
    path: 'maintenance2',
    loadChildren: () => import('./pages/maintenance2/maintenance2.module').then( m => m.Maintenance2PageModule)
  },
  {
    path: 'fuel',
    loadChildren: () => import('./pages/fuel/fuel.module').then( m => m.FuelPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
