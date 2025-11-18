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
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: t('currentStreak') || 'Current Streak',
      value: `${stats.currentStreak || 0} ${stats.currentStreak === 1 ? 'day' : 'days'}`,
      icon: Flame,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      title: t('totalSets') || 'Total Sets',
      value: stats.totalSetsThisMonth || 0,
      icon: Dumbbell,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: t('totalReps') || 'Total Reps',
      value: stats.totalRepsThisMonth || 0,
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
            
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              {card.title}
            </h3>
            
            <p className="text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;

