import { useState } from "react";
import { Clock, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { type OohHours } from "@shared/schema";

interface OohHoursConfigProps {
  value: OohHours;
  onChange: (hours: OohHours) => void;
}

export function OohHoursConfig({ value, onChange }: OohHoursConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeChange = (field: 'weekdayStart' | 'weekdayEnd', newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  const handleWeekendsChange = (checked: boolean) => {
    onChange({
      ...value,
      includeWeekends: checked
    });
  };

  const resetToDefault = () => {
    onChange({
      weekdayStart: "17:00",
      weekdayEnd: "09:00",
      includeWeekends: true
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Out-of-Hours Configuration
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              {value.weekdayStart} - {value.weekdayEnd} 
              {value.includeWeekends ? " + weekends" : ""}
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isOpen && (
        <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Configure when incidents should be considered "out-of-hours" for reporting purposes.
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekday-start">Weekday OOH Start Time</Label>
                  <input
                    id="weekday-start"
                    type="time"
                    value={value.weekdayStart}
                    onChange={(e) => handleTimeChange('weekdayStart', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="input-ooh-start"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Time when OOH period starts (e.g., 17:00 for 5 PM)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="weekday-end">Weekday OOH End Time</Label>
                  <input
                    id="weekday-end"
                    type="time"
                    value={value.weekdayEnd}
                    onChange={(e) => handleTimeChange('weekdayEnd', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    data-testid="input-ooh-end"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Time when OOH period ends next day (e.g., 09:00 for 9 AM)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-weekends"
                  checked={value.includeWeekends}
                  onCheckedChange={handleWeekendsChange}
                  data-testid="switch-include-weekends"
                />
                <Label htmlFor="include-weekends" className="text-sm">
                  Include all weekend hours as out-of-hours
                </Label>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <strong>Current OOH Period:</strong> {value.weekdayStart} - {value.weekdayEnd} on weekdays
                  {value.includeWeekends ? ", all day on weekends" : ""}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefault}
                  className="flex items-center"
                  data-testid="button-reset-ooh"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Reset to Default
                </Button>
              </div>
            </div>
        </CardContent>
      )}
    </Card>
  );
}