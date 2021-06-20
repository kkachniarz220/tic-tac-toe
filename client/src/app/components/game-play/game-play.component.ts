import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-game-play',
  templateUrl: './game-play.component.html',
  styleUrls: ['./game-play.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePlayComponent implements OnInit, OnDestroy {

  private _gameId = this._activatedRoute.snapshot.params.gameId;
  private _componentDestroyed$ = new Subject<void>();
  private _gameDetails$ = new BehaviorSubject<any>(null);
  readonly gameDetails$ = this._gameDetails$.asObservable();
  mySymbol: 'X' | 'O' | any = '';
  isMyTurn: boolean = false;
  userId = this._authService.user.id;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _socket: Socket,
    private _router: Router,
  ) { }

  ngOnInit() {
    this.initGame();
    this.initOnGameDetailsGetHandler();
  }

  ngOnDestroy() {
    this._componentDestroyed$.next();
    this._componentDestroyed$.complete();
  }

  private initGame() {
    this._socket.emit('game.play', { gameId: this._gameId });
  }

  private initOnGameDetailsGetHandler() {
    this._socket.fromEvent('game.play')
      .pipe(takeUntil(this._componentDestroyed$))
      .subscribe(this.onGameDetailsGet);
  }

  private onGameDetailsGet = (game: any) => {
    this.mySymbol = game.playerXId === this.userId ? 'X' : 'O';
    this._gameDetails$.next(game);
    this.isMyTurn = game.turn === this.mySymbol;
  };

  doBlink(position: any) {
    return this._gameDetails$.value.wonFields.includes(+position);
  }

  doMove(position: any) {
    const game = this._gameDetails$.value;
    console.log(position);
    if (this.isMyTurn && !game.board[position] && game.status === 'started') {
      this._socket.emit('move.make', { position, gameId: this._gameId, symbol: this.mySymbol });
    }
  }

  goTo(link: string) {
    this._router.navigateByUrl(link);
  }
}
