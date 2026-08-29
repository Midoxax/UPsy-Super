import { FilterState } from "@/types/psychologist";
import { useSpecialties, useLanguages, useTherapyApproaches } from "@/hooks/usePsychologists";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, SlidersHorizontal } from "lucide-react";

interface PsychologistFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const defaultFilters: FilterState = {
  specialties: [],
  languages: [],
  therapyApproaches: [],
  city: "",
  online: false,
  inPerson: false,
  gender: "",
  availability: "",
  minPrice: 0,
  maxPrice: 2000,
};

export const PsychologistFilters = ({ filters, onFiltersChange }: PsychologistFiltersProps) => {
  const { data: specialties = [] } = useSpecialties();
  const { data: languages = [] } = useLanguages();
  const { data: therapyApproaches = [] } = useTherapyApproaches();

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const handleReset = () => onFiltersChange(defaultFilters);

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-muted-foreground">City</Label>
        <Input
          id="city"
          placeholder="Search by city..."
          value={filters.city}
          onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
        />
      </div>

      {/* Session Type */}
      <div className="space-y-3" role="group" aria-label="Session type filters">
        <Label className="text-muted-foreground">Session Type</Label>
        <div className="flex items-center justify-between">
          <Label htmlFor="online" className="text-sm font-normal text-muted-foreground">Online</Label>
          <Switch id="online" checked={filters.online} onCheckedChange={(v) => onFiltersChange({ ...filters, online: v })} />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="inPerson" className="text-sm font-normal text-muted-foreground">In-Person</Label>
          <Switch id="inPerson" checked={filters.inPerson} onCheckedChange={(v) => onFiltersChange({ ...filters, inPerson: v })} />
        </div>
      </div>

      {/* Gender Preference */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Gender Preference</Label>
        <RadioGroup
          value={filters.gender}
          onValueChange={(v) => onFiltersChange({ ...filters, gender: v === "any" ? "" : v })}
          className="space-y-2"
        >
          {[
            { value: "any", label: "No preference" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`gender-${opt.value}`} />
              <Label htmlFor={`gender-${opt.value}`} className="text-sm font-normal text-muted-foreground cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Availability</Label>
        <RadioGroup
          value={filters.availability || "any"}
          onValueChange={(v) => onFiltersChange({ ...filters, availability: v === "any" ? "" : v })}
          className="space-y-2"
        >
          {[
            { value: "any", label: "Any time" },
            { value: "today", label: "Today" },
            { value: "this_week", label: "This week" },
            { value: "flexible", label: "Flexible" },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`avail-${opt.value}`} />
              <Label htmlFor={`avail-${opt.value}`} className="text-sm font-normal text-muted-foreground cursor-pointer">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Price Range (MAD/hour)</Label>
        <div className="px-2">
          <Slider
            min={0} max={2000} step={50}
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => onFiltersChange({ ...filters, minPrice: min, maxPrice: max })}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filters.minPrice} MAD</span>
          <span>{filters.maxPrice} MAD</span>
        </div>
      </div>

      {/* Therapy Approaches */}
      {therapyApproaches.length > 0 && (
        <div className="space-y-3">
          <Label className="text-muted-foreground">Therapy Approach</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {therapyApproaches.map((ta: any) => (
              <div key={ta.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`ta-${ta.id}`}
                  checked={filters.therapyApproaches.includes(ta.id)}
                  onCheckedChange={() => onFiltersChange({ ...filters, therapyApproaches: toggle(filters.therapyApproaches, ta.id) })}
                />
                <label htmlFor={`ta-${ta.id}`} className="text-sm text-muted-foreground cursor-pointer leading-none">
                  {ta.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialties */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Specialties</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {specialties.map((s: any) => (
            <div key={s.id} className="flex items-center space-x-2">
              <Checkbox
                id={`specialty-${s.id}`}
                checked={filters.specialties.includes(s.id)}
                onCheckedChange={() => onFiltersChange({ ...filters, specialties: toggle(filters.specialties, s.id) })}
              />
              <label htmlFor={`specialty-${s.id}`} className="text-sm text-muted-foreground cursor-pointer leading-none">
                {s.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-muted-foreground">Languages</Label>
        <div className="space-y-2">
          {languages.map((l: any) => (
            <div key={l.id} className="flex items-center space-x-2">
              <Checkbox
                id={`language-${l.id}`}
                checked={filters.languages.includes(l.id)}
                onCheckedChange={() => onFiltersChange({ ...filters, languages: toggle(filters.languages, l.id) })}
              />
              <label htmlFor={`language-${l.id}`} className="text-sm text-muted-foreground cursor-pointer leading-none">
                {l.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
