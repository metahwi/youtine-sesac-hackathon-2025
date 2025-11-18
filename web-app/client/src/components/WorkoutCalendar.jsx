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
          border: none;
          font-family: inherit;
        }
        
        .react-calendar__tile {
          padding: 0.5em;
          position: relative;
          height: 80px;
          cursor: pointer;
        }
        
        .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }
        
        .react-calendar__tile--now {
          background: #eff6ff;
        }
        
        .workout-day {
          background: #dbeafe !important;
          font-weight: 600;
        }
        
        .scheduled-day {
          background: #fef3c7 !important;
          font-weight: 600;
        }
        
        .workout-day.scheduled-day {
          background: linear-gradient(135deg, #dbeafe 50%, #fef3c7 50%) !important;
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
          background: #3b82f6;
          border-radius: 50%;
        }
        
        .workout-count {
          font-size: 9px;
          background: #3b82f6;
          color: white;
          padding: 1px 3px;
          border-radius: 8px;
          font-weight: bold;
        }
        
        .scheduled-routines {
          display: flex;
          gap: 2px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .scheduled-routine-badge {
          font-size: 9px;
          background: #fbbf24;
          color: white;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 1px;
        }
        
        .scheduled-routine-badge.completed {
          background: #10b981;
        }
        
        .react-calendar__navigation button {
          font-size: 1em;
          font-weight: 600;
        }
        
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75em;
          color: #6b7280;
        }
      `}</style>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          
          <div className="mt-4 flex gap-4 text-sm">
            {workoutDays.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span>{workoutDays.length} workout {workoutDays.length === 1 ? 'day' : 'days'}</span>
              </div>
            )}
            {scheduledDays.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                <span>{scheduledDays.length} scheduled {scheduledDays.length === 1 ? 'day' : 'days'}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Schedule Routine
              </h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedDate(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
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
                    <h4 className="font-semibold mb-2">Scheduled Routines:</h4>
                    <div className="space-y-2">
                      {scheduledDay.routines.map((scheduled) => (
                        <div 
                          key={scheduled._id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleCompleted(scheduled._id, scheduled.completed, e)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                scheduled.completed 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300'
                              }`}
                            >
                              {scheduled.completed && <Check className="w-3 h-3 text-white" />}
                            </button>
                            <span className={scheduled.completed ? 'line-through text-gray-500' : ''}>
                              {scheduled.routine.name}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteScheduled(scheduled._id, e)}
                            className="text-red-600 hover:text-red-700"
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
              <h4 className="font-semibold mb-2">Add Routine:</h4>
              {routines.length === 0 ? (
                <p className="text-gray-500 text-sm">No routines available. Create a routine first.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {routines.map((routine) => (
                    <button
                      key={routine._id}
                      onClick={() => handleScheduleRoutine(routine._id)}
                      className="w-full text-left p-3 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-medium">{routine.name}</div>
                      {routine.description && (
                        <div className="text-sm text-gray-600">{routine.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
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

