import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DumpRunCard } from "@/components/dump-run-card";
import { DumpSiteCard } from "@/components/dump-site-card";
import { CreateDumpRunModal } from "@/components/modals/create-dump-run-modal";
import { DumpRunDetailModal } from "@/components/modals/dump-run-detail-modal";
import { RequestPickupModal } from "@/components/modals/request-pickup-modal";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Loader2, Recycle, ArrowRight, Calendar, MessageCircle, Truck } from "lucide-react";
import { DumpRun, DumpSite } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedDumpRun, setSelectedDumpRun] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch active dump runs
  const {
    data: dumpRuns = [] as DumpRun[],
    isLoading: isLoadingRuns,
    error: runsError,
  } = useQuery<DumpRun[]>({
    queryKey: ["/api/dump-runs"],
    enabled: !!user,
  });

  // Fetch dump sites
  const {
    data: dumpSites = [] as DumpSite[],
    isLoading: isLoadingSites,
    error: sitesError,
  } = useQuery<DumpSite[]>({
    queryKey: ["/api/dump-sites"],
    enabled: !!user,
  });

  const handleOpenDetailModal = (runId: number) => {
    setSelectedDumpRun(runId);
    setIsDetailModalOpen(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-primary overflow-hidden rounded-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-white">
            <h1 className="text-4xl font-bold">Community-Powered Junk Removal</h1>
            <p className="mt-4 text-lg">
              Connect with neighbors, share dump fees, and keep your space clutter-free. Join dump runs or request pickups on demand.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {!user ? (
                <Button 
                  className="bg-white text-primary hover:bg-neutral-100"
                  onClick={() => window.location.href = "/auth"}
                >
                  Login or Register to Get Started
                </Button>
              ) : (
                <>
                  <Button 
                    className="bg-white text-primary hover:bg-neutral-100"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create a Dump Run
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent text-white border-white hover:bg-white/20"
                    onClick={() => setIsPickupModalOpen(true)}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Request a Pickup
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-64 flex items-center justify-center">
              <Recycle className="w-full h-full text-white" />
            </div>
          </div>
        </div>
      </div>

      {!user ? (
        <Card className="mb-6">
          <CardContent className="pt-6 p-12 text-center">
            <h3 className="text-lg font-medium mb-2">Welcome to DumpRun</h3>
            <p className="text-neutral-600 mb-4">
              Please log in or register to see active dump runs and nearby dump sites
            </p>
            <Button onClick={() => window.location.href = "/auth"}>
              Log In or Register
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-neutral-800">Active Dump Runs</h2>
                <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Run
                </Button>
              </div>
              
              {isLoadingRuns ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : runsError ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-red-500">Error loading dump runs</p>
                  </CardContent>
                </Card>
              ) : dumpRuns.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 p-12 text-center">
                    <h3 className="text-lg font-medium mb-2">No active dump runs</h3>
                    <p className="text-neutral-600 mb-4">
                      Be the first to create a dump run in your area
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Dump Run
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dumpRuns.map((run) => (
                    <DumpRunCard
                      key={run.id}
                      dumpRun={run}
                      isOrganizer={run.organizerId === user?.id}
                      onClickJoin={() => handleOpenDetailModal(run.id)}
                      onClickManage={() => handleOpenDetailModal(run.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Nearby Dump Sites</h2>
              
              {isLoadingSites ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sitesError ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-red-500">Error loading dump sites</p>
                  </CardContent>
                </Card>
              ) : dumpSites.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 p-6 text-center">
                    <p className="text-neutral-600">No dump sites found in your area</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {dumpSites.map((site) => (
                    <DumpSiteCard key={site.id} dumpSite={site} />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* On-Demand Pickup Section */}
          <Card className="bg-orange-50 border-orange-100 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 mb-2">Need On-Demand Pickup?</h2>
                  <p className="text-neutral-700">
                    Don't want to wait for a dump run? Request a pickup from someone with a truck in your area
                  </p>
                </div>
                <Button 
                  className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600"
                  onClick={() => setIsPickupModalOpen(true)}
                >
                  Request Pickup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* How It Works Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Schedule or Join a Run</h3>
              <p className="text-neutral-600">
                Create a dump run or join an existing one in your neighborhood to split dump fees
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Coordinate Details</h3>
              <p className="text-neutral-600">
                Chat with other participants to coordinate pick-up locations and logistics
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Dump Your Items</h3>
              <p className="text-neutral-600">
                Meet up, fill the truck, and head to the dump together to save money
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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