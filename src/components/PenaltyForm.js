import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { Label } from "./ui/label.jsx";
import { Input } from "./ui/input.jsx";
import { cn } from "../lib/utils.js";
import { toast } from 'react-toastify';

const PenaltyForm = ({ addNewPokuta }) => {
  const [nazev, setNazev] = useState('');
  const [castka, setCastka] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nazev || !castka) {
      toast.error('Prosím vyplňte název a částku pokuty.');
      return;
    }
    addNewPokuta(e, nazev, castka);
    setNazev('');
    setCastka('');
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nazev">Název pokuty</Label>
                <Input
                  id="nazev"
                  type="text"
                  value={nazev}
                  onChange={(e) => setNazev(e.target.value)}
                  placeholder="Zadejte název pokuty"
                  className={cn(
                    "w-full",
                    "hover:border-gray-300",
                    "placeholder:text-sm"
                  )}
                  style={{ caretColor: 'black' }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="castka">Částka pokuty</Label>
                <Input
                  id="castka"
                  type="number"
                  value={castka}
                  onChange={(e) => setCastka(e.target.value)}
                  placeholder="Zadejte částku v Kč"
                  className={cn(
                    "w-full",
                    "hover:border-gray-300",
                    "placeholder:text-sm"
                  )}
                  style={{ caretColor: 'black' }}
                />
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

export default PenaltyForm;
