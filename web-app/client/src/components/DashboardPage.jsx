import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar, TrendingUp, Dumbbell, Target, Award, Flame } from 'lucide-react';
import StatsCards from './StatsCards';
import WorkoutCalendar from './WorkoutCalendar';
import PastWorkouts from './PastWorkouts';

/**
 * DashboardPage Component
 * Main dashboard view showing workout statistics and calendar
 */
const DashboardPage = ({ routines = [] }) => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await dashboardAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="fire-card rounded-lg mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
            {t('dashboard') || 'Dashboard'}
          </h1>
          <p className="mt-1 text-white/70">
            {t('dashboardSubtitle') || 'Track your fitness journey'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Calendar Section */}
        <div className="mt-8">
          <div className="fire-card rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
                {t('workoutCalendar') || 'Workout Calendar'}
              </h2>
            </div>
            <WorkoutCalendar routines={routines} />
          </div>
        </div>

        {/* Top Exercises */}
        {stats && stats.topExercises && stats.topExercises.length > 0 && (
          <div className="mt-8">
            <div className="fire-card rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
                  {t('topExercises') || 'Top Exercises This Month'}
                </h2>
              </div>
              <div className="space-y-3">
                {stats.topExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold border-2 border-white/30">
                        {index + 1}
                      </div>
                      <span className="font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{exercise.name}</span>
                    </div>
                    <span className="text-white/70">
                      {exercise.count} {exercise.count === 1 ? 'workout' : 'workouts'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Past Workouts Summary */}
        <div className="mt-8">
          <PastWorkouts />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

