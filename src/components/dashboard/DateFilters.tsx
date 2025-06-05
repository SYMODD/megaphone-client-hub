
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface DateFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const DateFilters = ({
  dateRange,
  onDateRangeChange
}: DateFiltersProps) => {
  const clearDateFilter = () => {
    onDateRangeChange(undefined);
  };

  const hasDateFilter = dateRange?.from || dateRange?.to;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Filtre par période
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              className="w-full"
            />
          </div>
          
          {hasDateFilter && (
            <Button 
              variant="outline" 
              onClick={clearDateFilter}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <X className="w-4 h-4" />
              Effacer
            </Button>
          )}
        </div>

        {hasDateFilter && (
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">Période sélectionnée :</span>
            {dateRange?.from && (
              <span className="ml-1">
                Du {dateRange.from.toLocaleDateString('fr-FR')}
              </span>
            )}
            {dateRange?.to && (
              <span className="ml-1">
                au {dateRange.to.toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
