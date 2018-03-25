import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: './basic-example/basic.module#BasicModule',
    pathMatch: 'full'
  },
  {
    path: 'profile-pic',
    loadChildren: './profile-pic-example/profile-pic.module#ProfilePicModule'
  }
];

