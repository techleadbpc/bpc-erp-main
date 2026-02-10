import React from "react";

export function Spinner() {
  return (
    <div className="flex justify-center items-center flex-col h-64">
      <div style={{ borderColor: "hsl(var(--primary))" }} className="animate-spin rounded-full h-8 w-8 border-b-4"></div>
      <p className="mt-4 italic font-thin text-sm">Loading...</p>
    </div>
  );
}

function Loader({ size }) {
  let scale;

  switch (size) {
    case "sm":
      scale = "scale-50";
      break;
    case "md":
      scale = "scale-100";
      break;
    case "lg":
      scale = "scale-125";
      break;
    default:
      scale = "scale-100";
  }

  return (
    <div className={`flex flex-row justify-center gap-2 ${scale}`}>
      <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:.7s]"></div>
      <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:.3s]"></div>
      <div className="w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:.7s]"></div>
    </div>
  );
}

export default Loader;
