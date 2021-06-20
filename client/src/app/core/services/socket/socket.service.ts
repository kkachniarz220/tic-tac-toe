import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private _activeUsers$ = new BehaviorSubject<any>(null);
  private _myGames$ = new BehaviorSubject<any>(null);

  public activeUsers$ = this._activeUsers$.asObservable();
  public myGames$ = this._myGames$.asObservable();

  constructor(
    private _socket: Socket,
    private _snackBar: MatSnackBar,
    private _authService: AuthService,
  ) { }

  async initialize() {
    this.initActiveUsersChangeHandler();
    this.initMyGamesGetHandler();
    this.initInvitationGetHandler();
  }

  public createGame(user: any) {
    this._socket.emit('game.create', { opponentId: user.id });
  }

  private initActiveUsersChangeHandler() {
    this._socket.fromEvent('active-users.list')
      .subscribe(this.onActiveUsersGet);
  }

  private initMyGamesGetHandler() {
    this._socket.fromEvent('game.my.list')
      .subscribe(this.onMyGamesListGet);
  }

  private initInvitationGetHandler() {
    this._socket.fromEvent('invitation.get')
      .subscribe(this.onInvitationGet);
  }

  private onActiveUsersGet = (activeUsers: any) => {
    const users = activeUsers.users.filter((user: { id: string; }) => user.id !== this._authService.user.id);
    this._activeUsers$.next(users);
  };

  private onMyGamesListGet = (games: any) => {
    this._myGames$.next(games);
    console.log(games);
  };

  private onInvitationGet = () => {

  };

}
