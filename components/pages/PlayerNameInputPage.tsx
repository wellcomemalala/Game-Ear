
import React, { useState } from 'react';
import { UI_TEXT_TH } from '../../constants';

interface PlayerNameInputPageProps {
  setPlayerName: (name: string) => void;
  onNameSubmitted: () => void;
}

const PlayerNameInputPage: React.FC<PlayerNameInputPageProps> = ({ setPlayerName, onNameSubmitted }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName && trimmedName.length >= 1 && trimmedName.length <= 20) {
      setPlayerName(trimmedName);
      onNameSubmitted();
    } else if (trimmedName.length === 0) {
        setError("ชื่อผู้เล่นห้ามว่าง");
    } else if (trimmedName.length > 20) {
        setError("ชื่อผู้เล่นต้องไม่เกิน 20 ตัวอักษร");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-sky-300 text-outline-black">
          {UI_TEXT_TH.playerNameInputTitle}
        </h1>
        <p className="mb-4 text-slate-300 text-center">{UI_TEXT_TH.enterPlayerNamePrompt}</p>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          className={`w-full px-4 py-3 mb-2 bg-slate-700 border rounded-lg text-slate-100 focus:ring-2 focus:outline-none
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-600 focus:ring-sky-500 focus:border-sky-500'}`}
          placeholder="ชื่อผู้เล่นของคุณ..."
          maxLength={20}
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
         {!error && <div className="h-6 mb-4"></div>} {/* Placeholder to prevent layout shift */}


        <button
          type="submit"
          className="w-full btn-primary py-3 mt-2"
          disabled={!name.trim()}
        >
          {UI_TEXT_TH.submitPlayerNameButton}
        </button>
      </form>
    </div>
  );
};

export default PlayerNameInputPage;
