import React from "react";
import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "@/common/context/theme/theme-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

const ThemeCustomizer = () => {
  const { theme, color, updateTheme, updateColor } = useTheme();

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent sideOffset={5} align={"end"}>
          <div className="p-2 space-y-4">
            {/* Light/Dark Mode Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs">Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                <>
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={() => updateTheme("light")}
                    className={
                      cn(theme === "light" && "border-2 border-primary") + ""
                    }
                  >
                    <Sun className="mr-1 -translate-x-1" />
                    <span className="mt-1">Light</span>
                  </Button>
                  <Button
                    variant={"outline"}
                    size="sm"
                    onClick={() => updateTheme("dark")}
                    className={cn(
                      theme === "dark" && "border-2 border-primary"
                    )}
                  >
                    <Moon className="mr-1 -translate-x-1" />
                    <span className="mt-1">Dark</span>
                  </Button>
                </>
              </div>
            </div>

            {/* Color Scheme Selection */}

            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Zinc", code: "black" },
                  { label: "Red", code: "red", bg: '#DC2626' },
                  { label: "Blue", code: "blue", bg: '#2563EB' },
                  { label: "Green", code: "green", bg: '#16A34A' },
                ].map((colortheme) => {
                    const isActive = colortheme.code === color;
                  return (
                    <Button
                      variant={"outline"}
                      size="sm"
                      key={colortheme.label}
                      onClick={() => updateColor(colortheme.code)}
                      className={cn(
                        "justify-center items-center",
                        isActive && "border-2 border-primary"
                      )}
                    >
                      <span
                        className={cn(
                          "mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--theme-primary]"
                        )}
                        style={{
                          background: colortheme.code,
                        }}
                      >
                        {isActive && <Check className="h-4 w-4 text-white" />}
                      </span>
                      {colortheme.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ThemeCustomizer;
