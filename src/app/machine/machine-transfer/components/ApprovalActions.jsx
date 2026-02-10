"use client"

import { useState } from "react"
import { useTransfer, STATUS } from "../contexts/TransferContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Truck, ArrowRight } from "lucide-react"

export default function ApprovalActions({ request }) {
  const { currentUser, sites, machines, updateRequestStatus, assignSourceSite, assignMachine } = useTransfer()

  const [notes, setNotes] = useState("")
  const [selectedSiteId, setSelectedSiteId] = useState("")
  const [selectedMachineId, setSelectedMachineId] = useState("")

  if (!request) return null

  // Filter machines by selected site and requested type
  const availableMachines = machines.filter(
    (m) => m.siteId === Number(selectedSiteId) && (!request.machineType || m.type === request.machineType),
  )

  // Determine which actions to show based on status and user role
  const showPMApproval =
    request.status === STATUS.PENDING_PM &&
    currentUser.siteId === request.requestingSiteId &&
    currentUser.role === "Project Manager"

  const showMechanicalAssignment =
    request.status === STATUS.PENDING_MECHANICAL && currentUser.role === "Mechanical Head"

  const showSourcePMApproval =
    request.status === STATUS.AWAITING_SOURCE_PM &&
    currentUser.siteId === request.sourceSiteId &&
    currentUser.role === "Project Manager"

  const showTransitActions =
    request.status === STATUS.APPROVED &&
    (currentUser.siteId === request.sourceSiteId || currentUser.role === "Mechanical Head")

  const showReceiveActions = request.status === STATUS.IN_TRANSIT && currentUser.siteId === request.requestingSiteId

  // Handle PM approval/rejection
  const handlePMAction = (approved) => {
    const newStatus = approved ? STATUS.PENDING_MECHANICAL : STATUS.REJECTED
    updateRequestStatus(request.id, newStatus, notes || (approved ? "Approved by PM" : "Rejected by PM"))
    setNotes("")
  }

  // Handle Mechanical Head assignment
  const handleAssignSource = () => {
    if (!selectedSiteId) return
    assignSourceSite(request.id, Number(selectedSiteId))
    setNotes("")
    setSelectedSiteId("")
  }

  // Handle Source PM approval/rejection
  const handleSourcePMAction = (approved) => {
    if (approved && !selectedMachineId) return

    const newStatus = approved ? STATUS.APPROVED : STATUS.REJECTED
    if (approved) {
      assignMachine(request.id, Number(selectedMachineId))
    }
    updateRequestStatus(request.id, newStatus, notes || (approved ? "Approved by Source PM" : "Rejected by Source PM"))
    setNotes("")
    setSelectedMachineId("")
  }

  // Handle transit status update
  const handleTransitUpdate = () => {
    updateRequestStatus(request.id, STATUS.IN_TRANSIT, notes || "Machine is in transit")
    setNotes("")
  }

  // Handle receive confirmation
  const handleReceiveConfirmation = () => {
    updateRequestStatus(request.id, STATUS.RECEIVED, notes || "Machine received at destination")
    setNotes("")
  }

  if (
    !showPMApproval &&
    !showMechanicalAssignment &&
    !showSourcePMApproval &&
    !showTransitActions &&
    !showReceiveActions
  ) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Actions Required</CardTitle>
        <CardDescription>
          {showPMApproval && "Approve or reject this machine transfer request"}
          {showMechanicalAssignment && "Assign a source site for this machine"}
          {showSourcePMApproval && "Approve or reject providing a machine"}
          {showTransitActions && "Update the machine transit status"}
          {showReceiveActions && "Confirm receipt of the machine"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(showMechanicalAssignment || showSourcePMApproval) && (
            <div className="space-y-2">
              {showMechanicalAssignment && (
                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites
                      .filter((site) => site.id !== request.requestingSiteId)
                      .map((site) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              {showSourcePMApproval && (
                <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine to transfer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMachines.length > 0 ? (
                      availableMachines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id.toString()}>
                          {machine.name} ({machine.type})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No matching machines available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {showPMApproval && (
          <>
            <Button variant="outline" onClick={() => handlePMAction(false)}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => handlePMAction(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </>
        )}

        {showMechanicalAssignment && (
          <Button onClick={handleAssignSource} disabled={!selectedSiteId} className="ml-auto">
            <ArrowRight className="mr-2 h-4 w-4" />
            Assign Source Site
          </Button>
        )}

        {showSourcePMApproval && (
          <>
            <Button variant="outline" onClick={() => handleSourcePMAction(false)}>
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => handleSourcePMAction(true)} disabled={!selectedMachineId}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Assign Machine
            </Button>
          </>
        )}

        {showTransitActions && (
          <Button onClick={handleTransitUpdate} className="ml-auto">
            <Truck className="mr-2 h-4 w-4" />
            Mark as In Transit
          </Button>
        )}

        {showReceiveActions && (
          <Button onClick={handleReceiveConfirmation} className="ml-auto">
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirm Receipt
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

