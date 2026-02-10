"use client"

import { useParams, Link } from "react-router"
import { useTransfer } from "../contexts/TransferContext"
import StatusBadge from "../components/StatusBadge"
import StatusTimeline from "../components/StatusTimeline"
import ApprovalActions from "../components/ApprovalActions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, MapPin, Truck } from "lucide-react"

export default function RequestDetails() {
  const { id } = useParams()
  const { transferRequests, sites, machines, currentUser } = useTransfer()

  // Find the request
  const request = transferRequests.find((req) => req.id === id)

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Request Not Found</h1>
        <p className="mb-6">The transfer request you're looking for doesn't exist or has been removed.</p>
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Transfer Request #{request.id.slice(-4)}</h1>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={request.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Required By</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{request.requiredDate ? new Date(request.requiredDate).toLocaleDateString() : "Not specified"}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Requesting Site</h3>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{requestingSite?.name || "Unknown"}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Machine Type</h3>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>{request.machineType || machine?.type || "Not specified"}</span>
              </div>
            </div>

            {request.duration && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                <span>{request.duration} days</span>
              </div>
            )}

            {request.purpose && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Purpose</h3>
                <p className="text-sm">{request.purpose}</p>
              </div>
            )}

            {request.additionalNotes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Additional Notes</h3>
                <p className="text-sm">{request.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Source Site</h3>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{sourceSite?.name || "Not assigned yet"}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Machine</h3>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>{machine?.name || "Not assigned yet"}</span>
              </div>
            </div>

            {request.status === "Rejected" && request.history && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Rejection Reason</h3>
                <p className="text-sm text-red-500">
                  {request.history.find((h) => h.status === "Rejected")?.notes || "No reason provided"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ApprovalActions request={request} />

      <StatusTimeline history={request.history} />
    </div>
  )
}

