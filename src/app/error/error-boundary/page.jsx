"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const goHome = () => {
    navigate("/");
    resetError();
  };

  const handleReset = () => {
    resetError();
    // Potentially refresh the data or just try to re-render
  };

  return (
    <div
      className="relative flex h-full min-h-[400px] flex-col items-center justify-center overflow-hidden bg-background p-4 rounded-xl border border-border/50 shadow-sm"
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
            <AlertTriangle className="h-16 w-16 md:h-24 md:w-24" />
          </span>
          ERROR
        </h1>

        <h2 className="mb-8 text-2xl font-medium md:text-3xl">
          Oops! Something went wrong
        </h2>

        <p className="mb-8 text-muted-foreground">
          An unexpected error occurred. Don't worry, our team has been notified
          and we're working on it.
        </p>

        {error && (
          <div className="mb-8 rounded-lg bg-destructive/10 p-4 text-left">
            <p className="text-sm font-mono text-destructive">{error.message}</p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button variant="outline" onClick={goHome} className="gap-2 bg-transparent">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export function withErrorBoundary(Component, fallback) {
  const WrappedComponent = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
