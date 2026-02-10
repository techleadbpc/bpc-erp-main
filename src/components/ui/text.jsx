import React from "react";

function Text({ children, className }) {
  return (
    <span className={`text-muted-foreground text-xs font-[400] ${className}`}>
      {children}
    </span>
  );
}

export default Text;
