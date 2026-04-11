import React, { useState } from 'react';
import { Holiday } from '../types';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, format, isWithinInterval, parseISO, isSameDay, isSunday, isSaturday
} from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { DayEditModal } from './DayEditModal';

interface CalendarViewProps {
  startYear: number;
  holidays: Holiday[];
  schoolDays?: 5 | 6;
  onChangeHolidays?: (holidays: Holiday[]) => void;
}

export function CalendarView({ startYear, holidays, schoolDays = 6, onChangeHolidays }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState<Holiday | undefined>(undefined);
  // Semester 1: July - Dec (startYear)
  // Semester 2: Jan - Jun (startYear + 1)
  const months = [
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1)),
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1))
  ];

  const getHolidayForDate = (date: Date) => {
    return holidays.find(h => {
      const start = parseISO(h.date);
      if (h.endDate) {
        const end = parseISO(h.endDate);
        return isWithinInterval(date, { start, end });
      }
      return isSameDay(date, start);
    });
  };

  const handleDayClick = (date: Date, holiday?: Holiday) => {
    if (!onChangeHolidays) return; // Only allow editing if the callback is provided
    setSelectedDate(date);
    setHolidayToEdit(holiday);
    setIsModalOpen(true);
  };

  const handleSaveHoliday = (savedHoliday: Holiday) => {
    if (!onChangeHolidays) return;
    
    // If it's an existing holiday, update it. Otherwise, add it.
    const existingIndex = holidays.findIndex(h => h.id === savedHoliday.id);
    if (existingIndex >= 0) {
      const newHolidays = [...holidays];
      newHolidays[existingIndex] = savedHoliday;
      onChangeHolidays(newHolidays);
    } else {
      onChangeHolidays([...holidays, savedHoliday]);
    }
  };

  const handleDeleteHoliday = (holidayId: string) => {
    if (!onChangeHolidays) return;
    onChangeHolidays(holidays.filter(h => h.id !== holidayId));
  };

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="bg-blue-600 text-white text-center py-2 font-semibold text-sm">
          {format(monthStart, 'MMMM yyyy', { locale: id })}
        </div>
        <div className="grid grid-cols-7 text-center text-xs font-medium bg-gray-50 border-b border-gray-100">
          {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((d, i) => (
            <div key={i} className={cn("py-2", i === 0 ? "text-red-500" : "text-gray-600")}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center text-sm">
          {daysInInterval.map((currentDay, i) => {
            const isCurrentMonth = isSameMonth(currentDay, monthStart);
            const isSunday = currentDay.getDay() === 0;
            const isSaturdayDay = currentDay.getDay() === 6;
            const isNonEffective = isSunday || (schoolDays === 5 && isSaturdayDay);
            const holiday = getHolidayForDate(currentDay);
            
            return (
              <div 
                key={i} 
                onClick={() => isCurrentMonth && handleDayClick(currentDay, holiday)}
                className={cn(
                  "py-2 border-b border-r border-gray-50 relative min-h-[40px] flex items-center justify-center transition-colors",
                  !isCurrentMonth && "text-gray-300 bg-gray-50/50",
                  isCurrentMonth && isNonEffective && !holiday && "text-red-500",
                  isCurrentMonth && !isNonEffective && !holiday && "text-gray-700",
                  isCurrentMonth && !!onChangeHolidays && "cursor-pointer hover:bg-gray-100"
                )}
                style={isCurrentMonth && holiday ? { backgroundColor: holiday.color, color: '#fff', fontWeight: 'bold' } : {}}
                title={holiday?.description || (isCurrentMonth && !!onChangeHolidays ? "Klik untuk edit" : undefined)}
              >
                {format(currentDay, dateFormat)}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Kalender Pendidikan Tahun Pelajaran {startYear}/{startYear + 1}
      </h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Semester 1</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.slice(0, 6).map((month, i) => (
            <React.Fragment key={i}>
              {renderMonth(month)}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Semester 2</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.slice(6, 12).map((month, i) => (
            <React.Fragment key={i}>
              {renderMonth(month)}
            </React.Fragment>
          ))}
        </div>
      </div>

      <DayEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        existingHoliday={holidayToEdit}
        onSave={handleSaveHoliday}
        onDelete={handleDeleteHoliday}
      />
    </div>
  );
}
