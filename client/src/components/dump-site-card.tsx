import { DumpSite } from "@shared/schema";
import { MapPin, Clock, DollarSign, Phone } from "lucide-react";

interface DumpSiteCardProps {
  dumpSite: DumpSite;
  distance?: string;
}

export function DumpSiteCard({ dumpSite, distance = "2.4 miles away" }: DumpSiteCardProps) {
  return (
    <div className="border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 transition duration-200">
      <h3 className="font-medium text-neutral-900">{dumpSite.name}</h3>
      <p className="text-sm text-neutral-600 mb-2">{distance}</p>
      
      <div className="flex items-center text-sm mb-1">
        <Clock className="h-4 w-4 mr-1 text-neutral-500" />
        <span>{dumpSite.operatingHours || "Hours not specified"}</span>
      </div>
      
      <div className="flex items-center text-sm mb-1">
        <DollarSign className="h-4 w-4 mr-1 text-neutral-500" />
        <span>
          {dumpSite.minFee ? `$${dumpSite.minFee} min fee, ` : ""}
          {dumpSite.feePerTon ? `$${dumpSite.feePerTon}/ton` : "Fees not specified"}
        </span>
      </div>
      
      <div className="flex items-center text-sm">
        <Phone className="h-4 w-4 mr-1 text-neutral-500" />
        <span>{dumpSite.phone || "No phone number"}</span>
      </div>
    </div>
  );
}
