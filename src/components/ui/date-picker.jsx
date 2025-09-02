"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Calendar } from "./calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled,
  ...props
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Pick a date and time",
  className,
  disabled,
  ...props
}) {
  const [selectedDate, setSelectedDate] = React.useState(date)
  const [timeValue, setTimeValue] = React.useState(
    date ? format(date, "HH:mm") : "09:00"
  )

  const handleDateSelect = (newDate) => {
    if (newDate) {
      // Preserve time when date changes
      const [hours, minutes] = timeValue.split(':').map(Number)
      const dateWithTime = new Date(newDate)
      dateWithTime.setHours(hours, minutes)
      setSelectedDate(dateWithTime)
      onDateChange?.(dateWithTime)
    } else {
      setSelectedDate(newDate)
      onDateChange?.(newDate)
    }
  }

  const handleTimeChange = (event) => {
    const newTime = event.target.value
    setTimeValue(newTime)
    
    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const dateWithTime = new Date(selectedDate)
      dateWithTime.setHours(hours, minutes)
      setSelectedDate(dateWithTime)
      onDateChange?.(dateWithTime)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP 'at' HH:mm")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b border-border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
          />
        </div>
        <div className="p-3">
          <div className="flex items-center space-x-2">
            <label htmlFor="time" className="text-sm font-medium">
              Time:
            </label>
            <input
              id="time"
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateTimePicker }
