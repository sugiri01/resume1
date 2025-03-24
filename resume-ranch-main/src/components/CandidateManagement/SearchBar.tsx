
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  delay = 300
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Debounce the input value change
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputValue);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay, onChange]);
  
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brand-400" />
      <Input
        className="pl-10 pr-4 py-2 bg-white/70 backdrop-blur-sm border border-brand-200 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 premium-transition"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
