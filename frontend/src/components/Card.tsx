"use client"

import type React from "react"

interface CardProps {
  card: {
    id: number
    symbol: string
    isFlipped: boolean
    isMatched: boolean
  }
  onClick: (id: number) => void
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div
      className="relative w-[100px] h-[130px] sm:w-[120px] sm:h-[150px] cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={() => onClick(card.id)}
    >
      {/* Gradient border wrapper */}
      <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-red-500">
        {/* Card container with 3D perspective */}
        <div className="w-full h-full perspective">
          {/* Flipping container */}
          <div
            className={`relative w-full h-full duration-700 preserve-3d transition-transform ${
              card.isFlipped || card.isMatched ? "rotate-y-180" : ""
            }`}
          >
            {/* Card back */}
            <div className="absolute inset-0 bg-black rounded-lg flex items-center justify-center text-white text-2xl font-bold backface-hidden">
              ?
            </div>

            {/* Card front */}
            <div className="absolute inset-0 bg-black rounded-lg overflow-hidden backface-hidden rotate-y-180">
              <img src={card.symbol || "/placeholder.svg"} alt="Card" className="w-full h-full object-contain p-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card

