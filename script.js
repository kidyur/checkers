const PLAYER_ONE = 'var(--pl-one)';
const PLAYER_TWO = 'var(--pl-two)';
const QUEEN = "5px solid var(--quenn)";
const SELECTED = 'var(--selected)';
const BLACK = 'var(--black-cell)';
const WHITE = 'var(--white-cell)';

let grid = [];
let selectedCells = [];
let player = PLAYER_TWO;
let opponent = PLAYER_ONE;

const gridEl = document.createElement('div');
gridEl.className = 'grid';
document.body.appendChild(gridEl);

class Cell {
	ref; x; y;

	constructor(r, x, y) {
		this.ref = r;
		this.x = x;
		this.y = y;
	}

	get color() {
		return this.ref.style.backgroundColor;
	}
	set color(bgcolor) {
		this.ref.style.backgroundColor = bgcolor;
	}
	
	set active(state) {
		if (state) {
			this.ref.style.pointerEvents = "all";
			this.ref.style.boxShadow = "0 0 10px 0 black";
		}
		else {
			this.ref.style.pointerEvents = "none";
			this.ref.style.boxShadow = "none";
		}
	}
}

function hideSelected() {
	for (cell of selectedCells) {
		cell.color = BLACK;
		cell.active = false;
	}
	selectedCells = [];
}

function getQueenCaptures(root, dir) {
	let xInc = 1, yInc = -1;
	let back = "LB";
	let enemy;
	let cells = [];
	if (dir[0] == "L") {
		xInc = -1;
		back[0] = "R";
	}
	if (dir[1] == "B") {
		yInc = 1;
		back[0] = "T";
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
			if (isQueenCapture(cell, [dir, back])) {
				nextCaptures.push(cell);
			}
		}
		if (nextCaptures.length) cells = nextCaptures;
	}
	return {enemy: enemy, cells: cells, name: dir};
}

function isQueenCapture(root, bannedDirs=['', '']) {
	for (let x = -1; x < 2; x += 2) {
		for (let y = -1; y < 2; y += 2) {
			let dir = '';
			dir += (x < 0) ? 'L' : "R";
			dir += (y < 0) ? "T" : "B";
			if (dir == bannedDirs[0] || dir == bannedDirs[1]) continue;
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
		const isEnemy = grid[(cell.x > root.x ? 1 : -1) + root.x][(cell.y > root.y ? 1 : -1) + root.y].color == opponent;
		const isEmpty = grid[cell.y][cell.x] == BLACK;
		
		return isEnemy && isEmpty;
	});
	return captures;
}

function getBounded(arr) {
	arr = arr.filter(pos =>
		0 <= pos.x && pos.x < 8 &&
		0 <= pos.y && pos.y < 8
	);

	return arr
}

function showMoves(root) {
	hideSelected();
	let dirs = [];

	if (root.level == 2) {
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
		console.log(cell)
		if (cell.color == BLACK) {
			select(cell, root); 
		}
	}
}

function deactivate(color) {
	for (let i = 0; i < 8; i++) {
		for (let j = !(i % 2); j < 8; j += 2) {
			if (grid[i][j].color == color) {
				grid[i][j].active = false;
			}
		}
	}
}

function select(cell, root, enemy=0, dir='all') {
	cell.color = SELECTED
	grid[cell.y][cell.x].active = true;
	selectedCells.push(grid[cell.y][cell.x]);
	const ind = selectedCells.indexOf(cell);
	grid[cell.y][cell.x].onclick = () => {
		let rootLevel = grid[root.y][root.x].style.border;
		grid[cell.y][cell.x].style.border = rootLevel;
		grid[root.y][root.x].style.border = '';
		grid[cell.y][cell.x].onclick = () => {};
		
		let isQuenn = grid[cell.y][cell.x].level == 2;
		if (player == PLAYER_ONE && cell.y == 0 || 
			player == PLAYER_TWO && cell.y == 7) {
			isQuenn = true;
			grid[cell.y][cell.x].style.border = QUEEN;
		}
		
		selectedCells.splice(ind, 1);
		paint(root, BLACK);
		paint(cell, player);
		if (enemy) {
			paint(enemy, BLACK);
			grid[enemy.y][enemy.x].style.border = '';
			if (isQuenn) {
				let back = "";
				back += (dir[0] == 'R') ? "L" : "R";
				back += (dir[1] == 'T') ? "B" : "T";
				const isNextCapture = isQueenCapture(cell, back);
				if (isNextCapture) {
					deactivate(player);
					showCaptures(cell, isQuenn, back);
					grid[cell.y][cell.x].className = ACTIVE;
				} else switchPlayer();
 			} else {
				const isNextCapture = getCaptures(cell).length != 0;
				if (isNextCapture) {
					deactivate(player);
					showCaptures(cell);
					grid[cell.y][cell.x].className = ACTIVE;
				} else switchPlayer();
			}
		} else switchPlayer();
	}
}

function showCaptures(root, back='') {
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
		for (let j = !(i % 2) - 0; j < 8; j += 2) {
			if (grid[i][j].color == player) {
				const isQuenn = grid[i][j].level == 2; 
				if (isQuenn) {
					isCapture = isQueenCapture(grid[i][j]);
				} 
				else {
					isCapture = getCaptures(grid[i][j]).length == 1;
				}
				
				if (isCapture) break LookingForCapture;
			}
		}
	} 

	for (let i = 0; i < 8; i++) {
		for (let j = !(i % 2) - 0; j < 8; j += 2) {
			if (grid[i][j].color == player) {
				grid[i][j].active = true;
				const isQuenn = grid[i][j].level == 2;
				if (isCapture) {
					grid[i][j].onclick = () => showCaptures(grid[i][j], isQuenn);
				} else {
					grid[i][j].onclick = () => showMoves(grid[i][j], isQuenn);
				}
			} else grid[i][j].active = false;
		}
	}
}

function resetGame() {
	for (let i = 0; i < 8; i++) {
		for (let j = !(i % 2) - 0; j < 8; j+=2) {
			if (i < 3) grid[i][j].color = PLAYER_TWO;
			else if (i > 4) grid[i][j].color = PLAYER_ONE;
			else grid[i][j].color = BLACK;
		}
	}
	switchPlayer();
}

function createGrid() {
	for (let i = 0; i < 8; i++) {
		const line = document.createElement("div");
		line.className = "line";
		gridEl.appendChild(line);
		grid.push([]);
		for (let j = 0; j < 8; j++) {
			const cellEl = document.createElement("button");
			const cell = new Cell(cellEl, j, i);
			cellEl.className = "cell";
			if ((i % 2 && j % 2) || (!(i % 2) && !(j % 2))) {
				cell.color = WHITE;
				cellEl.active = false;
			} 
			else {
				cell.color = BLACK;
				cellEl.active = true;
			}
			line.appendChild(cellEl);
			grid[i].push(cell);
		}
	}
}

function start() {
	createGrid();
	resetGame();
}

start();
