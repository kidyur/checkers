const PLAYER_ONE = 'var(--pl-one)';
const PLAYER_TWO = 'var(--pl-two)';
const QUEEN = "5px solid var(--quenn)";
const SELECTED = 'var(--selected)';
const BLACK = 'var(--black-cell)';
const WHITE = 'var(--white-cell)';
const ACTIVE = 'board__cell board__cell--active';
const PASSIVE = 'board__cell board__cell--passive';

let board = [];
let selectedCells = [];
let player = PLAYER_TWO;
let opponent = PLAYER_ONE;

function hideSelected() {
	for (cell of selectedCells) {
		paint(cell, BLACK);
		board[cell.y][cell.x].className = PASSIVE;
	}
	selectedCells = [];
}

function getQueenCaptures(root, dir) {
	let xInc = 1, yInc = -1;
	let hor = "L", vert = "B";
	let enemy;
	let cells = [];
	if (dir[0] == "L") {
		xInc = -1;
		hor = "R";
	}
	if (dir[1] == "B") {
		yInc = 1;
		vert = "T";
	} 
	let i = root.y + yInc;
	let j = root.x + xInc;
	
	let enemiesPast = 0;
	let enemiesRow = 0;
	let selectAll = false;
	while (0 <= i && i < 8 && 0 <= j && j < 8) {
		const cell = {x: j, y: i};
		if (getColor(cell) == BLACK) {
			if (enemiesPast == 1) {
				cells.push(cell);
			} else if (enemiesPast == 2) {
				selectAll = true;
			}
			enemiesRow = 0;
		} else if (getColor(cell) == opponent) {
			enemiesRow++;
			enemiesPast++;
			if (enemiesPast == 1) enemy = cell;
		} else break;
		if (enemiesPast > 2 || enemiesRow == 2) break;
		i += yInc;
		j += xInc;
	}
	if (!selectAll) {
		let nextCaptures = [];
		for (cell of cells) {
			if (isQueenCapture(cell, dir[0] + vert) || 
				isQueenCapture(cell, hor + dir[1])) {
				nextCaptures.push(cell);
			}
		}
		if (nextCaptures.length) cells = nextCaptures;
	}
	return {enemy: enemy, cells: cells, name: dir};
}

function isQueenCapture(root, bannedDir='') {
	for (let x = -1; x < 2; x += 2) {
		for (let y = -1; y < 2; y += 2) {
			let dir = '';
			dir += (x < 0) ? 'L' : "R";
			dir += (y < 0) ? "T" : "B";
			if (dir == bannedDir) continue;
			let enemiesPast = 0
			let i = root.y + y;
			let j = root.x + x;
			while (0 <= i && i < 8 && 0 <= j && j < 8) {
				const cell = {x: j, y: i};
				if (getColor(cell) == BLACK) {
					if (enemiesPast == 1) {
						return true;
					}
				} else if (getColor(cell) == opponent) {
					enemiesPast++;
				} else if (getColor(cell) == player) {
					break;
				}
				if (enemiesPast == 2) break;
				i += y;
				j += x;
			}
		}
	}
	return false;
}

function getCaptures(root) {
	const cells = getBounded([
		{x: root.x-2, y: root.y-2},{x: root.x-2, y: root.y+2}, 
		{x: root.x+2, y: root.y-2},{x: root.x+2, y: root.y+2}
	]);
	const captures = cells.filter(cell => {
		const enemy = {
			x: (cell.x > root.x ? 1 : -1) + root.x, 
			y: (cell.y > root.y ? 1 : -1) + root.y
		};
		const isEnemy = getColor(enemy) == opponent;
		const isEmpty = getColor(cell) == BLACK;
		
		return isEnemy && isEmpty;
	});
	return captures;
}

function paint(cell, color) {
	board[cell.y][cell.x].style.backgroundColor = color;
}

function getColor(cell) {
	return board[cell.y][cell.x].style.backgroundColor;
}

function getBounded(arr) {
	arr = arr.filter(pos =>
		0 <= pos.x && pos.x < 8 &&
		0 <= pos.y && pos.y < 8
	);

	return arr
}

function showMoves(root, isQuenn) {
	hideSelected();
	let dirs = [];

	if (isQuenn) {
		for (let x = -1; x < 2; x += 2) {
			for (let y = -1; y < 2; y += 2) {
				let i = root.y + y;
				let j = root.x + x;
				while (0 <= i && i < 8 && 0 <= j && j < 8) {
					const cell = {x: j, y: i};
					if (getColor(cell) == BLACK) {
						dirs.push(cell);
						i += y;
						j += x;
					} else break;
				}
			}
		}
	} else {
		const incInd = player == PLAYER_ONE ? -1 : 1;
		dirs = getBounded([
			{x: root.x + 1, y: root.y + incInd}, 
			{x: root.x - 1, y: root.y + incInd}
		]);
	}
	for (cell of dirs) {
		if (getColor(cell) == BLACK) {
			select(cell, root); 
		}
	}
}

