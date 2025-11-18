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
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">{exerciseName}</h3>

        <form onSubmit={handleSubmit}>
          {/* Sets */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Sets
              </label>
              <button
                type="button"
                onClick={addSet}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
            </div>

            <div className="space-y-2">
              {sets.map((set, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                  
                  <input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) => updateSet(index, 'reps', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={set.weight}
                    onChange={(e) => updateSet(index, 'weight', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.5"
                  />
                  
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      className="text-red-600 hover:text-red-700"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any observations?"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

