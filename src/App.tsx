import { useState, useRef } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  isWeekend
} from 'date-fns';
import {
  Calendar,
  Clock,
  CircleUserRound,
  ChevronLeft,
  ChevronRight,
  Building,
  Percent
} from 'lucide-react';

function App() {
  const [selectedDates, setSelectedDates] = useState<{
    workingDays: Set<string>;
    holidays: Set<string>;
  }>({
    workingDays: new Set(),
    holidays: new Set(),
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const lastClickTime = useRef<{ [key: string]: number }>({});
  const DOUBLE_CLICK_DELAY = 300; // 300ms between clicks

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (date: Date) => {
    // Prevent selection if it's a weekend or not in the current month
    if (isWeekend(date) || !isSameMonth(date, currentMonth)) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const currentTime = new Date().getTime();
    const lastClick = lastClickTime.current[dateStr] || 0;

    // Check if it's a double click
    if (currentTime - lastClick < DOUBLE_CLICK_DELAY) {
      // Double click - mark as holiday
      setSelectedDates(prev => {
        const newWorkingDays = new Set(prev.workingDays);
        const newHolidays = new Set(prev.holidays);

        if (newHolidays.has(dateStr)) {
          newHolidays.delete(dateStr);
        } else {
          newHolidays.add(dateStr);
          newWorkingDays.delete(dateStr);
        }

        return {
          workingDays: newWorkingDays,
          holidays: newHolidays,
        };
      });
      lastClickTime.current[dateStr] = 0; // Reset the timer
    } else {
      // Single click - mark as working day
      setSelectedDates(prev => {
        const newWorkingDays = new Set(prev.workingDays);
        const newHolidays = new Set(prev.holidays);

        if (newWorkingDays.has(dateStr)) {
          newWorkingDays.delete(dateStr);
        } else {
          newWorkingDays.add(dateStr);
          newHolidays.delete(dateStr);
        }

        return {
          workingDays: newWorkingDays,
          holidays: newHolidays,
        };
      });
      lastClickTime.current[dateStr] = currentTime;
    }
  };

  // Stats Calculations
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalWorkingDays = daysInMonth.filter(date => !isWeekend(date)).length;
  const holidays = Array.from(selectedDates.holidays).filter(dateStr => {
    const date = new Date(dateStr);
    return !isWeekend(date) && isSameMonth(date, currentMonth);
  }).length;
  const requiredWorkingDays = Math.ceil((totalWorkingDays - holidays) * 0.6);
  const currentAttendance = Array.from(selectedDates.workingDays).filter(dateStr => {
    const date = new Date(dateStr);
    return !isWeekend(date) && isSameMonth(date, currentMonth);
  }).length;
  const attendancePercentage = Math.round(
    (currentAttendance / (totalWorkingDays - holidays)) * 100
  ) || 0;
  const remainingDays = Math.max(requiredWorkingDays - currentAttendance, 0);

  const stats = [
    {
      icon: Calendar,
      label: 'Total Working Days',
      value: totalWorkingDays,
    },
    {
      icon: Clock,
      label: 'Total Holidays',
      value: holidays,
    },
    {
      icon: Building,
      label: 'Required Office Days',
      value: requiredWorkingDays,
    },
    {
      icon: Percent,
      label: 'Attendance',
      value: `${attendancePercentage}%`,
    },
  ];

  console.log("Crafted By Prakaash Murugesan! ❤️ : (https://prakaash.netlify.app/)");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CircleUserRound className="w-8 h-8 text-indigo-600" />
            Attendance Tracker
          </h1>
          {/* 
          <p className="text-gray-600 mt-2">Track your hybrid work schedule and attendance</p>
          <p className="text-sm text-gray-500 mt-1">Single click to mark working day • Double click to mark holiday</p> 
          */}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="select-none">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}

                {days.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isWorkingDay = selectedDates.workingDays.has(dateStr);
                  const isHoliday = selectedDates.holidays.has(dateStr);
                  const isWeekendDay = isWeekend(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
                  return (
                    <div
                      key={day.toString()}
                      onClick={() => handleDateClick(day)}
                      className={`
                        aspect-square p-2 border rounded-lg
                        ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${isWorkingDay && isCurrentMonth ? 'bg-green-100 border-green-300' : ''}
                        ${isHoliday && isCurrentMonth ? 'bg-red-100 border-red-300' : ''}
                        ${isToday(day) ? 'ring-2 ring-indigo-400' : ''}
                        ${isWeekendDay || !isCurrentMonth ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
                      `}
                    >
                      <div className="h-full flex items-center justify-center">
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Working Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Weekend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Attendance Stats
            </h2>

            <div className="space-y-6">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-lg font-semibold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {remainingDays > 0
                      ? `You need ${remainingDays} more office day${
                          remainingDays === 1 ? '' : 's'
                        } to meet the 60% requirement.`
                      : 'You have met the attendance requirement for this month! 🎉'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
