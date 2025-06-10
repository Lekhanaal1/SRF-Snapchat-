import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: string[]) => void;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const tags = [
    'Chanting',
    'Meditation',
    'Fellowship',
    'Prayer',
    'Study',
    'Service'
  ];

  const handleFilterToggle = (tag: string) => {
    const newFilters = selectedFilters.includes(tag)
      ? selectedFilters.filter(t => t !== tag)
      : [...selectedFilters, tag];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="fixed top-20 left-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-2">Filter Moments</h3>
      <div className="space-y-2">
        {tags.map(tag => (
          <label key={tag} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedFilters.includes(tag)}
              onChange={() => handleFilterToggle(tag)}
              className="form-checkbox"
            />
            <span>{tag}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterBar; 