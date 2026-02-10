"use client"

import { useState, useEffect } from "react"
import api from "@/services/api/api-service"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function LogbookFilters({ filters, setFilters }) {
  const [dateOpen, setDateOpen] = useState(false)
  const [sites, setSites] = useState([])

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await api.get("/sites")
        setSites(response.data)
      } catch (error) {
        console.error("Error fetching sites:", error)
      }
    }
    fetchSites()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  const handleDateRangeChange = (date) => {
    const { from, to } = filters.dateRange

    if (!from) {
      setFilters({ ...filters, dateRange: { from: date, to: null } })
    } else if (from && !to && date > from) {
      setFilters({ ...filters, dateRange: { from, to: date } })
      setDateOpen(false)
    } else {
      setFilters({ ...filters, dateRange: { from: date, to: null } })
    }
  }

  const clearFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      machineNo: "",
      siteName: "",
      assetCode: "",
    })
  }

  const hasActiveFilters = () => {
    return filters.dateRange.from || filters.machineNo || filters.siteName || filters.assetCode
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full sm:w-auto space-y-2">
          <Label htmlFor="dateRange">Date Range</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                id="dateRange"
                variant="outline"
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal",
                  !filters.dateRange.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "PPP")} - {format(filters.dateRange.to, "PPP")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "PPP")
                  )
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) => {
                  setFilters({
                    ...filters,
                    dateRange: {
                      from: range?.from || null,
                      to: range?.to || null,
                    },
                  })
                  if (range?.to) setDateOpen(false)
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="machineNo">Machine No</Label>
            <Input
              id="machineNo"
              name="machineNo"
              value={filters.machineNo}
              onChange={handleInputChange}
              placeholder="Search machine no..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Select
              value={filters.siteName}
              onValueChange={(value) =>
                setFilters({ ...filters, siteName: value === "all" ? "" : value })
              }
            >
              <SelectTrigger id="siteName">
                <SelectValue placeholder="Select site name..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.name}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetCode">Asset Code</Label>
            <Input
              id="assetCode"
              name="assetCode"
              value={filters.assetCode}
              onChange={handleInputChange}
              placeholder="Search asset code..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {hasActiveFilters() ? "Filters applied" : "No filters applied"}
        </div>

        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}

