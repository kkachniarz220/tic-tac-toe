import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/core/services/socket/socket.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  user$ = this._authService.user$;
  activeUsers$ = this._socketService.activeUsers$;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _socketService: SocketService,
  ) { }

  inviteToGame(user: any) {
    this._socketService.createGame(user);
  }

  logout() {
    this._authService.logout();
  }
}
