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
    { label: 'Jan 01', date: '2026-01-01', desc: 'New Year' },
    { label: 'Jan 08', date: '2026-01-08', desc: 'High Wind' },
    { label: 'Jan 15', date: '2026-01-15', desc: 'Mid Month' },
    { label: 'Jan 22', date: '2026-01-22', desc: 'Lull Period' },
    { label: 'Jan 31', date: '2026-01-31', desc: 'Month End' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Target Delivery Date
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'UTC'
              })}
            </span>
            <span className="text-xs text-slate-400 font-mono">(Day D)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Quick jump pills */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {quickDates.map((q) => (
            <button
              key={q.date}
              onClick={() => onDateChange(q.date)}
              className={`px-2 py-1 rounded transition-colors text-[11px] ${
                selectedDate === q.date
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Date Input and Steppers */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={dayNumber <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
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
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={handleNext}
            disabled={dayNumber >= 31}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
