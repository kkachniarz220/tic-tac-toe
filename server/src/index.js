const app = require('express')();
const server = require('http').Server(app).listen(4444);
const io = require('socket.io')(server, {
	cors: {
		origin: 'http://localhost:4201',
		credentials: true,
	}
});
const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize('tictactoe', 'root', '321321', {
	host: 'localhost',
	dialect: 'mysql',
});

sequelize.authenticate().then(() => {
	console.log('connection established');
})
	.catch(err => console.log(err))

const User = sequelize.define('User', {
	id: {
		type: DataTypes.UUID,
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true,
	},
	nickname: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
	}
})

const Game = sequelize.define('Game', {
	id: {
		type: DataTypes.UUID,
		defaultValue: Sequelize.UUIDV4,
		primaryKey: true,
	},
	playerXId: {
		type: DataTypes.UUID,
	},
	playerOId: {
		type: DataTypes.UUID,
	},
	status: {
		type: DataTypes.ENUM,
		values: ['finished', 'started', 'draw'],
	},
	wonPlayerId: {
		type: DataTypes.UUID,
	},
	moves: {
		type: DataTypes.JSON,
		defaultValue: [],
	},
	board: {
		type: DataTypes.JSON,
		defaultValue: {
			0: '',
			1: '',
			2: '',
			3: '',
			4: '',
			5: '',
			6: '',
			7: '',
			8: '',
		}
	},
	turn: {
		type: DataTypes.ENUM,
		values: ['X', 'O'],
	},
	wonFields: {
		type: DataTypes.JSON,
		defaultValue: []
	}
})

const sync = async () => {
	await sequelize.sync({ force: false });
};
sync();

const tryToLogin = async (nickname) => {
	return (await User.findOrCreate({ where: { nickname } }))[0]
};

const createGame = async (firstPlayerId, secondPlayerId) => {
	return await Game.create({
		playerXId: firstPlayerId,
		playerOId: secondPlayerId,
		status: 'started',
		turn: 'X',
	})
}

const findGame = async (gameId) => {
	return await Game.findOne({ where: { id: gameId } });
}

const emitUserGames = async (activeUser) => {
	let rawGames = await Game.findAll({
		where: {
			[Op.or]: [
				{ playerXId: activeUser.user.id },
				{ playerOId: activeUser.user.id },
			]
		},
		order: [['createdAt', 'DESC']]
	})

	const games = await Promise.all(rawGames.map(async game => {
		const opponent = await User.findOne({
			where: {
				id: activeUser.user.id === game.playerOId ? game.playerXId : game.playerOId,
			}
		});
		game.setDataValue('opponent', opponent.nickname);
		return game;
	}))
	await activeUser.socket.emit('game.my.list', games);
}

const getConnectionByUserId = (userId) => {
	const socketId = Object.keys(activeUsers).find(socketId => {
		return activeUsers[socketId].user.id === userId;
	})
	return activeUsers[socketId];
}

const activeConnections = {};
const activeUsers = {};
const activeGames = {};

const addClientConnection = socket => {
	console.log('New connection', socket.id);
	activeConnections[socket.id] = socket;
};

const onDisconnect = socket => {
	console.log('Client disconnected', socket.id);
	delete activeConnections[socket.id];
	delete activeUsers[socket.id];
};

io.on('connection', socket => {
	addClientConnection(socket);

	socket.on('disconnect', () => {
		onDisconnect(socket);
		socket.broadcast.emit('clientdisconnect', socket.id);
		emitActiveUsersList();
	});

	socket.on('login', ({ nickname }) => {
		tryToLogin(nickname)
			.then((user) => {
				activeUsers[socket.id] = { user, socket }
				socket.emit('login', { success: true, user: { nickname: user.nickname, id: user.id } })
				emitActiveUsersList();
				emitUserGames(activeUsers[socket.id]);
			})
			.catch(socket.emit('login', { success: false }))
	})

	socket.on('logout', () => {
		delete activeUsers[socket.id];
		emitActiveUsersList();
	})

	socket.on('game.create', ({ opponentId }) => {
		createGame(activeUsers[socket.id].user.id, opponentId)
			.then(() => {
				emitUserGames(activeUsers[socket.id]);
				const opponent = getConnectionByUserId(opponentId);
				emitUserGames(opponent);
			})
	})

	socket.on('game.play', async ({ gameId }) => {
		const game = await findGame(gameId);
		activeGames[gameId] = { game }
		socket.emit('game.play', game);
	})

	socket.on('move.make', async ({ position, gameId, symbol }) => {
		const game = await findGame(gameId);
		const moves = game.moves;
		const board = game.board;
		if (game.status === 'started' && !board[position]) {
			moves.push({ position, symbol })
			board[position] = symbol;
			game.turn = symbol === 'X' ? 'O' : 'X';
			if (moves.length >= 4) {
				const gameResult = handleGameResult(game.board);
				if (gameResult.wonSymbol) {
					game.wonPlayerId = game[`player${ gameResult.wonSymbol }Id`];
					game.status = 'finished';
					game.wonFields = gameResult.wonFields;
				}
			}

			if (moves.length === 9 && game.status === 'started') game.status = 'draw'

			await Game.update({
				moves,
				board,
				turn: game.turn,
				wonPlayerId: game.wonPlayerId,
				status: game.status,
				wonFields: game.wonFields,
			}, { where: { id: gameId } })
			socket.emit('game.play', game);
			Object.keys(activeUsers).some(socketId => {
				if (activeUsers[socketId].user.id === game[`player${ symbol === 'O' ? 'X' : 'O' }Id`]) {
					activeUsers[socketId].socket.emit('game.play', game);
					emitUserGames(activeUsers[socket.id]);
					emitUserGames(activeUsers[socketId]);
					return true;
				}
			})
		}
	})
});

const emitActiveUsersList = () => {
	const users = Object.keys(activeUsers).map(socketId => activeUsers[socketId].user);
	Object.keys(activeUsers).forEach((socketId) => {
		activeUsers[socketId].socket.emit('active-users.list', { users })
	})
}

const winningConditions = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];

const handleGameResult = (board) => {
	let wonSymbol;
	let wonFields;
	winningConditions.some(winConditions => {
		let a = board[winConditions[0]];
		let b = board[winConditions[1]];
		let c = board[winConditions[2]];
		if (a === b && b === c) {
			wonSymbol = a;
			wonFields = winConditions;
			return true;
		}
	})

	return { wonSymbol, wonFields };
}
