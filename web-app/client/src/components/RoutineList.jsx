import { useState } from 'react';
import { Plus, Dumbbell, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * RoutineList Component
 * Sidebar displaying all routines with create and select functionality
 */
const RoutineList = ({ routines, activeRoutineId, onSelectRoutine, onCreateRoutine, onDeleteRoutine }) => {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    await onCreateRoutine(name, description);
    setName('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="fire-card rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
          <Dumbbell className="text-white" size={24} />
          {t('routines')}
        </h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="champion-button p-2 rounded-md"
          title={t('createRoutine')}
        >
          <Plus size={20} />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-white/5 rounded-md border border-white/10">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('routineName')}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-white"
            autoFocus
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('description')}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-white resize-none"
            rows="2"
          />
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 champion-button px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('create')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setName('');
                setDescription('');
              }}
              className="flex-1 bg-white hover:bg-gray-100 text-black px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider border-2 border-black"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
        {routines.length === 0 ? (
          <p className="text-white/70 text-sm text-center py-4">
            {t('noRoutines')}
          </p>
        ) : (
          routines.map((routine) => (
            <div
              key={routine._id}
              className={`p-3 rounded-md cursor-pointer transition-all duration-200 group border-2 ${
                activeRoutineId === routine._id
                  ? 'bg-white/20 border-white'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1"
                  onClick={() => onSelectRoutine(routine._id)}
                >
                  <h3 className="font-bold text-sm mb-1 text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{routine.name}</h3>
                  {routine.description && (
                    <p className="text-xs text-white/70 mb-1 line-clamp-2">{routine.description}</p>
                  )}
                  <p className="text-xs text-white/60">
                    {routine.videos?.length || 0} {routine.videos?.length === 1 ? t('video') : t('videos')}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${routine.name}"?`)) {
                      onDeleteRoutine(routine._id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-1 transition-opacity duration-200"
                  title="Delete routine"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoutineList;

