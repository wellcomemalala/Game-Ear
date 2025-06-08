
import React, { useState } from 'react';
import { UI_TEXT_TH } from '../../constants'; // Assuming UI_TEXT_TH is in constants

interface ChildNamingPageProps {
  onNameSubmitted: (name: string) => void;
  onCancel: () => void; // To go back if player changes mind
  spouseName?: string; // Optional, for flavor text
}

const ChildNamingPage: React.FC<ChildNamingPageProps> = ({ onNameSubmitted, onCancel, spouseName }) => {
  const [childName, setChildName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = childName.trim();
    if (trimmedName && trimmedName.length >= 1 && trimmedName.length <= 15) {
      onNameSubmitted(trimmedName);
    } else if (trimmedName.length === 0) {
      setError(UI_TEXT_TH.childNameErrorEmpty || "ชื่อลูกห้ามว่าง");
    } else if (trimmedName.length > 15) {
      setError(UI_TEXT_TH.childNameErrorTooLong || "ชื่อลูกต้องไม่เกิน 15 ตัวอักษร");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-pink-300 text-outline-black">
          {UI_TEXT_TH.childNamingPageTitle || "ตั้งชื่อลูกน้อย"}
        </h1>
        <p className="mb-6 text-slate-300 text-center">
          {spouseName 
            ? UI_TEXT_TH.childNamingPromptWithSpouse?.replace('{spouseName}', spouseName) || `คุณและ ${spouseName} กำลังจะมีสมาชิกใหม่ในครอบครัว! มาช่วยกันตั้งชื่อที่แสนวิเศษให้เขากันเถอะ`
            : UI_TEXT_TH.childNamingPromptGeneric || "คุณกำลังจะมีสมาชิกใหม่ในครอบครัว! โปรดตั้งชื่อให้ลูกของคุณ:"}
        </p>
        <input
          type="text"
          value={childName}
          onChange={(e) => {
            setChildName(e.target.value);
            if (error) setError(null);
          }}
          className={`w-full px-4 py-3 mb-2 bg-slate-700 border rounded-lg text-slate-100 focus:ring-2 focus:outline-none 
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-600 focus:ring-pink-500 focus:border-pink-500'}`}
          placeholder={UI_TEXT_TH.childNamePlaceholder || "ชื่อลูก..."}
          maxLength={15}
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {!error && <div className="h-6 mb-4"></div>}

        <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="w-full btn-primary bg-pink-500 hover:bg-pink-600 focus:ring-pink-400 py-3"
              disabled={!childName.trim()}
            >
              {UI_TEXT_TH.childNameSubmitButton || "ยืนยันชื่อ"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full btn-neutral py-2.5"
            >
              {UI_TEXT_TH.cancelButtonLabel || "ยกเลิก"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChildNamingPage;
