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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-600">Find or create a dump run in your area</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col items-center justify-center h-24 bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-6 w-6 mb-2" />
          <span className="font-medium">Create Dump Run</span>
        </Button>
        
        <Button 
          onClick={() => setIsPickupModalOpen(true)}
          className="flex flex-col items-center justify-center h-24 bg-orange-500 text-white hover:bg-orange-600"
        >
          <Truck className="h-6 w-6 mb-2" />
          <span className="font-medium">Request Pickup</span>
        </Button>
        
        <Button 
          onClick={() => setIsPickupModalOpen(true)}
          className="flex flex-col items-center justify-center h-24 bg-blue-500 text-white hover:bg-blue-600"
        >
          <Calendar className="h-6 w-6 mb-2" />
          <span className="font-medium">Schedule Weekly</span>
        </Button>
        
        <Button 
          variant="default"
          className="flex flex-col items-center justify-center h-24 bg-gray-800 text-white hover:bg-gray-900"
        >
          <MapPin className="h-6 w-6 mb-2" />
          <span className="font-medium">Find Dump Sites</span>
        </Button>
      </div>
      
      {/* Active & Available Runs */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-neutral-800">Active & Available Runs</h2>
          <div className="flex space-x-2 flex-wrap gap-2">
            <div className="relative">
              <Input
                placeholder="Search by location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            
            <Select 
              value={filterValue} 
              onValueChange={setFilterValue}
            >
              <SelectTrigger className="w-36">
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
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center p-8">
                <p className="text-neutral-600">No dump runs found with the current filters</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                >
                  Create a Dump Run
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Nearby Dump Sites */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Nearby Dump Sites</h2>
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <Button
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 h-auto"
                size="sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>
            
            <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-12 w-12 text-gray-400" />
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
      <div>
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Recent Activity</h2>
        <Card>
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
                <li className="p-6 text-center">
                  <p className="text-neutral-600">No recent activity</p>
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
