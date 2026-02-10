"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, X, ChevronsUpDown, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { Fuel, Clock, MapPin } from "lucide-react";
import api from "@/services/api/api-service";

export function LogbookForm({ onSubmit, initialData, onCancel }) {
  const defaultFormData = {
    date: new Date(),
    machineId: null,
    registrationNumber: "",
    machineNumber: "",
    dieselOpeningBalance: 0,
    dieselIssue: 0,
    dieselClosingBalance: 0,
    openingKmReading: 0,
    closingKmReading: 0,
    openingHrsMeter: 0,
    closingHrsMeter: 0,
    workingDetails: "",
    assetCode: "",
    siteId: null,
    siteName: "",
    location: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [sites, setSites] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState({
    sites: false,
    machines: false,
  });
  const [machineSelected, setMachineSelected] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState();

  const [requestLoader, setRequestLoader] = useState(false);

  // For the dropdowns
  const [machineOpen, setMachineOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);

  // Fetch machines and sites from API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setLoading((prev) => ({ ...prev, machines: true }));
        const response = await api.get("/logbook/site/machines");
        setMachines(response.data);
      } catch (error) {
        console.error("Error fetching machines:", error);
      } finally {
        setLoading((prev) => ({ ...prev, machines: false }));
      }
    };

    const fetchSites = async () => {
      try {
        setLoading((prev) => ({ ...prev, sites: true }));
        const response = await api.get("/sites");
        setSites(response.data);
      } catch (error) {
        console.error("Error fetching sites:", error);
      } finally {
        setLoading((prev) => ({ ...prev, sites: false }));
      }
    };

    fetchMachines();
    // fetchSites();
  }, []);

  useEffect(() => {
    if (initialData) {
      const machineId = initialData.machineId || initialData.machine?.id;
      setFormData({
        ...initialData,
        machineId: machineId, // Explicitly set machineId (ensure it's not undefined)
        date: initialData.date ? new Date(initialData.date) : new Date(),
        openingKmReading: Number(initialData.openingKmReading) || 0,
        closingKmReading: Number(initialData.closingKmReading) || 0,
        openingHrsMeter: Number(initialData.openingHrsMeter) || 0,
        closingHrsMeter: Number(initialData.closingHrsMeter) || 0,
        dieselOpeningBalance: Number(initialData.dieselOpeningBalance) || 0,
        dieselClosingBalance: Number(initialData.dieselClosingBalance) || 0,
        dieselIssue: Number(initialData.dieselIssue) || 0,
      });
      // Reset selected machine so the machine sync effect can run
      setSelectedMachine(null);
      setMachineSelected(false);
    } else {
      setFormData(defaultFormData);
      setSelectedMachine(null);
      setMachineSelected(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData && machines.length > 0 && !selectedMachine) {
      const machineId = initialData.machineId || initialData.machine?.id;
      // Use loose equality to handle potential string/number mismatch
      const machine = machines.find((m) => m.id == machineId);
      if (machine) {
        setSelectedMachine(machine);
        setMachineSelected(true);

        // Populate form data with machine details that might be missing from initialData
        setFormData((prev) => ({
          ...prev,
          registrationNumber: machine.registrationNumber,
          machineNumber: machine.machineNumber,
          assetCode: machine.erpCode,
          siteName: machine.siteName,
          siteId: machine.siteId,
          location: machine.siteLocation,
        }));
      }
    }
  }, [initialData, machines, selectedMachine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Convert numeric fields to numbers
    if (
      [
        "dieselOpeningBalance",
        "dieselIssue",
        "dieselClosingBalance",
        "openingKmReading",
        "closingKmReading",
        "openingHrsMeter",
        "closingHrsMeter",
      ].includes(name)
    ) {
      parsedValue = Number.parseFloat(value) || 0;
    }

    setFormData({ ...formData, [name]: parsedValue });

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setFormData({ ...formData, date });
    }
  };

  const handleMachineChange = (machineId) => {
    const selectedMachine = machines.find((m) => m.id == machineId);
    if (selectedMachine) {
      setFormData({
        ...formData,
        machineId: selectedMachine.id,
        registrationNumber: selectedMachine.registrationNumber,
        machineNumber: selectedMachine.machineNumber,
        assetCode: selectedMachine.erpCode,
        siteName: selectedMachine.siteName,
        siteId: selectedMachine.siteId,
        location: selectedMachine.siteLocation,
      });
    }
    setSelectedMachine(selectedMachine);
    setMachineSelected(true);
    setMachineOpen(false);
  };

  const handleSiteChange = (siteId) => {
    const selectedSite = sites.find((s) => s.id === siteId);
    if (selectedSite) {
      setFormData({
        ...formData,
        siteId: selectedSite.id,
        siteName: selectedSite.name,
        location: selectedSite.address,
      });
    }
    setSiteOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.machineId) newErrors.machineId = "Machine is required";
    if (!formData.siteId) newErrors.siteId = "Site is required";

    // Validate numeric fields
    if (formData.closingKmReading < formData.openingKmReading) {
      newErrors.closingKmReading = "Closing KM cannot be less than opening KM";
    }

    if (formData.closingHrsMeter < formData.openingHrsMeter) {
      newErrors.closingHrsMeter =
        "Closing hours cannot be less than opening hours";
    }

    const dieselUsed =
      formData.dieselOpeningBalance +
      formData.dieselIssue -
      formData.dieselClosingBalance;
    if (dieselUsed < 0) {
      newErrors.dieselClosingBalance =
        "Diesel usage calculation results in negative value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Prepare data for API submission
      const dieselUsage =
        formData.dieselOpeningBalance +
        formData.dieselIssue -
        formData.dieselClosingBalance;

      const apiData = {
        date: format(formData.date, "yyyy-MM-dd"),
        machineId: formData.machineId,
        openingKmReading: formData.openingKmReading,
        closingKmReading: formData.closingKmReading,
        openingHrsMeter: formData.openingHrsMeter,
        closingHrsMeter: formData.closingHrsMeter,
        dieselOpeningBalance: formData.dieselOpeningBalance,
        dieselClosingBalance: formData.dieselClosingBalance,
        dieselIssue: formData.dieselIssue,
        dieselUsage: dieselUsage > 0 ? dieselUsage : 0,
        workingDetails: formData.workingDetails,
        assetCode: formData.assetCode,
        siteId: formData.siteId,
        location: formData.location,
      };
      setRequestLoader(true);

      try {
        onSubmit(apiData);
      } catch (error) {
        setRequestLoader(false);
      }
    }
  };

  // Calculate derived values
  const kmRun = formData.closingKmReading - formData.openingKmReading;
  const hoursRun = formData.closingHrsMeter - formData.openingHrsMeter;
  const dieselUsed =
    formData.dieselOpeningBalance +
    formData.dieselIssue -
    formData.dieselClosingBalance;
  const dieselAvg =
    dieselUsed > 0 && kmRun > 0 ? (kmRun / dieselUsed).toFixed(2) : "N/A";

  function MachineMetricsBar() {
    return (
      <Card className="w-full bg-muted dark:bg-transparent px-4 py-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border rounded-lg">
        {/* Machine Info */}
        <div>
          <h2 className="font-semibold">{selectedMachine?.machineName}</h2>
          <p className="text-xs text-muted-foreground">
            ERP Code: {selectedMachine?.erpCode}{" "}
            {selectedMachine?.registrationNumber &&
              `• Reg. No: ${selectedMachine.registrationNumber}`}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Diesel Issued:</span>
            <span className="font-semibold">
              {selectedMachine?.sumDieselIssue} L
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Run Hours:</span>
            <span className="font-semibold">
              {selectedMachine?.sumTotalRunHrsMeter} h
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Distance:</span>
            <span className="font-semibold">
              {selectedMachine?.sumTotalRunKM} km
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {machineSelected && <MachineMetricsBar />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Field */}
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.date && "text-muted-foreground",
                  errors.date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        {/* Machine Selection */}
        <div className="space-y-2">
          <Label htmlFor="machineId">Registration No / Machine No</Label>
          <Popover open={machineOpen} onOpenChange={setMachineOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={machineOpen}
                className={cn(
                  "w-full justify-between",
                  errors.machineId && "border-red-500"
                )}
                disabled={loading.machines}
              >
                {loading.machines
                  ? "Loading machines..."
                  : formData.machineId
                    ? `${machines.find((m) => m.id == formData.machineId)
                      ?.machineName || ""
                    } / ${machines.find((m) => m.id == formData.machineId)
                      ?.registrationNumber || ""
                    }`
                    : "Select machine..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search by registration or machine number..." />
                <CommandEmpty>No machine found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {machines.map((machine) => (
                      <CommandItem
                        key={machine.id}
                        value={`${machine.registrationNumber} ${machine.machineNumber}`}
                        onSelect={() => handleMachineChange(machine.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.machineId === machine.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {machine.erpCode} / {machine.machineNumber} -{" "}
                        {machine.machineName}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.machineId && (
            <p className="text-red-500 text-sm">{errors.machineId}</p>
          )}
        </div>

        {/* Asset Code */}
        <div className="space-y-2">
          <Label htmlFor="assetCode">Asset Code</Label>
          <Input
            id="assetCode"
            name="assetCode"
            value={formData.assetCode}
            onChange={handleChange}
            readOnly
            className="bg-muted"
          />
        </div>

        {/* Site Selection */}
        <div className="space-y-2">
          <Label htmlFor="siteId">Site Name</Label>
          {/* <Popover open={siteOpen} onOpenChange={setSiteOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={siteOpen}
                className={cn(
                  "w-full justify-between",
                  errors.siteId && "border-red-500"
                )}
                disabled={loading.sites}
              >
                {loading.sites
                  ? "Loading sites..."
                  : formData.siteId
                  ? sites.find((s) => s.id === formData.siteId)?.name
                  : "Select site..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search sites..." />
                <CommandEmpty>No site found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {sites.map((site) => (
                      <CommandItem
                        key={site.id}
                        value={site.name}
                        onSelect={() => handleSiteChange(site.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.siteId === site.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {site.name} ({site.code})
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover> */}
          <Input
            id="siteName"
            name="siteName"
            value={formData.siteName}
            onChange={handleChange}
            readOnly
            className="bg-muted"
          />
          {errors.siteId && (
            <p className="text-red-500 text-sm">{errors.siteId}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            readOnly
            className="bg-muted"
          />
        </div>

        {/* Diesel Fields */}
        <div className="space-y-2">
          <Label htmlFor="dieselOpeningBalance">
            Diesel Opening Balance (L)
          </Label>
          <Input
            id="dieselOpeningBalance"
            name="dieselOpeningBalance"
            type="number"
            step="0.01"
            value={formData.dieselOpeningBalance}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dieselIssue">Diesel Issue (L)</Label>
          <Input
            id="dieselIssue"
            name="dieselIssue"
            type="number"
            step="0.01"
            value={formData.dieselIssue}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dieselClosingBalance">
            Diesel Closing Balance (L)
          </Label>
          <Input
            id="dieselClosingBalance"
            name="dieselClosingBalance"
            type="number"
            step="0.01"
            value={formData.dieselClosingBalance}
            onChange={handleChange}
            className={cn(errors.dieselClosingBalance && "border-red-500")}
          />
          {errors.dieselClosingBalance && (
            <p className="text-red-500 text-sm">
              {errors.dieselClosingBalance}
            </p>
          )}
        </div>

        {/* KM Readings */}
        <div className="space-y-2">
          <Label htmlFor="openingKmReading">Opening KM Reading</Label>
          <Input
            id="openingKmReading"
            name="openingKmReading"
            type="number"
            step="0.01"
            value={formData.openingKmReading}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closingKmReading">Closing KM Reading</Label>
          <Input
            id="closingKmReading"
            name="closingKmReading"
            type="number"
            step="0.01"
            value={formData.closingKmReading}
            onChange={handleChange}
            className={cn(errors.closingKmReading && "border-red-500")}
          />
          {errors.closingKmReading && (
            <p className="text-red-500 text-sm">{errors.closingKmReading}</p>
          )}
        </div>

        {/* Hours Meter */}
        <div className="space-y-2">
          <Label htmlFor="openingHrsMeter">Opening Hours Meter</Label>
          <Input
            id="openingHrsMeter"
            name="openingHrsMeter"
            type="number"
            step="0.01"
            value={formData.openingHrsMeter}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closingHrsMeter">Closing Hours Meter</Label>
          <Input
            id="closingHrsMeter"
            name="closingHrsMeter"
            type="number"
            step="0.01"
            value={formData.closingHrsMeter}
            onChange={handleChange}
            className={cn(errors.closingHrsMeter && "border-red-500")}
          />
          {errors.closingHrsMeter && (
            <p className="text-red-500 text-sm">{errors.closingHrsMeter}</p>
          )}
        </div>
        {/* Working Details */}
        <div className="space-y-2 ">
          <Label htmlFor="workingDetails">Working Details</Label>
          <Textarea
            id="workingDetails"
            name="workingDetails"
            value={formData.workingDetails}
            onChange={handleChange}
            rows={3}
            placeholder="Enter details about the work performed"
          />
        </div>
      </div>

      {/* Calculated Fields Preview */}
      {(formData.openingKmReading > 0 || formData.openingHrsMeter > 0) && (
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Calculated Values (Preview)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">
                Total Run KM:
              </span>
              <p className="font-medium">{kmRun.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Total Run Hours:
              </span>
              <p className="font-medium">{hoursRun.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Diesel Used (L):
              </span>
              <p className="font-medium">
                {dieselUsed > 0 ? dieselUsed.toFixed(2) : 0}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                Diesel Avg (KM/L):
              </span>
              <p className="font-medium">{dieselAvg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          loading={requestLoader}
          type="submit"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4 mx-2" />
          {initialData ? "Update Entry" : "Save Entry"}
        </Button>
      </div>
    </form>
  );
}
