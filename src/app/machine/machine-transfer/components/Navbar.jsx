import { Link } from "react-router"
import { useTransfer } from "../contexts/TransferContext"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Truck, Home, FileText, CheckSquare, User } from "lucide-react"

export default function Navbar() {
  const { currentUser, users, switchUser } = useTransfer()

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-6 w-6" />
            <span className="text-xl font-bold">Machine Transfer System</span>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
              <div className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link to="/request" className="px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>New Request</span>
              </div>
            </Link>
            <Link to="/approvals" className="px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-4 w-4" />
                <span>Approvals</span>
              </div>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{currentUser.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Switch User (Demo)</div>
                {users.map((user) => (
                  <DropdownMenuItem key={user.id} onClick={() => switchUser(user.id)}>
                    {user.name} - {user.role}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

