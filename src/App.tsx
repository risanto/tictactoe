import { useCallback, useEffect, useState } from "react";

function App() {
  const [boardSize, setboardSize] = useState(3);
  const [currentPlayer, setcurrentPlayer] = useState("X");
  const [moves, setmoves] = useState(0);
  const [board, setboard] = useState<string[]>([]);
  const [endText, setendText] = useState("");

  const startGame = useCallback(() => {
    setboard(Array(boardSize ** 2).fill(""));
    setendText("");
    setmoves(0);
  }, [boardSize]);

  useEffect(() => {
    startGame();
  }, [boardSize, startGame]);

  useEffect(() => {
    if (moves === boardSize ** 2) {
      setendText(`IT'S A DRAW`);
    }
  }, [moves, boardSize]);

  const [diagonalLeftIdxToCheck, setdiagonalLeftIdxToCheck] = useState<
    number[]
  >([]);
  const [diagonalRightIdxToCheck, setdiagonalRightIdxToCheck] = useState<
    number[]
  >([]);

  useEffect(() => {
    const generateDiagonalIdx = () => {
      const topLeft = 0;
      const topRight = topLeft + boardSize - 1;

      const leftIdx = [topLeft];
      const rightIdx = [topRight];

      for (let i = 0; i < board.length; i++) {
        const leftNextIdx = leftIdx.at(-1)! + boardSize + 1;
        const rightNextIdx = rightIdx.at(-1)! + boardSize - 1;

        if (i === leftNextIdx) {
          leftIdx.push(leftNextIdx);
        }
        if (i === rightNextIdx && i !== board.length - 1) {
          rightIdx.push(rightNextIdx);
        }
      }

      setdiagonalLeftIdxToCheck(leftIdx);
      setdiagonalRightIdxToCheck(rightIdx);
    };

    if (boardSize && board.length) {
      generateDiagonalIdx();
    }
  }, [boardSize, board.length]);

  const getRow = (idx: number) => {
    const rowStartIdx = [0];

    for (let i = 0; i < boardSize; i++) {
      rowStartIdx.push(rowStartIdx.at(-1)! + boardSize);
    }

    let row = 0;

    for (let i = 0; i < rowStartIdx.length; i++) {
      if (idx < rowStartIdx[i]) break;
      row = i;
    }

    return row;
  };

  const getCol = (idx: number) => {
    return idx < boardSize ? idx : idx % boardSize;
  };

  const isHorizontalWin = (row: number, board: string[]) => {
    const startIdx = row * boardSize;

    let player = board[startIdx];

    if (!player.length) return false;

    for (let i = startIdx + 1; i < startIdx + boardSize; i++) {
      if (player !== board[i]) return false;
      player = board[i];
    }

    return true;
  };

  const isVerticalWin = (col: number, board: string[]) => {
    let player = board[col];

    if (!player.length) return false;

    for (let i = col + boardSize; i < board.length; i += boardSize) {
      if (player !== board[i]) return false;
      player = board[i];
    }

    return true;
  };

  const isDiagonalWin = (idx: number, board: string[]) => {
    let win = false;

    leftCheck: if (diagonalLeftIdxToCheck.includes(idx)) {
      let leftPlayer = board[0];

      for (let i = 1; i < diagonalLeftIdxToCheck.length; i++) {
        const currentIdx = diagonalLeftIdxToCheck[i];

        if (!leftPlayer || leftPlayer !== board[currentIdx]) {
          break leftCheck;
        }
        leftPlayer = board[currentIdx];
      }

      win = true;
    }

    rightCheck: if (win === false && diagonalRightIdxToCheck.includes(idx)) {
      let rightPlayer = board[diagonalRightIdxToCheck[0]];

      for (let i = 1; i < diagonalRightIdxToCheck.length; i++) {
        const currentIdx = diagonalRightIdxToCheck[i];

        if (!rightPlayer || rightPlayer !== board[currentIdx]) {
          break rightCheck;
        }
        rightPlayer = board[currentIdx];
      }

      win = true;
    }

    return win;
  };

  const checkWin = (idx: number, newBoard: string[]) => {
    const row = getRow(idx);
    const col = getCol(idx);

    if (
      isHorizontalWin(row, newBoard) ||
      isVerticalWin(col, newBoard) ||
      isDiagonalWin(idx, newBoard)
    ) {
      setendText(`${currentPlayer} WON!`);
    }
  };

  const handleClick = (idx: number) => {
    if (board[idx] || endText.length) return;

    const newBoard = [...board];
    newBoard[idx] = currentPlayer;

    setcurrentPlayer(currentPlayer === "X" ? "O" : "X");
    setboard(newBoard);
    setmoves(moves + 1);

    if (moves > 3) {
      checkWin(idx, newBoard);
    }
  };

  return (
    <main className="flex-col flex-center min-h-screen pb-10 pt-6">
      <h1 className="text-2xl font-extrabold">
        Tic Tac Toe ({boardSize} x {boardSize})
      </h1>

      <input
        type="range"
        value={boardSize}
        min={3}
        max={10}
        onChange={(e) => {
          setboardSize(+e.target.value);
        }}
        className="mt-4 w-52 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />

      <div
        className={"grid gap-1 mt-4"}
        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
      >
        {board.map((el, idx) => (
          <div
            key={idx}
            onClick={() => {
              handleClick(idx);
            }}
            className="w-16 h-16 border border-black hover:cursor-pointer flex-center text-5xl"
          >
            {el}
          </div>
        ))}
      </div>

      {endText.length ? (
        <div className="text-center mt-2">
          <h1 className="text-xl">{endText}</h1>
          <button
            onClick={startGame}
            className="mt-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          >
            Play again
          </button>
        </div>
      ) : null}
    </main>
  );
}

export default App;
