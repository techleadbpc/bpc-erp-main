"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

// Mock user data for demonstration
const mockUser = {
  id: "user123",
  name: "John Doe",
  role: "admin", // Options: admin, site_incharge, project_manager, store_manager
}

// Role-based access control configuration
const roleAccess = {
  "/machine-transfer": ["admin", "site_incharge", "project_manager", "store_manager"],
  "/machine-transfer/new": ["admin", "site_incharge", "project_manager", "store_manager"],
  "/machine-transfer/approve": ["admin", "mechanical_head"],
  "/machine-transfer/dispatch": ["admin", "store_manager"],
  "/machine-transfer/receive": ["admin", "store_manager"],
  "/machine-transfer/history": ["admin", "site_incharge", "project_manager", "store_manager"],
}

export function ProtectedRoute({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if the current user has access to the current route
    const checkAccess = () => {
      // Get the allowed roles for the current path
      const allowedRoles = roleAccess[pathname] || []

      // Check if the user's role is in the allowed roles
      const hasAccess = allowedRoles.includes(mockUser.role)

      if (!hasAccess) {
        // Redirect to unauthorized page or dashboard
        router.push("/unauthorized")
      } else {
        setAuthorized(true)
      }

      setLoading(false)
    }

    checkAccess()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return children
}

