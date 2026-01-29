import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchProcedures, loadProcedures } from '@/data/procedures';
import { Procedure } from '@/types/procedure';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectProcedure: (procedure: Procedure) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, onSelectProcedure, placeholder = 'Buscar procedimento, código ou CID...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Procedure[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProcedures().then(setProcedures).catch(err => {
      console.error('Error loading procedures in SearchBar:', err);
      setProcedures([]);
    });
  }, []);

  useEffect(() => {
    if (query.length >= 2 && Array.isArray(procedures)) {
      const results = searchProcedures(procedures, query).slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, procedures]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (procedure: Procedure) => {
    setQuery('');
    setShowSuggestions(false);
    onSelectProcedure(procedure);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            id="procedure-search"
            name="procedure-search"
            autoComplete="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-12 pr-12 h-14 text-base rounded-xl border-2 border-border focus:border-primary bg-card shadow-sm"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
          {suggestions.map((procedure) => (
            <button
              key={procedure.id}
              onClick={() => handleSelectSuggestion(procedure)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{procedure.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    CBHPM: {procedure.codes.cbhpm}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full shrink-0">
                  {procedure.type === 'cirurgico' ? 'Cirúrgico' : procedure.type === 'ambulatorial' ? 'Ambulatorial' : 'Diagnóstico'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
