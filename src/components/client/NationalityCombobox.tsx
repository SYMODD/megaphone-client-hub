
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { nationalities } from "@/data/nationalities";

interface NationalityComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const NationalityCombobox = ({ value, onValueChange }: NationalityComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? nationalities.find((nationality) => nationality === value)
            : "Sélectionner une nationalité..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white border border-gray-200 shadow-lg z-50">
        <Command>
          <CommandInput placeholder="Rechercher une nationalité..." />
          <CommandList>
            <CommandEmpty>Aucune nationalité trouvée.</CommandEmpty>
            <CommandGroup>
              {nationalities.map((nationality) => (
                <CommandItem
                  key={nationality}
                  value={nationality}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === nationality ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {nationality}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
