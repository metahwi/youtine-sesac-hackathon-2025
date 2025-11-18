import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * WorkoutLogForm Component
 * Form for logging workout performance (sets, reps, weight)
 */
const WorkoutLogForm = ({ exerciseName, onSubmit, onCancel }) => {
  const [sets, setSets] = useState([{ reps: '', weight: '' }]);
  const [notes, setNotes] = useState('');

  const addSet = () => {
    setSets([...sets, { reps: '', weight: '' }]);
  };

  const removeSet = (index) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string values to numbers and filter out empty sets
    const validSets = sets
      .filter(set => set.reps || set.weight)
      .map(set => ({
        reps: set.reps ? parseInt(set.reps) : undefined,
        weight: set.weight ? parseFloat(set.weight) : undefined
      }));

    if (validSets.length === 0) {
      alert('Please enter at least one set');
      return;
    }

    onSubmit({
      exerciseName,
      sets: validSets,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="fire-card rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4 gold-glow" style={{ fontFamily: 'var(--font-display)' }}>{exerciseName}</h3>

        <form onSubmit={handleSubmit}>
          {/* Sets */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                Sets
              </label>
              <button
                type="button"
                onClick={addSet}
                className="text-white hover:text-white/80 flex items-center gap-1 text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
            </div>

            <div className="space-y-2">
              {sets.map((set, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-white/70 w-8">#{index + 1}</span>

                  <input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => updateSet(index, 'reps', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white"
                    min="0"
                  />

                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={set.weight}
                    onChange={(e) => updateSet(index, 'weight', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white"
                    min="0"
                    step="0.5"
                  />

                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      className="text-youtine-red hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any observations?"
              className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded focus:outline-none focus:ring-2 focus:ring-white"
              rows="3"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white hover:bg-gray-100 text-black rounded border-2 border-black font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 champion-button rounded"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkoutLogForm;

