import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { Label } from "./ui/label.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.jsx";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Calendar } from "./ui/calendar.jsx";
import { cn } from "../lib/utils.js";
import Select from 'react-select';

// České formátování pro datum s číselným měsícem
const DATE_FORMAT = "d. M. yyyy";
const FORMATTED_DATE_OPTIONS = { locale: cs };

const PlayerFormShadcn = ({ hraci, pokuty, addPokuta }) => {
  const [selectedHraci, setSelectedHraci] = useState([]);
  const [selectedPokuta, setSelectedPokuta] = useState(null);
  const [isPlayOff, setIsPlayOff] = useState(false);
  const [date, setDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedHraci.length === 0) {
      toast.error('Prosím vyberte alespoň jednoho hráče.');
      return;
    }
    if (!selectedPokuta) {
      toast.error('Prosím vyberte pokutu.');
      return;
    }

    const hracIds = selectedHraci.map(hrac => hrac.value);
    const pokutaAmount = isPlayOff ? selectedPokuta.castka * 2 : selectedPokuta.castka;
    
    addPokuta(hracIds, { 
      nazev: `${selectedPokuta.label}${isPlayOff ? ' (PO: x2)' : ''}`, 
      castka: pokutaAmount, 
      originalCastka: selectedPokuta.castka,
      datum: date.toLocaleDateString('cs-CZ'),
      isPlayOff: isPlayOff
    });
    
    setSelectedHraci([]);
    setSelectedPokuta(null);
    setIsPlayOff(false);
  };

  const handleDateSelect = (selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
      setCalendarOpen(false);
    }
  };

  const hraciOptions = [
    { value: 'select_all', label: 'Vybrat všechny' },
    ...hraci.map(hrac => ({
      value: hrac.id,
      label: hrac.jmeno
    }))
  ];

  const pokutyOptions = pokuty.map(pokuta => ({
    value: pokuta.id,
    label: pokuta.nazev,
    castka: pokuta.castka
  }));

  const formatPokutaOption = ({ label, castka }, { context }) => (
    <div className="flex justify-between items-center w-full">
      <span>{label}</span>
      <span className="font-medium text-[#ED1B26] whitespace-nowrap">{castka} Kč</span>
    </div>
  );

  const handleHraciChange = (selectedOptions) => {
    if (selectedOptions.some(option => option.value === 'select_all')) {
      setSelectedHraci(hraciOptions.slice(1)); // Vyber všechny hráče kromě "Vybrat všechny"
    } else {
      setSelectedHraci(selectedOptions);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      borderRadius: 'var(--radius)',
      padding: '1px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'rgb(209 213 219)', // hover:border-gray-300
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--popover))',
      borderRadius: 'var(--radius)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: '16px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--accent))' 
        : state.isFocused 
          ? 'hsl(var(--muted))' 
          : 'hsl(var(--popover))',
      color: state.isSelected 
        ? 'hsl(var(--accent-foreground))' 
        : 'hsl(var(--popover-foreground))',
      fontSize: '14px',
      ':active': {
        backgroundColor: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'hsl(var(--accent))',
      borderRadius: 'calc(var(--radius) - 4px)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'hsl(var(--accent-foreground))',
      fontSize: '14px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'hsl(var(--accent-foreground))',
      ':hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))',
      },
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '14px',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '14px',
    }),
  };

  return (
    <div className="flex justify-center p-4 min-w-[320px]">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="players">Výběr hráče</Label>
                <Select
                  inputId="players"
                  isMulti
                  value={selectedHraci}
                  onChange={handleHraciChange}
                  options={hraciOptions}
                  placeholder="Vyberte hráče"
                  styles={{
                    ...customSelectStyles,
                    container: (provided) => ({
                      ...provided,
                      width: '100%'
                    })
                  }}
                  className="text-foreground w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fine">Výběr pokuty</Label>
                <Select
                  inputId="fine"
                  value={selectedPokuta}
                  onChange={setSelectedPokuta}
                  options={pokutyOptions}
                  placeholder="Vyberte pokutu"
                  formatOptionLabel={formatPokutaOption}
                  styles={{
                    ...customSelectStyles,
                    container: (provided) => ({
                      ...provided,
                      width: '100%'
                    })
                  }}
                  className="text-foreground w-full"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="date">Datum pokuty:</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal border transition-all duration-200 shadow-none", 
                          "hover:border-gray-300 hover:bg-muted"
                        )} 
                        id="date"
                        type="button"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {format(date, DATE_FORMAT, FORMATTED_DATE_OPTIONS)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="w-1/2 space-y-2">
                  <Label htmlFor="playoff">Play-off:</Label>
                  <div
                    id="playoff"
                    className={cn(
                      "flex h-10 items-center rounded-md border transition-all duration-200 cursor-pointer",
                      isPlayOff ? "bg-red-50 border-red-500" : "bg-background border-input hover:border-gray-300 hover:bg-muted",
                    )}
                    onClick={() => setIsPlayOff(!isPlayOff)}
                  >
                    <div className="flex items-center h-full pl-3 w-full">
                      <div
                        className={cn(
                          "w-5 h-5 flex items-center justify-center rounded-full mr-2 text-xs transition-all",
                          isPlayOff ? "bg-red-600 text-white" : "bg-gray-200",
                        )}
                      >
                        {isPlayOff && "2x"}
                      </div>
                      <span
                        className={cn(
                          "font-medium transition-colors text-sm",
                          isPlayOff ? "text-red-600" : "text-gray-700",
                        )}
                      >
                        {isPlayOff ? "Aktivní" : "Neaktivní"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pt-6">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" type="submit">
                Přidat pokutu
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerFormShadcn; 