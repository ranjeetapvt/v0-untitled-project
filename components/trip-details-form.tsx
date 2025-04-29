"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TripDetailsFormProps {
  formData: any
  updateFormData: (data: any) => void
}

export function TripDetailsForm({ formData, updateFormData }: TripDetailsFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    formData.startDate ? new Date(formData.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(formData.endDate ? new Date(formData.endDate) : undefined)

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      updateFormData({ startDate: date.toISOString() })
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      updateFormData({ endDate: date.toISOString() })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Step 1 of 6: Where, When & How</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="destination">Destination</Label>
          <div className="relative">
            <Input
              id="destination"
              placeholder="Enter city, country, or region"
              value={formData.destination}
              onChange={(e) => updateFormData({ destination: e.target.value })}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={handleEndDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label>Mode of Travel (Arrival)</Label>
          <RadioGroup
            value={formData.arrivalMode}
            onValueChange={(value) => updateFormData({ arrivalMode: value })}
            className="mt-2 flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flight" id="flight" />
              <Label htmlFor="flight">Flight</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="train" id="train" />
              <Label htmlFor="train">Train</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bus" id="bus" />
              <Label htmlFor="bus">Bus</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="car" id="car" />
              <Label htmlFor="car">Car</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-decided" id="not-decided" />
              <Label htmlFor="not-decided">Not Decided</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="arrival-time">Arrival Time (Optional)</Label>
            <div className="relative">
              <Input
                id="arrival-time"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => updateFormData({ arrivalTime: e.target.value })}
              />
              <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="departure-time">Departure Time (Optional)</Label>
            <div className="relative">
              <Input
                id="departure-time"
                type="time"
                value={formData.departureTime}
                onChange={(e) => updateFormData({ departureTime: e.target.value })}
              />
              <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