function deactivate(color) {
	for (let i = 0; i < 8; i++) {
		let j = i % 2 ? 0 : 1;
		for (; j < 8; j += 2) {
			const cell = {x: j, y: i};
			if (getColor(cell) == color) {
				board[i][j].className = PASSIVE;
			}
		}
	}
}

function select(cell, root, enemy=0, dir='all') {
	paint(cell, SELECTED);
	board[cell.y][cell.x].className = ACTIVE;
	selectedCells.push(cell);
	const ind = selectedCells.indexOf(cell);
	board[cell.y][cell.x].onclick = () => {
		let rootLevel = board[root.y][root.x].style.border;
		board[cell.y][cell.x].style.border = rootLevel;
		board[root.y][root.x].style.border = '';
		board[cell.y][cell.x].onclick = () => {};
		
		let isQuenn = board[cell.y][cell.x].style.border == QUEEN;
		if (player == PLAYER_ONE && cell.y == 0 || 
			player == PLAYER_TWO && cell.y == 7) {
			isQuenn = true;
			board[cell.y][cell.x].style.border = QUEEN;
		}
		
		selectedCells.splice(ind, 1);
		paint(root, BLACK);
		paint(cell, player);
		if (enemy) {
			paint(enemy, BLACK);
			board[enemy.y][enemy.x].style.border = '';
			if (isQuenn) {
				let back = "";
				back += (dir[0] == 'R') ? "L" : "R";
				back += (dir[1] == 'T') ? "B" : "T";
				const isNextCapture = isQueenCapture(cell, back);
				if (isNextCapture) {
					deactivate(player);
					showCaptures(cell, isQuenn, back);
					board[cell.y][cell.x].className = ACTIVE;
				} else switchPlayer();
 			} else {
				const isNextCapture = getCaptures(cell).length != 0;
				if (isNextCapture) {
					deactivate(player);
					showCaptures(cell);
					board[cell.y][cell.x].className = ACTIVE;
				} else switchPlayer();
			}
		} else switchPlayer();
	}
}

function showCaptures(root, isQuenn=false, back='') {
	hideSelected();
	
	if (isQuenn) {
		let dirs = [];
		for (hor of ['R', 'L']) {
			for (vert of ['T', 'B']) {
				const dir = hor + vert;
				if (dir != back) {
					dirs.push(getQueenCaptures(root, dir));
				}
			}
		}
		for (dir of dirs) {
			for (cell of dir.cells) {
				select(cell, root, dir.enemy, dir.name);
			}
		}
	} else {
		dirs = getCaptures(root);
		for (cell of dirs) {
			const enemy = {
				x: (cell.x > root.x ? 1 : -1) + root.x, 
				y: (cell.y > root.y ? 1 : -1) + root.y
			};
			select(cell, root, enemy);
		}
	}
}

function switchPlayer() {
	hideSelected();
	[player, opponent] = [opponent, player];
	
	let isCapture = false;
	LookingForCapture:
	for (let i = 0; i < 8; i++) {
		let j = i % 2 ? 0 : 1;
		for (; j < 8; j += 2) {
			const cell = {x: j, y: i};
			if (getColor(cell) == player) {
				const isQuenn = board[i][j].style.border == QUEEN; 
				if (isQuenn) {
					isCapture = isQueenCapture(cell);
				} else isCapture = getCaptures(cell).length == 1;
				
				if (isCapture) break LookingForCapture;
			}
		}
	} 

	for (let i = 0; i < 8; i++) {
		let j = i % 2 ? 0 : 1;
		for (; j < 8; j += 2) {
			const cell = {x: j, y: i};
			if (getColor(cell) == player) {
				board[i][j].className = ACTIVE;
				const isQuenn = board[i][j].style.border == QUEEN;
				if (isCapture) {
					board[i][j].onclick = () => showCaptures(cell, isQuenn);
				} else {
					board[i][j].onclick = () => showMoves(cell, isQuenn);
				}
			} else board[i][j].className = PASSIVE;
		}
	}
}

function resetGame() {
	for (let i = 0; i < 8; i++) {
		let j = i % 2 ? 0 : 1;
		for (; j < 8; j+=2) {
			const cell = {x: j, y: i};
			if (i < 3) {
				paint(cell, PLAYER_TWO);
			} else if (i > 4) {
				paint(cell, PLAYER_ONE);
			} else {
				paint(cell, BLACK);
			}
		}
	}
	switchPlayer();
}

function createBoard() {
	const table = document.getElementsByClassName("board")[0];
	for (let i = 0; i < 8; i++) {
		const line = document.createElement('div');
		line.className = "board__line";
		table.appendChild(line);
		board.push([]);
	}
	const lines = document.getElementsByClassName("board__line");
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			const cell = document.createElement('button');
			
			if ((i % 2 && j % 2) || (!(i % 2) && !(j % 2))) {
				cell.style.backgroundColor = WHITE;
				cell.className = PASSIVE;
			} else {
				cell.style.backgroundColor = BLACK;
				cell.className = ACTIVE;
			}
			
			lines[i].appendChild(cell);
			board[i].push(cell);
		}
	}
}

function start() {
	createBoard();
	resetGame();
}

start();
