import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from 'src/app/core/layout/layout/layout.component';
import { GameListComponent } from 'src/app/components/game-list/game-list.component';
import { GamePlayComponent } from 'src/app/components/game-play/game-play.component';
import { AuthGuard } from 'src/app/common/guards/auth-guard/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'game',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'list',
        component: GameListComponent,
      },
      {
        path: ':gameId/play',
        component: GamePlayComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'game',
  },
  {
    path: '**',
    redirectTo: 'game',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
