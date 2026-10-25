import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
  const dayNumber = parseInt(selectedDate.split('-')[2], 10);

  const handlePrev = () => {
    if (dayNumber > 1) {
      const prevDay = (dayNumber - 1).toString().padStart(2, '0');
      onDateChange(`2026-01-${prevDay}`);
    }
  };

  const handleNext = () => {
    if (dayNumber < 31) {
      const nextDay = (dayNumber + 1).toString().padStart(2, '0');
      onDateChange(`2026-01-${nextDay}`);
    }
  };

  const quickDates = [
    { label: 'Jan 01', date: '2026-01-01' },
    { label: 'Jan 08', date: '2026-01-08' },
    { label: 'Jan 15', date: '2026-01-15' },
    { label: 'Jan 22', date: '2026-01-22' },
    { label: 'Jan 31', date: '2026-01-31' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#111827]/90 border border-slate-800 p-2.5 rounded-lg text-xs">
      {/* Date Display */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 font-medium">Delivery Date:</span>
        <span className="font-semibold text-slate-100 text-sm">
          {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC'
          })}
        </span>
        <span className="text-[11px] font-mono text-slate-400">(Day D)</span>
      </div>

      {/* Quick Jump Buttons & Stepper */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Quick jump pills */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-800">
          {quickDates.map((q) => (
            <button
              key={q.date}
              onClick={() => onDateChange(q.date)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedDate === q.date
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Stepper Buttons & Date Picker Input */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={dayNumber <= 1}
            className="p-1 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <input
            type="date"
            min="2026-01-01"
            max="2026-01-31"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value.startsWith('2026-01-')) {
                onDateChange(e.target.value);
              }
            }}
            className="bg-[#0b101d] border border-slate-700/80 rounded-md px-2 py-0.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleNext}
            disabled={dayNumber >= 31}
            className="p-1 rounded-md bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
