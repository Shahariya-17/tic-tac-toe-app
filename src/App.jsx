import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/Button";


const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// maps cell index to relative center coordinates for SVG line (0..2 grid)
const CELL_COORDS = [
  [0.17, 0.17], [0.5, 0.17], [0.83, 0.17],
  [0.17, 0.5],  [0.5, 0.5],  [0.83, 0.5],
  [0.17, 0.83], [0.5, 0.83], [0.83, 0.83],
];

const emptyBoard = () => Array(9).fill(null);

const calculateWinnerWithLine = (squares) => {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  if (squares.every((s) => s)) return { winner: "Draw", line: null };
  return { winner: null, line: null };
};

// Minimax for 'O' (AI) as maximizing player by score (O wins positive)
const minimax = (board, isMaximizing) => {
  const { winner } = calculateWinnerWithLine(board);
  if (winner === "O") return { score: 10 };
  if (winner === "X") return { score: -10 };
  if (winner === "Draw") return { score: 0 };

  const available = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);

  if (isMaximizing) {
    let best = { score: -Infinity, index: null };
    for (const idx of available) {
      board[idx] = "O";
      const result = minimax(board, false);
      board[idx] = null;
      if (result.score > best.score) best = { score: result.score, index: idx };
    }
    return best;
  } else {
    let best = { score: Infinity, index: null };
    for (const idx of available) {
      board[idx] = "X";
      const result = minimax(board, true);
      board[idx] = null;
      if (result.score < best.score) best = { score: result.score, index: idx };
    }
    return best;
  }
};

