import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DumpRun, DumpSite, Activity } from "@shared/schema";
import { Layout } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { DumpRunCard } from "@/components/dump-run-card";
import { DumpSiteCard } from "@/components/dump-site-card";
import { ActivityItem } from "@/components/activity-item";
import { CreateDumpRunModal } from "@/components/modals/create-dump-run-modal";
import { RequestPickupModal } from "@/components/modals/request-pickup-modal";
import { DumpRunDetailModal } from "@/components/modals/dump-run-detail-modal";
import { Plus, Truck, Calendar, MapPin, Search } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const [searchLocation, setSearchLocation] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [selectedDumpRun, setSelectedDumpRun] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch dump runs
  const { data: dumpRuns = [] } = useQuery<DumpRun[]>({
    queryKey: ["/api/dump-runs"],
  });

  // Fetch dump sites
  const { data: dumpSites = [] } = useQuery<DumpSite[]>({
    queryKey: ["/api/dump-sites"],
  });

  // Fetch activities
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Filter dump runs based on search and filter
  const filteredDumpRuns = dumpRuns.filter(run => {
    if (searchLocation && !run.location.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }

    if (filterValue === "all") return true;
    if (filterValue === "nearby") {
      // In a real app, we would filter by geolocation
      return true;
    }
    if (filterValue === "today") {
      const today = new Date();
      const runDate = new Date(run.date);
      return (
        today.getDate() === runDate.getDate() &&
        today.getMonth() === runDate.getMonth() &&
        today.getFullYear() === runDate.getFullYear()
      );
    }
    if (filterValue === "hasSpace") {
      return run.maxParticipants > 1;
    }
    return true;
  });

  const handleOpenDetailModal = (runId: number) => {
    setSelectedDumpRun(runId);
    setIsDetailModalOpen(true);
  };

  return (
    <Layout>
      <div className="mb-8 animate-in">
        <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Find or create a dump run in your area</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-in" style={{ animationDelay: "100ms" }}>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center justify-center h-28 shadow-lg hover:shadow-xl transition-all duration-300 group"
          variant="gradient"
        >
          <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-base">Create Dump Run</span>
        </Button>
        
        <Button 
          onClick={() => setIsPickupModalOpen(true)}
          className="flex flex-col items-center justify-center h-28 bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Truck className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-base">Request Pickup</span>
        </Button>
        
        <Button 
          onClick={() => setIsPickupModalOpen(true)}
          className="flex flex-col items-center justify-center h-28 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Calendar className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-base">Schedule Weekly</span>
        </Button>
        
        <Button 
          className="flex flex-col items-center justify-center h-28 bg-gradient-to-br from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-black shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <MapPin className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-base">Find Dump Sites</span>
        </Button>
      </div>
      
      {/* Active & Available Runs */}
      <div className="mb-10 animate-in" style={{ animationDelay: "200ms" }}>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h2 className="text-2xl font-bold">Active & Available Runs</h2>
          <div className="flex space-x-2 flex-wrap gap-2">
            <div className="relative">
              <Input
                placeholder="Search by location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm w-64 glass"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            </div>
            
            <Select 
              value={filterValue} 
              onValueChange={setFilterValue}
            >
              <SelectTrigger className="w-40 glass">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="nearby">Nearby (5mi)</SelectItem>
                <SelectItem value="today">Today only</SelectItem>
                <SelectItem value="hasSpace">Has space</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDumpRuns.length > 0 ? (
            filteredDumpRuns.map(run => (
              <DumpRunCard
                key={run.id}
                dumpRun={run}
                isOrganizer={run.organizerId === user?.id}
                onClickJoin={() => handleOpenDetailModal(run.id)}
                onClickManage={() => handleOpenDetailModal(run.id)}
              />
            ))
          ) : (
            <Card className="col-span-full glass">
              <CardContent className="pt-6 text-center p-12">
                <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-6">No dump runs found with the current filters</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="gradient"
                  size="lg"
                >
                  Create a Dump Run
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Nearby Dump Sites */}
      <div className="mb-10 animate-in" style={{ animationDelay: "300ms" }}>
        <h2 className="text-2xl font-bold mb-6">Nearby Dump Sites</h2>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="mb-4">
              <Button
                variant="gradient"
                size="sm"
                className="h-auto"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>
            
            <div className="aspect-w-16 aspect-h-9 mb-6 bg-gradient-to-br from-muted/50 to-muted rounded-xl flex items-center justify-center h-64">
              <MapPin className="h-16 w-16 text-muted-foreground/40 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dumpSites.map(site => (
                <DumpSiteCard 
                  key={site.id} 
                  dumpSite={site} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="animate-in" style={{ animationDelay: "400ms" }}>
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <Card className="glass">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {activities.length > 0 ? (
                activities.map(activity => (
                  <ActivityItem 
                    key={activity.id} 
                    activity={activity} 
                  />
                ))
              ) : (
                <li className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Modals */}
      {isCreateModalOpen && (
        <CreateDumpRunModal
          onClose={() => setIsCreateModalOpen(false)}
          dumpSites={dumpSites}
        />
      )}
      
      {isPickupModalOpen && (
        <RequestPickupModal
          onClose={() => setIsPickupModalOpen(false)}
        />
      )}
      
      {isDetailModalOpen && selectedDumpRun && (
        <DumpRunDetailModal
          dumpRunId={selectedDumpRun}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedDumpRun(null);
          }}
        />
      )}
    </Layout>
  );
}
