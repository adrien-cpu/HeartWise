"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { get_user_speed_dating_schedule, set_user_speed_dating_schedule } from 'users_data';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

/**
 * @fileOverview Implements the Speed Dating page with scheduling and interest selection.
 */

/**
 * @function SpeedDatingPage
 * @description A component for users to schedule speed dating sessions and select their interests.
 * @returns {JSX.Element} The rendered SpeedDatingPage component.
 */
const SpeedDatingPage = () => {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
        // Load initial speed dating schedule from user data
        const initialSchedule = get_user_speed_dating_schedule(1); // Assuming user ID is 1
        setSchedule(initialSchedule);
    }, []);

    useEffect(() => {
        // Save speed dating schedule to user data whenever it changes
        set_user_speed_dating_schedule(1, schedule); // Assuming user ID is 1
    }, [schedule]);


    /**
     * @function toggleDaySelection
     * @description Toggles the selection of a day for scheduling speed dating sessions.
     * @param {Date} day - The date to toggle.
     */
    const toggleDaySelection = (day: Date) => {
        if (selectedDays.find((d) => d?.getTime() === day.getTime())) {
            setSelectedDays(selectedDays.filter((d) => d?.getTime() !== day.getTime()));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    /**
     * @function toggleInterest
     * @description Toggles the selection of an interest.
     * @param {string} interest - The interest to toggle.
     */
    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter((i) => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    /**
     * @function submitSchedule
     * @description Submits the selected days to schedule speed dating sessions and displays a toast message.
     */
    const submitSchedule = () => {
        const daysOfWeek = selectedDays.map(day => day.getDay()); // 0 (Sunday) to 6 (Saturday)
        setSchedule(daysOfWeek);
        toast({
            title: "Schedule Updated",
            description: `Speed dating sessions scheduled for ${selectedDays.map(day => format(day, 'EEEE')).join(', ')}`,
        });
    };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Speed Dating</h1>
      <div className="mb-4">
        <p>Select the days you are available for speed dating:</p>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !selectedDays && "text-muted-foreground"
                            )}
                        >
                            {selectedDays?.length > 0 ? (
                                selectedDays.map(day => format(day, "MM/dd/yy")).join(", ")
                            ) : (
                                <span>Pick Date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" sideOffset={10}>
                        <Calendar
                            mode="multiple"
                            selected={selectedDays}
                            onSelect={toggleDaySelection}
                            disabled={[{before: new Date()}]}
                        />
                    </PopoverContent>
                </Popover>
      </div>

      <div className="mb-4">
        <p>Select your interests:</p>
        <Label htmlFor="movies" className="flex items-center space-x-2">
          <Checkbox id="movies" checked={interests.includes("movies")} onCheckedChange={() => toggleInterest("movies")} />
          <span>Movies</span>
        </Label>
        <Label htmlFor="music" className="flex items-center space-x-2">
          <Checkbox id="music" checked={interests.includes("music")} onCheckedChange={() => toggleInterest("music")} />
          <span>Music</span>
        </Label>
        <Label htmlFor="sports" className="flex items-center space-x-2">
          <Checkbox id="sports" checked={interests.includes("sports")} onCheckedChange={() => toggleInterest("sports")} />
          <span>Sports</span>
        </Label>
      </div>

      <Button onClick={submitSchedule}>Submit Schedule</Button>

      {schedule.length > 0 && (
                <div className="mt-4">
                    <p>Your speed dating sessions are scheduled for:</p>
                    <ul>
                        {schedule.map((day, index) => (
                            <li key={index}>Day {day}</li>
                        ))}
                    </ul>
                </div>
            )}
    </div>
  );
};

export default SpeedDatingPage;
