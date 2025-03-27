import React from 'react';

interface CardProps {
  card: {
    id: number;
    symbol: string; // Now an imported image
    isFlipped: boolean;
    isMatched: boolean;
  };
  onClick: (id: number) => void;
}

const Card: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <div
      className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}
      onClick={() => onClick(card.id)}
    >
      <div className="card-back">?</div>
      <div className="card-front">
        <img src={card.symbol} alt="Card" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export default Card;