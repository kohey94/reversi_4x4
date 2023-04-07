import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button 
          className="square" 
          onClick={props.onClick}
        >
          {props.value}
        </button>
      );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square 
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(7)}
          {this.renderSquare(8)}
          {this.renderSquare(9)}
          {this.renderSquare(10)}
        </div>
        <div className="board-row">
          {this.renderSquare(13)}
          {this.renderSquare(14)}
          {this.renderSquare(15)}
          {this.renderSquare(16)}
        </div>
        <div className="board-row">
          {this.renderSquare(19)}
          {this.renderSquare(20)}
          {this.renderSquare(21)}
          {this.renderSquare(22)}
        </div>
        <div className="board-row">
          {this.renderSquare(25)}
          {this.renderSquare(26)}
          {this.renderSquare(27)}
          {this.renderSquare(28)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    let s = Array(36).fill(null);
    s[14] = stone(true);
    s[21] = stone(true);
    s[15] = stone(false);
    s[20] = stone(false);
    this.state = {
        history: [{
            squares: s, 
        }],
        stepNumber: 0,
        xIsNext: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = stone(this.state.xIsNext);
    checkStone(this.state.xIsNext, i, squares);
    this.setState({
        history: history.concat([{
            squares: squares,
        }]),
        stepNumber: history.length,
        xIsNext: !this.state.xIsNext,
    });
  }
  jumpTo(step) {
    this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
        const desc = move ?
        'Go to move #' + move :
        'Go to game start';
        return (
            <li key={move}>
                <button onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
        )
    })
    let status;
    if (winner) {
      status = 'Winner: ' + winner;  
    } else {
      status = 'Next player: ' + stone(this.state.xIsNext);
    }
    let score1 = 'Black: ' + current.squares.filter(x => x === stone(true)).length;
    let score2 = 'White: ' + current.squares.filter(x => x === stone(false)).length;

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)} 
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>{score1}</div>
          <div>{score2}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  if (squares.filter(x => x === null).length > 20) {
    return null;
  }
  else if (squares.filter(x => x === stone(true)).length === squares.filter(x => x === stone(false)).length) {
    return 'Draw';
  }
  else if (squares.filter(x => x === stone(true)).length > squares.filter(x => x === stone(false)).length) {
    return 'Black Win';
  }
  else if (squares.filter(x => x === stone(true)).length < squares.filter(x => x === stone(false)).length) {
    return 'White Win';
  }
}

function stone(isNext) {
    if (isNext) {
        return '●';
    } else {
        return '○'
    }
}

function checkStone(isNext, putStoneIndex, squares) {
    const directionToCheck = [
        1, // right
        7, // lowerRight
        6, // down
        5, // lowerLeft
        -1, // left
        -7, // upperLeft
        -6, // up
        -5 // upperRight
    ];
    const edge = [0,1,2,3,4,5,6,11,12,17,18,23,24,29,30,31,32,33,34,35];
    console.log(putStoneIndex + ' に ' + squares[putStoneIndex] + ' 置いた');
    directionToCheck.forEach(element => {
        const currentCheckIndex = putStoneIndex + element
        const checkSquare = squares[currentCheckIndex];
        if (edge.includes(currentCheckIndex)) { // 端
            console.log('index: ' + currentCheckIndex + 'の値は ' + checkSquare + ' 端');
        }
        else if (!checkSquare) { // 空白
            console.log('index: ' + currentCheckIndex + 'の値は ' + checkSquare+ ' 空白');
        }
        else if (checkSquare === squares[putStoneIndex]) { // 同じ色
            console.log('index: ' + currentCheckIndex + 'の値は ' + checkSquare+ ' 置いた石と同じ色');
        }
        else if (!(checkSquare === squares[putStoneIndex])) { // 違う色
            console.log('index: ' + currentCheckIndex + 'の値は ' + checkSquare+ ' 置いた石と違う色[再帰処理へ]');
            turnOverStone(putStoneIndex, currentCheckIndex, squares, element, edge);
        }
    });

}

function turnOverStone(putStoneIndex, currentCheckIndex, squares, direction, edge) {
    const currentCheckIndex2 = currentCheckIndex + direction;
    const checkSquare = squares[currentCheckIndex2];
    
    if (!checkSquare) { // 空白
        console.log('currentCheckIndex2 ' + currentCheckIndex2 + ' の値は ' + checkSquare + ' 空白(再帰関数)');
        return;
    }
    else if (!(checkSquare === squares[putStoneIndex])) { // 置いた石と違う色
        console.log('currentCheckIndex2 ' + currentCheckIndex2 + ' の値は ' + checkSquare + ' 置いた石と違う色(再帰関数)');
        turnOverStone(putStoneIndex, currentCheckIndex2, squares, direction, edge);
    }
    else if (checkSquare === squares[putStoneIndex]) { // 置いた石と同じ色
        let index = putStoneIndex;
        console.log('turn over stone: currentCheckIndex2 ' + currentCheckIndex2 + ' checkSquare 置いた石と同じ色(再帰関数)');
        console.log('index ' + index + ' currentCheckIndex ' + currentCheckIndex + ' direction ' + direction);
        while(index !== currentCheckIndex) {
            index += direction;
            console.log(index);
            squares[index] = squares[putStoneIndex];
        }
        return;
    }
    else if (edge.includes(currentCheckIndex2)) { // 端
        console.log(currentCheckIndex2 + ' 端(再帰関数)');
        return;
    }
}