import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { CalendarIcon, Loader2, Upload, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import api from "@/services/api/api-service"
import { fetchMachines } from "@/features/machine/machine-slice"
import { useDispatch } from "react-redux"
import Loading from "./loading"

// Define the form schema with Zod
const machineFormSchema = z.object({
  primaryCategory: z.string().nullable().optional(),
  machineCategory: z.string().nullable().optional(),
  primaryCategoryId: z.number().nullable().optional(),
  machineCategoryId: z.number().nullable().optional(),
  erpCode: z.string().nullable().optional(),
  registrationNumber: z.string().nullable().optional(),
  machineNumber: z.string().nullable().optional(),
  machineCode: z.string().nullable().optional(),
  chassisNumber: z.string().nullable().optional(),
  engineNumber: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  make: z.string().nullable().optional(),
  yom: z.coerce
    .number()
    .int()
    .min(1900, "Year must be valid")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .nullable()
    .optional(),
  purchaseDate: z.date().nullable().optional(),
  capacity: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  ownerType: z.string().nullable().optional(),
  siteId: z.coerce.number().int().positive("Site ID must be a positive number").nullable().optional(),
  isActive: z.boolean().default(true).nullable().optional(),
  machineName: z.string().nullable().optional(),
  fitnessCertificateExpiry: z.date().nullable().optional(),
  motorVehicleTaxDue: z.date().nullable().optional(),
  permitExpiryDate: z.date().nullable().optional(),
  nationalPermitExpiry: z.date().nullable().optional(),
  insuranceExpiry: z.date().nullable().optional(),
  pollutionCertificateExpiry: z.date().nullable().optional(),
  status: z.string().nullable().optional(),
})

// Status options for the machine
const statusOptions = ["In Use", "Under Maintenance", "Idle", "Decommissioned"]

// Owner type options
const ownerTypeOptions = ["Company", "Individual"]

export function MachineEditForm({ machineId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [originalData, setOriginalData] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const router = useNavigate()
  const dispatch = useDispatch()

  // File refs for each certificate
  const fileRefs = {
    fitnessCertificateFile: useRef(null),
    motorVehicleTaxFile: useRef(null),
    permitFile: useRef(null),
    nationalPermitFile: useRef(null),
    insuranceFile: useRef(null),
    pollutionCertificateFile: useRef(null),
    machineImageFile: useRef(null),
  }

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      isActive: true,
    },
  })

  // Handle file upload
  const handleFileUpload = (fieldName, event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: file
      }))
    }
  }

  // Remove uploaded file
  const removeFile = (fieldName) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[fieldName]
      return newFiles
    })
    if (fileRefs[fieldName]?.current) {
      fileRefs[fieldName].current.value = ''
    }
  }

  // Compare objects to find changes
  const getChangedFields = (original, current) => {
    const changes = {}
    
    for (const key in current) {
      if (key === 'primaryCategory' || key === 'machineCategory') {
        continue // Skip these as they're display-only
      }
      
      const originalValue = original[key]
      const currentValue = current[key]
      
      // Handle date comparison
      if (originalValue instanceof Date && currentValue instanceof Date) {
        if (originalValue.getTime() !== currentValue.getTime()) {
          changes[key] = currentValue
        }
      } else if (originalValue !== currentValue) {
        changes[key] = currentValue
      }
    }
    
    return changes
  }

  // Fetch machine data
  useEffect(() => {
    async function fetchMachineData() {
      try {
        setIsFetching(true)
        const response = await api.get(`/machinery/${machineId}`)
        

        if (!response.status) {
          throw new Error("Failed to fetch machine data")
        }

        const data = await response.data

        // Convert string dates to Date objects for the form
        const formattedData = {
          ...data,
          primaryCategory: data.primaryCategory.name,
          machineCategory: data.machineCategory.name,
          primaryCategoryId: data.primaryCategory?.id,
          machineCategoryId: data.machineCategory?.id,
          status: data?.isActive ? "In Use" : "Idle",
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
          fitnessCertificateExpiry: data.fitnessCertificateExpiry
            ? new Date(data.fitnessCertificateExpiry)
            : new Date(),
          motorVehicleTaxDue: data.motorVehicleTaxDue ? new Date(data.motorVehicleTaxDue) : new Date(),
          permitExpiryDate: data.permitExpiryDate ? new Date(data.permitExpiryDate) : new Date(),
          nationalPermitExpiry: data.nationalPermitExpiry ? new Date(data.nationalPermitExpiry) : new Date(),
          insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : new Date(),
          pollutionCertificateExpiry: data.pollutionCertificateExpiry
            ? new Date(data.pollutionCertificateExpiry)
            : new Date(),
        }

        // Store original data for comparison
        setOriginalData(formattedData)
        
        // Reset form with fetched data
        form.reset(formattedData)
      } catch (error) {
        console.error("Error fetching machine data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load machine data. Please try again.",
        })
      } finally {
        setIsFetching(false)
      }
    }

    fetchMachineData()
  }, [machineId, form])

  // Handle form submission
  async function onSubmit(data) {
    try {
      setIsLoading(true)

      const { primaryCategory, machineCategory, ...formattedData } = data
      
      // Get only changed fields
      const changedFields = getChangedFields(originalData, formattedData)
      
      // Create FormData for file upload
      const formData = new FormData()
      
      // Add changed fields to FormData
      Object.keys(changedFields).forEach(key => {
        const value = changedFields[key]
        if (value instanceof Date) {
          formData.append(key, value.toISOString())
        } else {
          formData.append(key, value)
        }
      })
      
      // Add uploaded files to FormData
      Object.keys(uploadedFiles).forEach(key => {
        formData.append(key, uploadedFiles[key])
      })
      
      // Only proceed if there are changes or files to upload
      if (Object.keys(changedFields).length === 0 && Object.keys(uploadedFiles).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to update.",
        })
        setIsLoading(false)
        return
      }

      const response = await api.put(`/machinery/${machineId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!response.status) {
        throw new Error("Failed to update machine")
      }

      toast({
        title: "Success",
        description: "Machine updated successfully",
      })

      // Navigate back to the machine details page
      dispatch(fetchMachines())
      router(`/machine/${machineId}`)

    } catch (error) {
      console.error("Error updating machine:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update machine. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center">
        {/* <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading machine data...</span> */}
        <Loading />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Machine Identification */}
              <FormField
                control={form.control}
                name="machineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter machine name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Category</FormLabel>
                    <FormControl>
                      <Input readOnly disabled placeholder="e.g., DG SET" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="machineCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Category</FormLabel>
                    <FormControl>
                      <Input readOnly disabled placeholder="e.g., DG 40 KVA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="erpCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ERP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DG-40-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., REG-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="machineNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MN-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="machineCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chassis Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CH-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ENG-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SN-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Machine Details */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Model 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Make 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Manufacture</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal bg-transparent ${!field.value ? "text-muted-foreground" : ""}`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ownership Information */}
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Owner 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ownerTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site ID</FormLabel>
                    <FormControl>
                      <Input disabled type="number" placeholder="e.g., 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Information */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>Is this machine currently active?</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Certification & Compliance</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Fitness Certificate */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fitnessCertificateExpiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fitness Certificate Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left bg-transparent font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRefs.fitnessCertificateFile}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('fitnessCertificateFile', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRefs.fitnessCertificateFile.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Certificate
                  </Button>
                  {uploadedFiles.fitnessCertificateFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>{uploadedFiles.fitnessCertificateFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('fitnessCertificateFile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Motor Vehicle Tax */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="motorVehicleTaxDue"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Motor Vehicle Tax Due</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left bg-transparent font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRefs.motorVehicleTaxFile}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('motorVehicleTaxFile', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRefs.motorVehicleTaxFile.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  {uploadedFiles.motorVehicleTaxFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>{uploadedFiles.motorVehicleTaxFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('motorVehicleTaxFile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Permit Expiry */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="permitExpiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Permit Expiry Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left bg-transparent font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRefs.permitFile}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('permitFile', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRefs.permitFile.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Permit
                  </Button>
                  {uploadedFiles.permitFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>{uploadedFiles.permitFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('permitFile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* National Permit */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nationalPermitExpiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>National Permit Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left bg-transparent font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRefs.nationalPermitFile}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('nationalPermitFile', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRefs.nationalPermitFile.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  {uploadedFiles.nationalPermitFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>{uploadedFiles.nationalPermitFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('nationalPermitFile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Expiry */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="insuranceExpiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Insurance Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left bg-transparent font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRefs.insuranceFile}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('insuranceFile', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRefs.insuranceFile.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Insurance
                  </Button>
                  {uploadedFiles.insuranceFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>{uploadedFiles.insuranceFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('insuranceFile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pollution Certificate */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="pollutionCertificateExpiry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pollution Certificate Expiry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left bg-transparent font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRefs.pollutionCertificateFile}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('pollutionCertificateFile', e)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRefs.pollutionCertificateFile.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Certificate
                  </Button>
                  {uploadedFiles.pollutionCertificateFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <span>{uploadedFiles.pollutionCertificateFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('pollutionCertificateFile')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Machine Image */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Machine Image</FormLabel>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      ref={fileRefs.machineImageFile}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('machineImageFile', e)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileRefs.machineImageFile.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    {uploadedFiles.machineImageFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <span>{uploadedFiles.machineImageFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('machineImageFile')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button type="button" variant="outline" onClick={() => router('/machine')} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}