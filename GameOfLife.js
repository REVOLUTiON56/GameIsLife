class Game {
    constructor(canvas, width, height, cellSize, delay) {
        this.gameActive = false;

        this.cells = new Array(height);
        this.neighboursCountArray = new Array(height);
        for (var i = 0; i < height; i++) {
            this.cells[i] = new Array(width);
            this.neighboursCountArray[i] = new Array(width);
            for (var j = 0; j < width; j++) {
                this.cells[i][j] = new Cell(i, j);
                this.neighboursCountArray[i][j] = 0;
            }
        }

        this.board = new Board(canvas, width, height, cellSize, this.cells);
        this.board.clear();
        this._delay = delay;

        this.myInterval;

        var self = this;
        this.updateFunc = function () {
            if (!self.gameActive) return;
            self.step();
        };
    }

    get delay() {
        return this._delay;
    }

    set delay(newValue) {
        if (newValue < 50)
            newValue = 50;
        if (newValue > 3000)
            newValue = 3000;

        this._delay = newValue;
        if (this.gameActive) {
            clearInterval(this.myInterval);
            this.myInterval = setInterval(this.updateFunc, this._delay);
        }
    }

    step() {
        //calculate neigbours
        var i, j;
        for (i = 0; i < this.cells.length; i++) {
            for (j = 0; j < this.cells[i].length; j++) {
                this.neighboursCountArray[i][j] = this.calculateNeighboursCount(i, j);
            }
        }
        //change states
        for (i = 0; i < this.cells.length; i++) {
            for (j = 0; j < this.cells[i].length; j++) {
                var state = this.cells[i][j].state;
                if (state) {
                    //rule1
                    if (this.neighboursCountArray[i][j] < 2 || this.neighboursCountArray[i][j] > 3) {
                        this.cells[i][j].state = false;
                        this.board.print(this.cells[i][j]);
                    }

                    //rule2
                    if (this.neighboursCountArray[i][j] === 2 || this.neighboursCountArray[i][j] === 3)
                        this.cells[i][j].state = true;
                }
                else {
                    if (this.neighboursCountArray[i][j] === 3) {
                        this.cells[i][j].state = true;
                        this.board.print(this.cells[i][j]);
                    }
                }
            }
        }
    }

    calculateNeighboursCount(i, j) {
        var count = 0;

        var start = {
            x: i > 0 ? i - 1 : 0,
            y: j > 0 ? j - 1 : 0
        };

        var end = {
            x: i < this.cells.length - 1 ? i + 1 : this.cells.length - 1,
            y: j < this.cells[i].length - 1 ? j + 1 : this.cells[i].length - 1
        };

        for (var m = start.x; m <= end.x; m++) {
            for (var n = start.y; n <= end.y; n++) {
                if (m === i && n === j) continue;
                if (this.cells[m][n].state)
                    count++;

                if (count >= 4) break;
            }
        }

        return count;
    }

    start() {
        if (this.gameActive) return false;
        console.log("Game started");

        this.gameActive = true;
        this.myInterval = setInterval(this.updateFunc, this.delay);

        return false;
    }

    pause() {
        if (!this.gameActive) return false;
        console.log("Game paused");

        this.gameActive = false;
        clearInterval(this.myInterval);
        return false;
    }

    reset() {
        this.gameActive = false;
        clearInterval(this.myInterval);

        this.clear();
        this.board.clear();
        return false;
    }

    fillRandom() {
        if (this.gameActive) return false;
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells[i].length; j++) {
                this.cells[i][j].state = Math.random() >= 0.5;
            }
        }

        this.board.print();
        return false;
    }

    clear() {
        for (var i = 0; i < this.cells.length; i++) {
            for (var j = 0; j < this.cells[i].length; j++) {
                this.cells[i][j].state = false;
            }
        }
    }
}

class Board {
    constructor(canvas, width, height, cellSize, cells) {
        this.width = width;
        this.height = height;

        this.canvas = canvas;
        this.canvas.width = cellSize * width;
        this.canvas.height = cellSize * height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.cellSize = cellSize;

        this.cells = cells;

        var clicking = false;

        var self = this;

        this.mouseHandlerDown = function () {
            clicking = true;
        };

        this.mouseHandlerUp = function (event) {
            var pos = getMousePos(self.canvas, event);

            var i = Math.floor(pos.x / self.ctx.cellSize);
            var j = Math.floor(pos.y / self.ctx.cellSize);

            self.cells[i][j].state = !self.cells[i][j].state;

            self.print(self.cells[i][j]);

            clicking = false;
        };

        this.mouseHandlerMove = function (event) {
            if (clicking === false) return;
            var pos = getMousePos(self.canvas, event);

            var i = Math.floor(pos.x / self.ctx.cellSize);
            var j = Math.floor(pos.y / self.ctx.cellSize);

            if (self.cells[i][j].state) return;
            self.cells[i][j].state = true;

            self.print(self.cells[i][j]);
        };

        this.canvas.addEventListener('mousedown', this.mouseHandlerDown);

        this.canvas.addEventListener('mouseup', this.mouseHandlerUp);

        this.canvas.addEventListener('mousemove', this.mouseHandlerMove);


        function getMousePos(c, evt) {
            var rect = c.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }
    }

    print(cell) {
        if (typeof cell === "undefined") {
            this.clear();

            for (var i = 0; i < this.cells.length; i++) {
                for (var j = 0; j < this.cells[i].length; j++) {
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeStyle = 'lightblue';
                    this.ctx.fillStyle = this.cells[i][j].state ? "black" : "white";
                    this.ctx.fillRect(this.cells[i][j].x * this.ctx.cellSize, this.cells[i][j].y * 

this.ctx.cellSize, this.ctx.cellSize, this.ctx.cellSize);
                    this.ctx.strokeRect(this.cells[i][j].x * this.ctx.cellSize, this.cells[i][j].y * 

this.ctx.cellSize, this.ctx.cellSize, this.ctx.cellSize);
                }
            }
        }
        else {
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'lightblue';
            this.ctx.fillStyle = cell.state ? "black" : "white";
            this.ctx.fillRect(cell.x * this.ctx.cellSize, cell.y * this.ctx.cellSize, this.ctx.cellSize, 

this.ctx.cellSize);
            this.ctx.strokeRect(cell.x * this.ctx.cellSize, cell.y * this.ctx.cellSize, this.ctx.cellSize, 

this.ctx.cellSize);
        }
    }

    clear() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'lightblue';
        var i = 0;
        for (i = 0; i <= this.width; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.ctx.cellSize, 0);
            this.ctx.lineTo(i * this.ctx.cellSize, this.canvas.height);
            this.ctx.stroke();
        }

        for (i = 0; i <= this.height; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.ctx.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.ctx.cellSize);
            this.ctx.stroke();
        }
    }
}

class Cell {
    constructor(x, y, state = false, age = 0) {
        this.state = state;
        this.x = x;
        this.y = y;
        this.age = age;
    }
}
