
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { SelectSingleEventHandler } from "react-day-picker";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTranslations } from "next-intl";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ date, setDate, disabled, className }: DatePickerProps) {
  const t = useTranslations("SpeedDating"); 

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{t('sessionDate')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate as SelectSingleEventHandler}
          initialFocus
          disabled={disabled || ((d) => d < new Date(new Date().setDate(new Date().getDate() -1 )))} // Disable past dates
        />
      </PopoverContent>
    </Popover>
  )
}
