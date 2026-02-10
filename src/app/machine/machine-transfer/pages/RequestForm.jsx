import { useState } from "react"
import { useNavigate } from "react-router"
import { useTransfer } from "../contexts/TransferContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FormDescription, FormLabel } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { FileText, Truck } from "lucide-react"

// Machine types for selection
const MACHINE_TYPES = ["Excavator", "Bulldozer", "Crane", "Loader", "Forklift", "Roller", "Grader", "Paver"]

export default function RequestForm() {
  const { createRequest, currentUser, sites } = useTransfer()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    requestingSiteId: currentUser.siteId || "",
    machineType: "",
    requiredDate: "",
    duration: "",
    purpose: "",
    additionalNotes: "",
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.requestingSiteId || !formData.machineType || !formData.requiredDate || !formData.purpose) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Create request
    const requestId = createRequest({
      ...formData,
      requestingSiteId: Number(formData.requestingSiteId),
    })

    toast({
      title: "Request Submitted",
      description: "Your machine transfer request has been submitted successfully",
    })

    // Navigate to request details
    navigate(`/request/${requestId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Truck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">New Machine Transfer Request</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>Fill in the details to request a machine transfer to your site</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <FormLabel htmlFor="requestingSiteId">Requesting Site</FormLabel>
              <Select
                value={formData.requestingSiteId.toString()}
                onValueChange={(value) => handleChange("requestingSiteId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id.toString()}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>The site that needs the machine</FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="machineType">Machine Type</FormLabel>
              <Select value={formData.machineType} onValueChange={(value) => handleChange("machineType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  {MACHINE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="requiredDate">Required Date</FormLabel>
              <Input
                type="date"
                id="requiredDate"
                value={formData.requiredDate}
                onChange={(e) => handleChange("requiredDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="duration">Duration (days)</FormLabel>
              <Input
                type="number"
                id="duration"
                placeholder="Number of days needed"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="purpose">Purpose</FormLabel>
              <Textarea
                id="purpose"
                placeholder="Explain why this machine is needed"
                value={formData.purpose}
                onChange={(e) => handleChange("purpose", e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="additionalNotes">Additional Notes (Optional)</FormLabel>
              <Textarea
                id="additionalNotes"
                placeholder="Any additional information"
                value={formData.additionalNotes}
                onChange={(e) => handleChange("additionalNotes", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit">
              <FileText className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

