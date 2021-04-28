import React, { Component } from 'react';
import './snake.css';

export default class Snake extends Component {
    state = {
        speed: 200,
        rows: 25,
        cols: 25,
        grid: [],
        apple: {},
        snake: {
            head: {},
            tail: [],
        },
        currentDirection: 'bottom',
        died: false,
        score: 0,
        scoreFactor: 10,
        level: 1,
        lastScoreup: 0,
    };

    constructor(props) {
        super(props);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    getRandomGrid() {
        return {
            row: Math.floor((Math.random() * this.state.rows)),
            col: Math.floor((Math.random() * this.state.cols))
        }
    }

    getCenterOfGrid() {
        return {
            row: Math.floor((this.state.rows - 1) / 2),
            col: Math.floor((this.state.cols - 1) / 2),
        }
    }

    resetGrid(state = {}, sendBack = false) {

        if (!Object.keys(state).length) {
            state = this.state;
        }

        const grid = [];
        const {
            rows,
            cols,
            apple,
            snake
        } = state;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const isApple = (apple.row === row && apple.col === col);
                const isHead = (snake.head.row === row && snake.head.col === col);
                let isTail = false;
                snake.tail.forEach(t => {
                    if (t.row === row && t.col === col) {
                        isTail = true;
                    }
                })

                grid.push({
                    row,
                    col,
                    isApple,
                    isHead,
                    isTail,
                })
            }
        }

        if (sendBack) {
            return grid;
        } else {
            this.setState({
                grid
            })
        }
    }

    gameTick() {
        this.setState((state) => {
            let {
                currentDirection,
                snake,
                apple
            } = state;
            let died = false;


            let {
                tail
            } = snake;
            console.log(tail)

            const {
                row,
                col
            } = state.snake.head;
            let head = {
                row,
                col
            };

            if (state.died) {
                clearInterval(window.fnInterval);
            }

            tail.unshift({
                row: head.row,
                col: head.col,
            })

            if (head.row === state.apple.row && head.col === state.apple.col) {
                apple = this.getRandomGrid();
            } else {
                tail.pop();
            }

            for (let count = 1; count < tail.length; count++) {
                if (head.row === tail[count].row && head.col === tail[count].col) {
                    died = true;
                }
            }

            if (this.state.score !== this.state.lastScoreup && this.state.score % 100 === 0) {
                this.levelUp();
            }

            switch (currentDirection) {
                case 'left':
                    head.col--;
                    break;

                case 'up':
                    head.row--;
                    break;

                case 'down':
                    head.row++;
                    break;

                case 'right':
                default:
                    head.col++;
                    break;
            }

            const newState = {
                ...state,
                apple,
                snake: {
                    head,
                    tail
                }
            }

            if (newState.snake.head.row < 0 ||
                newState.snake.head.row >= this.state.rows ||
                newState.snake.head.col < 0 ||
                newState.snake.head.col >= this.state.rows
            ) {
                died = true;
            }

            const grid = this.resetGrid(newState, true);
            const score = (newState.snake.tail.length / 2) * newState.scoreFactor;

            return {
                ...newState,
                died,
                grid,
                score,
            }
        });

    }

    handleKeyPress(e) {
        let {
            currentDirection
        } = this.state;

        switch (e.keyCode) {
            case 37:
                currentDirection = 'left';
                break;

            case 38:
                currentDirection = 'up';
                break;

            case 39:
            default:
                currentDirection = 'right';
                break;

            case 40:
                currentDirection = 'down';
                break;
        }

        const newState = {
            ...this.state,
            currentDirection,
        }
        const grid = this.resetGrid(newState, true);


        this.setState(state => {
            return {
                ...newState,
                grid
            }
        })
    }

    levelUp() {
        this.setState((state) => {


            const newState = {
                ...state,
                speed: this.state.speed - 20,
            };
            const grid = this.resetGrid(newState, true);
            const newLevel = this.state.level + 1;
            return {
                ...newState,
                grid,
                level: newLevel,
                lastScoreup: this.state.score
            }
        });
    }

    resetGame() {
        this.setState((state) => {
            const newState = {
                ...state,
                apple: this.getRandomGrid(),
                snake: {
                    head: this.getRandomGrid(),
                    tail: [],
                },
                died: false,
                score: 0,
                currentDirection: 'bottom',
            };
            const grid = this.resetGrid(newState, true);
            return {
                ...newState,
                grid,
            }
        });

        window.fnInterval = setInterval(() => {
            this.gameTick();
        }, this.state.speed);
    }

    componentDidMount() {

        document.body.addEventListener('keydown', this.handleKeyPress);

        this.setState((state) => {
            const newState = {
                ...state,
                apple: this.getRandomGrid(),
                snake: {
                    head: this.getCenterOfGrid(),
                    tail: state.snake.tail
                }
            };
            const grid = this.resetGrid(newState, true);
            return {
                ...newState,
                grid,
            }
        });

        this.resetGrid();

        // Set tick
        window.fnInterval = setInterval(() => {
            this.gameTick();
        }, this.state.speed);
    }

    componentWillUnmount() {
        document.body.removeEventListener('keydown', this.handleKeyPress);
        clearInterval(window.fnInterval);
    }

    render() {
        let gridContent = this.state.grid.map((grid) => {
            return <div
                key={grid.row.toString() + '-' + grid.col.toString()}
                className={
                    grid.isHead
                        ? 'gridItem is-head' : grid.isTail
                            ? 'gridItem is-tail' : grid.isApple
                                ? 'gridItem is-apple' : 'gridItem'
                }></div>
        });
        if (this.state.died) {
            gridContent = <div className="grid-message">
                <h1>Game Over</h1>
            </div>;
        };
        return (
            <div className="snake-container wrapper">
                <div className="grid-header">
                    <h1>Score : {this.state.score}</h1>
                </div>
                <div><h1>
                    lvl: {this.state.level}</h1></div>
                <div className="grid">{gridContent}</div>
                <button className="resetButton" onClick={() => this.resetGame()}>Recomeçar</button>
            </div>
        );
    }
}