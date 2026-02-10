import { useState, useEffect } from "react"
import { NavLink } from "react-router"
import { ArrowLeft, Search, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function NotFoundPage() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Subtle mouse follow effect for the background gradient
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setPosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4"
      style={{
        backgroundImage: `radial-gradient(circle at ${position.x}% ${position.y}%, hsl(var(--muted)) 0%, transparent 25%)`,
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-muted/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 h-60 w-60 rounded-full bg-muted/20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-3xl text-center">
        <h1 className="relative mb-6 text-[12rem] font-bold leading-none tracking-tighter text-primary/10 md:text-[16rem]">
          <span className="absolute inset-0 flex items-center justify-center text-[4rem] font-bold text-foreground md:text-[6rem]">
            404
          </span>
          404
        </h1>

        <h2 className="mb-8 text-2xl font-medium md:text-3xl">Oops! This page seems to have wandered off</h2>

        <p className="mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>


        {/* Navigation options */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="gap-2">
          <NavLink className={"flex flex-row gap-2"} to={'/'}>
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </NavLink>
          </Button>
        </div>
      </div>
    </div>
  )
}

