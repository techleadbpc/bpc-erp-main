"use client"

import { useToast } from "@/hooks/use-toast"

export function useNotifications() {
  const { toast } = useToast()

  const showNotification = (title, description, variant = "default") => {
    toast({
      title,
      description,
      variant,
    })
  }

  const notifyApproval = (transferId, machineName) => {
    showNotification("Transfer Approved", `Transfer ${transferId} for ${machineName} has been approved.`)
  }

  const notifyRejection = (transferId, machineName, reason) => {
    showNotification(
      "Transfer Rejected",
      `Transfer ${transferId} for ${machineName} has been rejected: ${reason}`,
      "destructive",
    )
  }

  const notifyDispatch = (transferId, machineName, toSite) => {
    showNotification("Machine Dispatched", `${machineName} (${transferId}) has been dispatched to ${toSite}.`)
  }

  const notifyReceived = (transferId, machineName, atSite) => {
    showNotification("Machine Received", `${machineName} (${transferId}) has been received at ${atSite}.`)
  }

  return {
    showNotification,
    notifyApproval,
    notifyRejection,
    notifyDispatch,
    notifyReceived,
  }
}