export default function App() {
  const [board, setBoard] = useState(emptyBoard());
  const [isXNext, setIsXNext] = useState(true);
  const [mode, setMode] = useState("menu"); 
  const [aiLevel, setAiLevel] = useState("hard"); 
  const [aiThinking, setAiThinking] = useState(false);
  const [winnerData, setWinnerData] = useState({ winner: null, line: null });
  const [history, setHistory] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);

  // check winner on board change
  useEffect(() => {
    const res = calculateWinnerWithLine(board);
    setWinnerData(res);
  }, [board]);

  // handle AI move when mode === "ai" and it's O's turn (isXNext === false)
  useEffect(() => {
    const playAI = async () => {
      if (mode !== "ai") return;
      if (winnerData.winner) return;
      // AI plays as O only when it's O's turn (isXNext === false)
      if (!isXNext) {
        setAiThinking(true);
        await new Promise((r) => setTimeout(r, aiLevel === "easy" ? 500 : 700)); // small delay for UX

        let moveIndex;
        const available = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);

        if (aiLevel === "easy") {
          // random
          moveIndex = available[Math.floor(Math.random() * available.length)];
        } else {
          // hard -> minimax
          const copy = [...board];
          const best = minimax(copy, true); // AI as maximizing
          moveIndex = best.index ?? available[Math.floor(Math.random() * available.length)];
        }

        if (typeof moveIndex === "number") {
          makeMove(moveIndex);
        }
        setAiThinking(false);
      }
    };

    playAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isXNext, mode, aiLevel, winnerData, board]);

  const makeMove = (index) => {
    if (board[index] || winnerData.winner || aiThinking) return;
    const player = isXNext ? "X" : "O";
    const next = [...board];
    next[index] = player;
    setHistory((h) => [...h, { board: board.slice(), player }]);
    setBoard(next);
    setIsXNext((p) => !p);
    setHoverIndex(null);
  };

  const handleCellClick = (i) => {
    if (mode === "ai" && !isXNext) return;
    makeMove(i);
  };

  const reset = (toMenu = false) => {
    setBoard(emptyBoard());
    setIsXNext(true);
    setWinnerData({ winner: null, line: null });
    setHistory([]);
    setAiThinking(false);
    setHoverIndex(null);
    if (toMenu) setMode("menu");
  };

  const undo = () => {
    if (!history.length || aiThinking) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setIsXNext(last.player === "X" ? false : true); 
    setHistory((h) => h.slice(0, -1));
    setWinnerData({ winner: null, line: null });
    setHoverIndex(null);
  };

  const statusText = winnerData.winner
    ? winnerData.winner === "Draw"
      ? "🤝 It's a Draw!"
      : `🏆 ${winnerData.winner} Wins!`
    : aiThinking
    ? "🤖 AI is thinking..."
    : `Turn: ${isXNext ? "❌ X" : "⭕ O"}`;

  const winningLineSVG = () => {
    if (!winnerData.line) return null;
    const [a, b, c] = winnerData.line;
    const start = CELL_COORDS[a];
    const end = CELL_COORDS[c];
    return {
      x1: start[0] * 100,
      y1: start[1] * 100,
      x2: end[0] * 100,
      y2: end[1] * 100,
    };
  };

  const cellSizeClass = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white text-gray-900 rounded-3xl shadow-2xl p-6 w-full max-w-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl font-extrabold text-purple-600">Tic-Tac-Toe ✨</h1>

          <div className="flex gap-2 items-center">
            <select
              aria-label="Mode"
              className="rounded-lg border px-3 py-1 text-sm"
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                reset();
              }}
            >
              <option value="menu">Menu</option>
              <option value="pvp">Player vs Player</option>
              <option value="ai">Player vs AI</option>
            </select>

            {mode === "ai" && (
              <select
                aria-label="AI level"
                className="rounded-lg border px-3 py-1 text-sm"
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value)}
              >
                <option value="easy">Easy (random)</option>
                <option value="hard">Hard (unbeatable)</option>
              </select>
            )}
          </div>
        </div>

        {mode === "menu" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 items-center"
          >
            <p className="text-gray-600 mb-2">Choose a mode to start</p>
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <Button
                label="Player vs Player"
                onClick={() => { setMode("pvp"); reset(); }}
                color="bg-indigo-600 hover:bg-indigo-700"
              />
              <Button
                label="Player vs AI"
                onClick={() => { setMode("ai"); reset(); }}
                color="bg-green-600 hover:bg-green-700"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">Tip: try Hard AI — it's unbeatable.</p>
          </motion.div>
        )}

        {/* Main game board */}
        {mode !== "menu" && (
          <>
            <div className="mt-4 flex flex-col items-center">
              <div className="mb-2 text-sm text-gray-600">{mode === "pvp" ? "Player vs Player" : `Player vs AI — ${aiLevel}`}</div>

              <div className="relative">
                <AnimatePresence>
                  {winnerData.line && (
                    <motion.svg
                      key="winline"
                      viewBox="0 0 100 100"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.line
                        x1={winningLineSVG().x1}
                        y1={winningLineSVG().y1}
                        x2={winningLineSVG().x2}
                        y2={winningLineSVG().y2}
                        stroke="#ef4444"
                        strokeWidth="6"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </motion.svg>
                  )}
                </AnimatePresence>

                {/* grid */}
                <div
                  className={`grid grid-cols-3 gap-2 bg-transparent p-2 rounded-lg`}
                  role="grid"
                >
                  {board.map((cell, i) => {
                    const showPreview = hoverIndex === i && !cell && !winnerData.winner && !aiThinking && (mode !== "ai" || isXNext);
                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleCellClick(i)}
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        onFocus={() => setHoverIndex(i)}
                        onBlur={() => setHoverIndex(null)}
                        disabled={!!cell || !!winnerData.winner || (mode === "ai" && !isXNext) || aiThinking}
                        className={`flex items-center justify-center rounded-lg ${cell ? "bg-gray-100" : "bg-white hover:bg-gray-50"} ${cellSizeClass} ${winnerData.line && winnerData.line.includes(i) ? "ring-4 ring-yellow-200" : ""} focus:outline-none`}
                        aria-label={`cell-${i}`}
                      >
                        <AnimatePresence>
                          {/* placed X or O */}
                          {cell && (
                            <motion.span
                              key={cell + i}
                              initial={{ scale: 0, rotate: -90, opacity: 0 }}
                              animate={{ scale: 1, rotate: 0, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.28, type: "spring", stiffness: 400 }}
                              className={`text-4xl md:text-5xl font-extrabold ${cell === "X" ? "text-indigo-600" : "text-red-600"}`}
                            >
                              {cell}
                            </motion.span>
                          )}

                          {/* hover preview */}
                          {!cell && showPreview && (
                            <motion.span
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 0.45 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.18 }}
                              className={`text-4xl md:text-5xl font-extrabold ${isXNext ? "text-indigo-500" : "text-red-500"}`}
                              aria-hidden
                            >
                              {isXNext ? "X" : "O"}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* status and controls */}
              <div className="mt-4 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-700">{statusText}</div>

                <div className="flex gap-2">
                  <Button label="Undo" onClick={undo} color="bg-yellow-500 hover:bg-yellow-600" disabled={!history.length || aiThinking} />
                  <Button label="Restart" icon="🔁" onClick={() => reset(false)} color="bg-blue-600 hover:bg-blue-700" />
                  <Button label="Menu" onClick={() => reset(true)} color="bg-gray-700 hover:bg-gray-800" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
