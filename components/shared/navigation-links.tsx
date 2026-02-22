"use client";

import { MapPin, Navigation } from "lucide-react";

interface NavigationLinksProps {
  address: string;
  mode?: "compact" | "full";
}

export function NavigationLinks({ address, mode = "compact" }: NavigationLinksProps) {
  const encoded = encodeURIComponent(address);
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const wazeUrl = `https://waze.com/ul?q=${encoded}`;

  if (mode === "compact") {
    return (
      <div className="flex gap-1.5">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold no-underline transition-colors hover:opacity-80"
          style={{ background: "#EFF6FF", color: "#1D4ED8" }}
        >
          <MapPin className="h-3 w-3" />
          Maps
        </a>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold no-underline transition-colors hover:opacity-80"
          style={{ background: "#F0FDF4", color: "#15803D" }}
        >
          <Navigation className="h-3 w-3" />
          Waze
        </a>
      </div>
    );
  }

  // Full mode — large tappable buttons
  return (
    <div className="flex gap-3">
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-white py-3 text-[13px] font-semibold no-underline transition-colors hover:bg-blue-50"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", color: "#1D4ED8" }}
      >
        <MapPin className="h-4 w-4" />
        Google Maps
      </a>
      <a
        href={wazeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-white py-3 text-[13px] font-semibold no-underline transition-colors hover:bg-green-50"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", color: "#15803D" }}
      >
        <Navigation className="h-4 w-4" />
        Waze
      </a>
    </div>
  );
}
