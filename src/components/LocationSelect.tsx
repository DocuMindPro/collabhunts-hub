import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  COUNTRY_LOCATIONS, 
  hasLocationData, 
  getStatesForCountry, 
  getCitiesForCountry,
  type LocationOption 
} from "@/config/country-locations";

interface LocationSelectProps {
  type: 'state' | 'city';
  countryCode: string;
  value: string;
  onChange: (value: string) => void;
  stateFilter?: string; // For cities, filter by this state
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const LocationSelect = ({ 
  type, 
  countryCode, 
  value, 
  onChange, 
  stateFilter,
  disabled, 
  placeholder,
  className 
}: LocationSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check if we have data for this country
  const hasData = hasLocationData(countryCode);

  // Get options based on type
  const getOptions = (): LocationOption[] => {
    if (!hasData) return [];
    
    if (type === 'state') {
      return getStatesForCountry(countryCode);
    } else {
      // For cities, stateFilter might be a label (from user selection) or value
      // We need to find the state value from the label
      const states = getStatesForCountry(countryCode);
      const stateObj = states.find(s => s.label === stateFilter || s.value === stateFilter);
      const stateValue = stateObj?.value || stateFilter;
      return getCitiesForCountry(countryCode, stateValue);
    }
  };

  const options = getOptions();
  const selectedOption = options.find(opt => opt.value === value || opt.label === value);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) ||
      option.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: LocationOption) => {
    onChange(option.label); // Store the label for display
    setIsOpen(false);
    setSearch("");
  };

  const defaultPlaceholder = type === 'state' ? 'Select state/region' : 'Select city';

  // If no data for this country, show text input as fallback
  if (!hasData) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || (type === 'state' ? 'Enter state' : 'Enter city')}
        disabled={disabled}
        className={className}
      />
    );
  }

  // If type is city but no state selected yet, show disabled state
  if (type === 'city' && !stateFilter && getStatesForCountry(countryCode).length > 0) {
    return (
      <Button
        type="button"
        variant="outline"
        className={cn("w-full flex items-center justify-between gap-2 h-10 opacity-50", className)}
        disabled
      >
        <span className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Select region first
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-between gap-2 h-10"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedOption ? (
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{selectedOption.label}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {placeholder || defaultPlaceholder}
          </span>
        )}
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b sticky top-0 bg-background">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${type === 'state' ? 'regions' : 'cities'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-muted-foreground text-sm">
                No {type === 'state' ? 'regions' : 'cities'} found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left",
                    (value === option.value || value === option.label) && "bg-accent"
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelect;
