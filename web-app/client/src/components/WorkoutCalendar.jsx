import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { dashboardAPI, scheduleAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, X, Check } from 'lucide-react';

/**
 * WorkoutCalendar Component
 * Displays a calendar with workout days highlighted and allows scheduling routines
 */
const WorkoutCalendar = ({ routines = [] }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date());
  const [workoutDays, setWorkoutDays] = useState([]);
  const [scheduledDays, setScheduledDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    loadCalendarData(date);
  }, [date]);

  const loadCalendarData = async (currentDate) => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Load workout logs
      const calendarData = await dashboardAPI.getCalendar(year, month);
      setWorkoutDays(calendarData.workoutDays || []);

      // Load scheduled routines
      const scheduleData = await scheduleAPI.getCalendarSchedule(year, month);
      setScheduledDays(scheduleData.scheduledDays || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = ({ activeStartDate }) => {
    setDate(activeStartDate);
  };

  const handleDateClick = (clickedDate) => {
    setSelectedDate(clickedDate);
    setShowScheduleModal(true);
  };

  const handleScheduleRoutine = async (routineId) => {
    try {
      await scheduleAPI.scheduleRoutine(routineId, selectedDate.toISOString());
      await loadCalendarData(date);
      setShowScheduleModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error scheduling routine:', error);
      alert('Failed to schedule routine');
    }
  };

  const handleDeleteScheduled = async (scheduledId, event) => {
    event.stopPropagation();
    if (window.confirm('Remove this scheduled routine?')) {
      try {
        await scheduleAPI.deleteScheduledRoutine(scheduledId);
        await loadCalendarData(date);
      } catch (error) {
        console.error('Error deleting scheduled routine:', error);
        alert('Failed to delete scheduled routine');
      }
    }
  };

  const handleToggleCompleted = async (scheduledId, currentStatus, event) => {
    event.stopPropagation();
    try {
      await scheduleAPI.updateScheduledRoutine(scheduledId, { completed: !currentStatus });
      await loadCalendarData(date);
    } catch (error) {
      console.error('Error updating routine status:', error);
      alert('Failed to update status');
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const hasWorkout = workoutDays.some(day => day.date === dateStr);
      const hasScheduled = scheduledDays.some(day => day.date === dateStr);
      
      if (hasWorkout && hasScheduled) {
        return 'workout-day scheduled-day';
      } else if (hasWorkout) {
        return 'workout-day';
      } else if (hasScheduled) {
        return 'scheduled-day';
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const workoutDay = workoutDays.find(day => day.date === dateStr);
      const scheduledDay = scheduledDays.find(day => day.date === dateStr);
      
      return (
        <div className="tile-content">
          {workoutDay && (
            <div className="workout-indicator">
              <div className="workout-dot"></div>
              {workoutDay.workoutCount > 1 && (
                <div className="workout-count">{workoutDay.workoutCount}</div>
              )}
            </div>
          )}
          {scheduledDay && (
            <div className="scheduled-routines">
              {scheduledDay.routines.map((scheduled, idx) => (
                <div 
                  key={idx} 
                  className={`scheduled-routine-badge ${scheduled.completed ? 'completed' : ''}`}
                  title={scheduled.routine.name}
                >
                  {scheduled.completed && <Check className="w-2 h-2" />}
                  {scheduled.routine.name.substring(0, 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="workout-calendar-container">
      <style>{`
        .workout-calendar-container {
          max-width: 100%;
        }

        .react-calendar {
          width: 100%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          font-family: var(--font-display);
          background: rgba(10, 10, 10, 0.5);
          border-radius: 8px;
          color: white;
        }

        .react-calendar__tile {
          padding: 0.5em;
          position: relative;
          height: 80px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .react-calendar__tile--active {
          background: #FF4500 !important;
          color: #0A0A0A !important;
          font-weight: bold;
        }

        .react-calendar__tile--now {
          background: rgba(255, 255, 255, 0.15) !important;
          border: 2px solid rgba(255, 255, 255, 0.4) !important;
          color: white !important;
        }

        .workout-day {
          background: rgba(255, 69, 0, 0.3) !important;
          font-weight: 600;
          border: 2px solid #FF4500 !important;
          color: white !important;
        }

        .scheduled-day {
          background: rgba(255, 255, 255, 0.2) !important;
          font-weight: 600;
          border: 2px solid rgba(255, 255, 255, 0.4) !important;
          color: white !important;
        }

        .workout-day.scheduled-day {
          background: linear-gradient(135deg, rgba(255, 69, 0, 0.4) 50%, rgba(255, 255, 255, 0.2) 50%) !important;
          border: 2px solid #FF4500 !important;
          color: white !important;
        }

        .workout-day:hover, .scheduled-day:hover {
          opacity: 0.8;
        }

        .tile-content {
          position: absolute;
          bottom: 2px;
          left: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .workout-indicator {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .workout-dot {
          width: 6px;
          height: 6px;
          background: #FF4500;
          border-radius: 50%;
        }

        .workout-count {
          font-size: 9px;
          background: #0A0A0A;
          color: white;
          padding: 1px 3px;
          border-radius: 8px;
          font-weight: bold;
          border: 1px solid white;
        }

        .scheduled-routines {
          display: flex;
          gap: 2px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .scheduled-routine-badge {
          font-size: 9px;
          background: white;
          color: #0A0A0A;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 1px;
          border: 1px solid #0A0A0A;
        }

        .scheduled-routine-badge.completed {
          background: #FF4500;
          color: white;
          border: 1px solid white;
        }

        .react-calendar__navigation button {
          font-size: 1em;
          font-weight: 700;
          color: white;
          background: rgba(255, 255, 255, 0.05);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .react-calendar__navigation button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 700;
          font-size: 0.75em;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.05);
        }

        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }
      `}</style>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          <Calendar
            value={date}
            onActiveStartDateChange={handleMonthChange}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="en-US"
          />

          <div className="mt-4 flex gap-4 text-sm text-white font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            {workoutDays.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-youtine-red rounded border border-white"></div>
                <span>{workoutDays.length} workout {workoutDays.length === 1 ? 'day' : 'days'}</span>
              </div>
            )}
            {scheduledDays.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white rounded border border-black"></div>
                <span>{scheduledDays.length} scheduled {scheduledDays.length === 1 ? 'day' : 'days'}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="fire-card rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
                Schedule Routine
              </h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedDate(null);
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-white/70 mb-4">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>

            {/* Show existing scheduled routines */}
            {(() => {
              const dateStr = selectedDate.toISOString().split('T')[0];
              const scheduledDay = scheduledDays.find(day => day.date === dateStr);
              
              if (scheduledDay && scheduledDay.routines.length > 0) {
                return (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2 text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Scheduled Routines:</h4>
                    <div className="space-y-2">
                      {scheduledDay.routines.map((scheduled) => (
                        <div
                          key={scheduled._id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/20"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleCompleted(scheduled._id, scheduled.completed, e)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                scheduled.completed
                                  ? 'bg-youtine-red border-white'
                                  : 'border-white/50'
                              }`}
                            >
                              {scheduled.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={`font-bold uppercase tracking-wider ${scheduled.completed ? 'line-through text-white/50' : 'text-white'}`} style={{ fontFamily: 'var(--font-display)' }}>
                              {scheduled.routine.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteScheduled(scheduled._id, e)}
                            className="text-youtine-red hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Add new routine */}
            <div>
              <h4 className="font-bold mb-2 text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Add Routine:</h4>
              {routines.length === 0 ? (
                <p className="text-white/70 text-sm">No routines available. Create a routine first.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {routines.map((routine) => (
                    <button
                      key={routine._id}
                      onClick={() => handleScheduleRoutine(routine._id)}
                      className="w-full text-left p-3 border-2 border-white/20 rounded hover:bg-white/10 hover:border-white/40 transition-colors bg-white/5"
                    >
                      <div className="font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{routine.name}</div>
                      {routine.description && (
                        <div className="text-sm text-white/70">{routine.description}</div>
                      )}
                      <div className="text-xs text-white/60 mt-1">
                        {routine.videos?.length || 0} videos
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutCalendar;

