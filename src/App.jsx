import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./components/Button";

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [mode, setMode] = useState("menu"); // menu | pvp | ai
  const [aiThinking, setAiThinking] = useState(false);

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const calculateWinner = (squares) => {
    for (let [a, b, c] of winPatterns) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
        return squares[a];
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner || (aiThinking && mode === "ai")) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  // 🎮 AI move (simple random logic)
  useEffect(() => {
    if (mode === "ai" && !isXNext && !winner) {
      const empty = board
        .map((val, i) => (val === null ? i : null))
        .filter((v) => v !== null);

      if (empty.length > 0) {
        setAiThinking(true);
        setTimeout(() => {
          const randomIndex = empty[Math.floor(Math.random() * empty.length)];
          const newBoard = [...board];
          newBoard[randomIndex] = "O";
          setBoard(newBoard);
          setIsXNext(true);
          setAiThinking(false);
        }, 700);
      }
    }
  }, [isXNext, mode, winner, board]);

  // 🏆 Check for winner
  useEffect(() => {
    const win = calculateWinner(board);
    if (win) setWinner(win);
    else if (board.every((cell) => cell)) setWinner("Draw");
  }, [board]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  if (mode === "menu") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white text-gray-900 rounded-2xl shadow-2xl p-10 text-center"
        >
          <h1 className="text-4xl font-bold mb-8">🎯 Tic-Tac-Toe</h1>
          <div className="flex flex-col gap-4">
            <Button
              label="Player vs Player 👥"
              color="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setMode("pvp")}
            />
            <Button
              label="Player vs AI 🤖"
              color="bg-green-600 hover:bg-green-700"
              onClick={() => setMode("ai")}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe</h1>
        <p className="text-gray-500 mb-6">
          Mode: <span className="font-semibold">{mode === "pvp" ? "Player vs Player" : "Player vs AI"}</span>
        </p>

        {/* 🟩 Board */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {board.map((cell, index) => (
            <motion.div
              key={index}
              onClick={() => handleClick(index)}
              whileHover={{ scale: 1.1 }}
              className={`w-20 h-20 flex items-center justify-center text-4xl font-bold rounded-xl cursor-pointer 
                ${cell ? "bg-gray-100" : "bg-gray-200 hover:bg-gray-300"}
                ${winner && "pointer-events-none"}
              `}
            >
              <AnimatePresence>
                {cell && (
                  <motion.span
                    key={cell + index}
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${
                      cell === "X" ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* 🏆 Status */}
        <div className="mb-6">
          {winner ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold"
            >
              {winner === "Draw"
                ? "🤝 It's a Draw!"
                : `🏆 ${winner} Wins!`}
            </motion.p>
          ) : (
            <p className="text-lg">
              {aiThinking
                ? "🤖 AI is thinking..."
                : `Turn: ${isXNext ? "❌ X" : "⭕ O"}`}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            label="Restart"
            icon="🔁"
            color="bg-blue-600 hover:bg-blue-700"
            onClick={resetGame}
          />
          <Button
            label="🏠 Menu"
            color="bg-gray-700 hover:bg-gray-800"
            onClick={() => setMode("menu")}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default App;
