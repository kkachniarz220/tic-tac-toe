import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { LayoutComponent } from './core/layout/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { SocketService } from 'src/app/core/services/socket/socket.service';
import { UserListComponent } from './components/home/user-list/user-list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { GameListComponent } from './components/game-list/game-list.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';

const config: SocketIoConfig = { url: 'http://localhost:4444', options: { transport: ['websocket'] } };

export function appInitializerFactory(
  authService: AuthService,
  socketService: SocketService,
) {
  return () => {
    return new Promise(async (resolve, reject) => {
      await authService.initialize()
      await socketService.initialize();
      Promise.resolve()
        .then(resolve)
        .catch(reject);
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HomeComponent,
    UserListComponent,
    GameListComponent,
    GamePlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    MatCardModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    MatTableModule,
    MatIconModule,
    MatSortModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [
        AuthService,
        SocketService,
      ],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
