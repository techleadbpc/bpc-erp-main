import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router";
import { ArrowLeft, Shield, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Subtle mouse follow effect for the background gradient
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4"
        style={{
          backgroundImage: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(234, 179, 8, 0.15) 0%, transparent 25%)`,
        }}
      >
        {/* Decorative elements with warning colors */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 h-60 w-60 rounded-full bg-yellow-500/10 blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-yellow-500/20 p-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>

          <h1 className="relative mb-6 text-[12rem] font-bold leading-none tracking-tighter text-yellow-500/10 md:text-[16rem]">
            <span className="absolute inset-0 flex items-center justify-center text-[4rem] font-bold text-yellow-600 md:text-[6rem]">
              403
            </span>
            403
          </h1>

          <h2 className="mb-8 text-2xl font-medium text-yellow-700 dark:text-yellow-400 md:text-3xl">
            Access Forbidden
          </h2>

          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-200">
              You don't have permission to access this resource. This area is
              restricted.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              className="gap-2 border-yellow-500/50 text-yellow-700 hover:bg-yellow-500/10 hover:text-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-300"
            >
              <NavLink className={"flex flex-row gap-2"} to={'/'}>
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </NavLink>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
