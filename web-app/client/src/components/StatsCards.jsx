import React from 'react';
import { Calendar, Dumbbell, TrendingUp, Flame, Target, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * StatsCards Component
 * Displays key workout statistics in card format
 */
const StatsCards = ({ stats }) => {
  const { t } = useLanguage();

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: t('workoutsThisMonth') || 'Workouts This Month',
      value: stats.workoutsThisMonth || 0,
      icon: Calendar,
      bgColor: 'bg-white/10',
      textColor: 'text-white'
    },
    {
      title: t('currentStreak') || 'Current Streak',
      value: `${stats.currentStreak || 0} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      icon: Flame,
      bgColor: 'bg-white/10',
      textColor: 'text-white'
    },
    {
      title: t('totalSets') || 'Total Sets',
      value: stats.totalSetsThisMonth || 0,
      icon: Dumbbell,
      bgColor: 'bg-white/10',
      textColor: 'text-white'
    },
    {
      title: t('totalReps') || 'Total Reps',
      value: stats.totalRepsThisMonth || 0,
      icon: Target,
      bgColor: 'bg-white/10',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className="fire-card rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            
            <h3 className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              {card.title}
            </h3>
            
            <p className="text-3xl font-bold gold-glow">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;

