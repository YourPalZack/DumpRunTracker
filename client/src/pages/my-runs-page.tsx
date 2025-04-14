import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DumpRunWithDetails } from "@shared/schema";
import { DumpRunCard } from "@/components/dump-run-card";
import { useAuth } from "@/hooks/use-auth";
import { CreateDumpRunModal } from "@/components/modals/create-dump-run-modal";
import { DumpRunDetailModal } from "@/components/modals/dump-run-detail-modal";
import { Plus, Loader2 } from "lucide-react";

export default function MyRunsPage() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDumpRun, setSelectedDumpRun] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch user's organized dump runs
  const {
    data: myOrganizedRuns = [],
    isLoading: isLoadingMyRuns,
    error: myRunsError,
  } = useQuery<DumpRunWithDetails[]>({
    queryKey: ["/api/my-dump-runs"],
  });

  // Fetch user's joined dump runs
  const {
    data: myJoinedRuns = [],
    isLoading: isLoadingJoinedRuns,
    error: joinedRunsError,
  } = useQuery<DumpRunWithDetails[]>({
    queryKey: ["/api/my-joined-runs"],
  });

  // Fetch dump sites for the create modal
  const {
    data: dumpSites = [],
  } = useQuery({
    queryKey: ["/api/dump-sites"],
  });

  const handleOpenDetailModal = (runId: number) => {
    setSelectedDumpRun(runId);
    setIsDetailModalOpen(true);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">My Runs</h1>
          <p className="text-neutral-600">Manage your organized and joined dump runs</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Dump Run
        </Button>
      </div>

      <Tabs defaultValue="organized" className="mb-6">
        <TabsList>
          <TabsTrigger value="organized">Organized by Me</TabsTrigger>
          <TabsTrigger value="joined">Joined Runs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organized">
          {isLoadingMyRuns ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : myRunsError ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-500">Error loading your organized runs</p>
              </CardContent>
            </Card>
          ) : myOrganizedRuns.length === 0 ? (
            <Card>
              <CardContent className="pt-6 p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No organized runs yet</h3>
                <p className="text-neutral-600 mb-4">
                  Create a dump run and invite others to join you
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dump Run
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myOrganizedRuns.map((run) => (
                <DumpRunCard
                  key={run.id}
                  dumpRun={run}
                  isOrganizer={true}
                  onClickManage={() => handleOpenDetailModal(run.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="joined">
          {isLoadingJoinedRuns ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : joinedRunsError ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-500">Error loading your joined runs</p>
              </CardContent>
            </Card>
          ) : myJoinedRuns.length === 0 ? (
            <Card>
              <CardContent className="pt-6 p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No joined runs yet</h3>
                <p className="text-neutral-600 mb-4">
                  You haven't joined any dump runs yet
                </p>
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Browse Available Runs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myJoinedRuns.map((run) => (
                <DumpRunCard
                  key={run.id}
                  dumpRun={run}
                  isOrganizer={false}
                  isParticipant={true}
                  onClickJoin={() => handleOpenDetailModal(run.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Past Runs Section */}
      <div>
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Past Runs</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Dump Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-neutral-600 py-4">
              Your completed dump runs will appear here
            </p>
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
