"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Card from "./Card"

import image1 from "../images/image-01.webp"
import image2 from "../images/image-02.webp"
import image3 from "../images/image-03.webp"
import image4 from "../images/image-04.webp"
import image5 from "../images/image-05.webp"
import image6 from "../images/image-06.webp"

const images = [image1, image2, image3, image4, image5, image6]

function createDeck(symbols: string[]): { id: number; symbol: string; isFlipped: boolean; isMatched: boolean }[] {
  const deck = symbols.concat(symbols) // Duplicate for 6 pairs
  return deck
    .sort(() => Math.random() - 0.5)
    .map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    }))
}

const initialCards = createDeck(images)

interface GameBoardProps {
  onMintNFT: () => void
}

const GameBoard: React.FC<GameBoardProps> = ({ onMintNFT }) => {
  const [cards, setCards] = useState(initialCards)
  const [selected, setSelected] = useState<number[]>([])
  const [gameWon, setGameWon] = useState(false)
  const [timeStarted, setTimeStarted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (timeStarted && !gameWon) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timeStarted, gameWon])

  useEffect(() => {
    if (selected.length === 2) {
      const [first, second] = selected
      if (cards[first].symbol === cards[second].symbol) {
        setCards((prevCards) =>
          prevCards.map((card) => (card.id === first || card.id === second ? { ...card, isMatched: true } : card)),
        )
      } else {
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) => (card.id === first || card.id === second ? { ...card, isFlipped: false } : card)),
          )
        }, 1000)
      }
      setSelected([])
    }
  }, [selected])

  useEffect(() => {
    if (cards.every((card) => card.isMatched)) {
      setGameWon(true)
    }
  }, [cards])

  const handleCardClick = (id: number) => {
    if (selected.length < 2 && !cards[id].isFlipped && !cards[id].isMatched) {
      setCards((prevCards) => prevCards.map((card) => (card.id === id ? { ...card, isFlipped: true } : card)))
      setSelected((prevSelected) => [...prevSelected, id])
      if (!timeStarted) {
        setTimeStarted(true)
      }
    }
  }

  const canMint = gameWon && timeElapsed <= 60

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mx-auto mb-8">
        {cards.map((card) => (
          <Card key={card.id} card={card} onClick={handleCardClick} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-2 text-white font-medium">
          Time: {timeElapsed} seconds
        </div>
        {gameWon && canMint && (
          <button
            className="bg-white text-black py-3 px-8 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
            onClick={onMintNFT}
          >
            Mint NFT
          </button>
        )}
        {gameWon && !canMint && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">Too slow! Try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black py-2 px-6 rounded-full font-medium transition-transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameBoard

