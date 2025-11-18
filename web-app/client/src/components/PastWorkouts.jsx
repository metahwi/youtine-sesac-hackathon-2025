import React, { useState, useEffect } from 'react';
import { logAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, Dumbbell, TrendingUp } from 'lucide-react';

/**
 * PastWorkouts Component
 * Displays a summary of recent workout logs
 */
const PastWorkouts = () => {
  const { t } = useLanguage();
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentWorkouts();
  }, []);

  const loadRecentWorkouts = async () => {
    try {
      setLoading(true);
      const logs = await logAPI.getLogs({ limit: 10 });
      setRecentLogs(logs);
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('today') || 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday') || 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(log);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="fire-card rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (recentLogs.length === 0) {
    return (
      <div className="fire-card rounded-lg p-12 text-center">
        <Dumbbell className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          {t('noWorkoutsYet') || 'No workouts logged yet'}
        </h3>
        <p className="text-white/70">
          {t('startLogging') || 'Start logging your workouts to see your progress here!'}
        </p>
      </div>
    );
  }

  const groupedLogs = groupLogsByDate(recentLogs);

  return (
    <div className="fire-card rounded-lg">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
            {t('recentWorkouts') || 'Recent Workouts'}
          </h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {Object.entries(groupedLogs).map(([date, logs]) => (
          <div key={date} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              <Calendar className="w-4 h-4" />
              {formatDate(logs[0].date)}
            </div>

            {/* Workouts for this date */}
            <div className="space-y-2 ml-6">
              {logs.map((log, index) => (
                <div
                  key={log._id || index}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                        {log.exerciseName}
                      </h4>

                      {/* Sets Summary */}
                      <div className="flex flex-wrap gap-2 text-sm text-white/70">
                        {log.sets && log.sets.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">{log.sets.length}</span>
                            <span>{log.sets.length === 1 ? 'set' : 'sets'}</span>
                          </span>
                        )}

                        {log.sets && log.sets[0] && log.sets[0].reps && (
                          <span className="flex items-center gap-1">
                            <span>×</span>
                            <span className="font-medium">{log.sets[0].reps}</span>
                            <span>reps</span>
                          </span>
                        )}

                        {log.sets && log.sets[0] && log.sets[0].weight && (
                          <span className="flex items-center gap-1">
                            <span>@</span>
                            <span className="font-medium">{log.sets[0].weight}</span>
                            <span>kg</span>
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {log.notes && (
                        <p className="text-sm text-white/60 mt-2 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    {/* Total Volume Badge */}
                    {log.sets && log.sets.length > 0 && log.sets[0].weight && log.sets[0].reps && (
                      <div className="ml-4 text-right">
                        <div className="text-xs text-white/60 uppercase tracking-wide">Volume</div>
                        <div className="text-lg font-bold text-white">
                          {log.sets.reduce((total, set) =>
                            total + (set.weight || 0) * (set.reps || 0), 0
                          )}
                          <span className="text-sm">kg</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PastWorkouts;

