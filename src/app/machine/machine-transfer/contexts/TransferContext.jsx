import { createContext, useContext, useState, useEffect } from "react"

// Define the status constants
export const STATUS = {
  PENDING_PM: "Pending PM Approval",
  PENDING_MECHANICAL: "Pending Mechanical Approval",
  AWAITING_SOURCE_PM: "Awaiting Source PM",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IN_TRANSIT: "In Transit",
  RECEIVED: "Received",
}

// Sample data for sites and machines
const SITES = [
  { id: 1, name: "Site A", pmId: 101 },
  { id: 2, name: "Site B", pmId: 102 },
  { id: 3, name: "Site C", pmId: 103 },
  { id: 4, name: "Site D", pmId: 104 },
]

const MACHINES = [
  { id: 1, name: "Excavator XL2000", type: "Excavator", siteId: 1 },
  { id: 2, name: "Bulldozer B500", type: "Bulldozer", siteId: 1 },
  { id: 3, name: "Crane C300", type: "Crane", siteId: 2 },
  { id: 4, name: "Loader L100", type: "Loader", siteId: 2 },
  { id: 5, name: "Excavator XL1000", type: "Excavator", siteId: 3 },
  { id: 6, name: "Forklift F200", type: "Forklift", siteId: 3 },
  { id: 7, name: "Bulldozer B300", type: "Bulldozer", siteId: 4 },
  { id: 8, name: "Crane C500", type: "Crane", siteId: 4 },
]

// Sample users
const USERS = [
  { id: 101, name: "John Doe", role: "Project Manager", siteId: 1 },
  { id: 102, name: "Jane Smith", role: "Project Manager", siteId: 2 },
  { id: 103, name: "Mike Johnson", role: "Project Manager", siteId: 3 },
  { id: 104, name: "Sarah Williams", role: "Project Manager", siteId: 4 },
  { id: 201, name: "Robert Brown", role: "Mechanical Head", siteId: null },
]

// Create the context
const TransferContext = createContext()

export function TransferProvider({ children }) {
  // Initialize with sample transfer requests or load from localStorage
  const [transferRequests, setTransferRequests] = useState(() => {
    const savedRequests = localStorage.getItem("transferRequests")
    return savedRequests ? JSON.parse(savedRequests) : []
  })

  // Current user - in a real app, this would come from authentication
  const [currentUser, setCurrentUser] = useState(USERS[0])

  // Save to localStorage whenever transferRequests changes
  useEffect(() => {
    localStorage.setItem("transferRequests", JSON.stringify(transferRequests))
  }, [transferRequests])

  // Create a new transfer request
  const createRequest = (requestData) => {
    const newRequest = {
      id: Date.now().toString(),
      ...requestData,
      status: STATUS.PENDING_PM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          status: STATUS.PENDING_PM,
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          userName: currentUser.name,
          notes: "Request created",
        },
      ],
    }

    setTransferRequests((prev) => [...prev, newRequest])
    return newRequest.id
  }

  // Update a transfer request status
  const updateRequestStatus = (requestId, newStatus, notes = "") => {
    setTransferRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const historyEntry = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            userName: currentUser.name,
            notes,
          }

          return {
            ...req,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            history: [...req.history, historyEntry],
          }
        }
        return req
      }),
    )
  }

  // Assign source site and machine
  const assignSourceSite = (requestId, sourceSiteId) => {
    setTransferRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const historyEntry = {
            status: STATUS.AWAITING_SOURCE_PM,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            userName: currentUser.name,
            notes: `Source site assigned: ${SITES.find((s) => s.id === sourceSiteId)?.name}`,
          }

          return {
            ...req,
            sourceSiteId,
            status: STATUS.AWAITING_SOURCE_PM,
            updatedAt: new Date().toISOString(),
            history: [...req.history, historyEntry],
          }
        }
        return req
      }),
    )
  }

  // Assign machine to request
  const assignMachine = (requestId, machineId) => {
    setTransferRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const machine = MACHINES.find((m) => m.id === machineId)
          const historyEntry = {
            status: req.status,
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
            userName: currentUser.name,
            notes: `Machine assigned: ${machine?.name}`,
          }

          return {
            ...req,
            machineId,
            updatedAt: new Date().toISOString(),
            history: [...req.history, historyEntry],
          }
        }
        return req
      }),
    )
  }

  // Switch current user (for demo purposes)
  const switchUser = (userId) => {
    const user = USERS.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
    }
  }

  // Context value
  const value = {
    transferRequests,
    currentUser,
    sites: SITES,
    machines: MACHINES,
    users: USERS,
    createRequest,
    updateRequestStatus,
    assignSourceSite,
    assignMachine,
    switchUser,
  }

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>
}

export function useTransfer() {
  const context = useContext(TransferContext)
  if (!context) {
    throw new Error("useTransfer must be used within a TransferProvider")
  }
  return context
}

