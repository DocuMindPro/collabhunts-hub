import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEBANESE_CITIES, type LebaneseCityValue } from "@/config/lebanese-market";

interface LebaneseCitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
  className?: string;
}

const LebaneseCitySelect = ({
  value,
  onValueChange,
  placeholder = "Select city",
  includeAllOption = false,
  allOptionLabel = "All Cities",
  disabled = false,
  className,
}: LebaneseCitySelectProps) => {
  // Group cities by region
  const citiesByRegion = LEBANESE_CITIES.reduce((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = [];
    }
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, typeof LEBANESE_CITIES[number][]>);

  const regions = Object.keys(citiesByRegion).sort();

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAllOption && (
          <SelectItem value="all">{allOptionLabel}</SelectItem>
        )}
        {regions.map((region) => (
          <div key={region}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {region}
            </div>
            {citiesByRegion[region].map((city) => (
              <SelectItem key={city.value} value={city.value}>
                {city.label}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LebaneseCitySelect;
