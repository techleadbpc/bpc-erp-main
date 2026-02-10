import { useParams, Link } from "react-router"
import { useTransfer } from "../contexts/TransferContext"
import StatusBadge from "../components/StatusBadge"
import StatusTimeline from "../components/StatusTimeline"
import ApprovalActions from "../components/ApprovalActions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle, Clock, MapPin, Truck } from "lucide-react"

export default function TransferStatus() {
  const { id } = useParams()
  const { transferRequests, sites, machines } = useTransfer()

  // Find the request
  const request = transferRequests.find((req) => req.id === id)

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Transfer Not Found</h1>
        <p className="mb-6">The transfer you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  // Get related data
  const requestingSite = sites.find((s) => s.id === request.requestingSiteId)
  const sourceSite = sites.find((s) => s.id === request.sourceSiteId)
  const machine = machines.find((m) => m.id === request.machineId)

  // Determine the current step in the process
  const getStepStatus = (step) => {
    const STATUS = {
      PENDING_PM: "pending_pm",
      PENDING_MECHANICAL: "pending_mechanical",
      AWAITING_SOURCE_PM: "awaiting_source_pm",
      APPROVED: "approved",
      IN_TRANSIT: "in_transit",
      RECEIVED: "received",
      REJECTED: "rejected",
    }

    switch (step) {
      case "request":
        return "complete"
      case "pm_approval":
        return request.status === STATUS.REJECTED &&
          request.history.some((h) => h.status === STATUS.REJECTED && h.notes.includes("PM"))
          ? "rejected"
          : request.status === STATUS.PENDING_PM
            ? "current"
            : "complete"
      case "mechanical_approval":
        return request.status === STATUS.PENDING_MECHANICAL
          ? "current"
          : request.status === STATUS.PENDING_PM
            ? "pending"
            : request.status === STATUS.REJECTED &&
                request.history.some((h) => h.status === STATUS.REJECTED && h.notes.includes("PM"))
              ? "rejected"
              : "complete"
      case "source_pm_approval":
        return request.status === STATUS.AWAITING_SOURCE_PM
          ? "current"
          : request.status === STATUS.PENDING_MECHANICAL || request.status === STATUS.PENDING_PM
            ? "pending"
            : request.status === STATUS.REJECTED &&
                request.history.some((h) => h.status === STATUS.REJECTED && !h.notes.includes("PM"))
              ? "rejected"
              : "complete"
      case "transfer":
        return request.status === STATUS.APPROVED
          ? "current"
          : request.status === STATUS.IN_TRANSIT || request.status === STATUS.RECEIVED
            ? "complete"
            : "pending"
      case "received":
        return request.status === STATUS.IN_TRANSIT
          ? "current"
          : request.status === STATUS.RECEIVED
            ? "complete"
            : "pending"
      default:
        return "pending"
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Transfer Status</h1>
        </div>
        <Link to={`/request/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Machine Transfer #{request.id.slice(-4)}</span>
            <StatusBadge status={request.status} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">From</p>
              <h3 className="text-lg font-medium">{sourceSite?.name || "Not Assigned"}</h3>
              {machine && <p className="text-sm">{machine.name}</p>}
            </div>

            <div className="flex-1 flex justify-center">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">To</p>
              <h3 className="text-lg font-medium">{requestingSite?.name || "Unknown"}</h3>
              <p className="text-sm">{request.machineType}</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2"></div>

            <div className="relative flex justify-between">
              {/* Step 1: Request */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    getStepStatus("request") === "complete"
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <p className="text-xs mt-2">Request</p>
              </div>

              {/* Step 2: PM Approval */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    getStepStatus("pm_approval") === "complete"
                      ? "bg-green-500 text-white"
                      : getStepStatus("pm_approval") === "current"
                        ? "bg-blue-500 text-white"
                        : getStepStatus("pm_approval") === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStepStatus("pm_approval") === "current" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs mt-2">PM Approval</p>
              </div>

              {/* Step 3: Mechanical Approval */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    getStepStatus("mechanical_approval") === "complete"
                      ? "bg-green-500 text-white"
                      : getStepStatus("mechanical_approval") === "current"
                        ? "bg-blue-500 text-white"
                        : getStepStatus("mechanical_approval") === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStepStatus("mechanical_approval") === "current" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs mt-2">Mechanical</p>
              </div>

              {/* Step 4: Source PM Approval */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    getStepStatus("source_pm_approval") === "complete"
                      ? "bg-green-500 text-white"
                      : getStepStatus("source_pm_approval") === "current"
                        ? "bg-blue-500 text-white"
                        : getStepStatus("source_pm_approval") === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStepStatus("source_pm_approval") === "current" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs mt-2">Source PM</p>
              </div>

              {/* Step 5: Transfer */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    getStepStatus("transfer") === "complete"
                      ? "bg-green-500 text-white"
                      : getStepStatus("transfer") === "current"
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStepStatus("transfer") === "current" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Truck className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs mt-2">In Transit</p>
              </div>

              {/* Step 6: Received */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    getStepStatus("received") === "complete"
                      ? "bg-green-500 text-white"
                      : getStepStatus("received") === "current"
                        ? "bg-blue-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {getStepStatus("received") === "current" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </div>
                <p className="text-xs mt-2">Received</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApprovalActions request={request} />

      <StatusTimeline history={request.history} />
    </div>
  )
}

