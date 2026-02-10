"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RequisitionTable } from "@/components/material-requisition/RequisitionTable"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useNavigate } from "react-router"

export function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Navigate to create requisition page
  const handleCreateRequisition = () => {
    // In a real app, you would use React Router's navigate
    navigate("/material-requisition/new")
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Material Requisitions</h1>
          <p className="text-muted-foreground">View and manage all material requisitions</p>
        </div>
        <Button onClick={handleCreateRequisition} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          New Requisition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requisition List</CardTitle>
          <CardDescription>View all requisitions across sites and track their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading requisitions...</p>
              </div>
            </div>
          ) : (
            <RequisitionTable requisitions={requisitions} />
            // <div></div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

