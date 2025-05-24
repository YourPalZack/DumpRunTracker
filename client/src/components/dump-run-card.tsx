import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DumpRun, DumpRunWithDetails } from "@shared/schema";
import { CalendarDays, MapPin, Users, CheckCircle, Clock, Info } from "lucide-react";
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from "date-fns";

interface DumpRunCardProps {
  dumpRun: DumpRun | DumpRunWithDetails;
  isOrganizer: boolean;
  isParticipant?: boolean;
  onClickJoin?: () => void;
  onClickManage?: () => void;
}

export function DumpRunCard({ 
  dumpRun, 
  isOrganizer, 
  isParticipant = false,
  onClickJoin, 
  onClickManage 
}: DumpRunCardProps) {
  const runDate = new Date(dumpRun.date);
  const isPastRun = isPast(runDate) && !isToday(runDate);
  
  // Calculate participants count if we have the detailed run data
  const participantsCount = 'participants' in dumpRun 
    ? dumpRun.participants.length 
    : 0;
  
  const statusBadge = () => {
    if (isOrganizer) {
      return (
        <span className="bg-gradient-to-r from-primary to-primary/80 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
          Your Run
        </span>
      );
    }
    
    if (isPastRun) {
      return (
        <span className="bg-muted-foreground/80 text-white text-xs px-3 py-1.5 rounded-full font-medium">
          Completed
        </span>
      );
    }
    
    if (isToday(runDate)) {
      return (
        <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm animate-pulse">
          Active
        </span>
      );
    }
    
    if (isTomorrow(runDate)) {
      return (
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-neutral-900 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
          Tomorrow
        </span>
      );
    }
    
    return (
      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
        Upcoming
      </span>
    );
  };

  return (
    <Card className={`
      card-hover overflow-hidden
      ${isOrganizer ? 'border-2 border-primary/50 shadow-primary/10' : ''}
    `}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{dumpRun.title}</h3>
            <p className="text-sm text-muted-foreground">{dumpRun.location}</p>
          </div>
          {statusBadge()}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <CalendarDays className="text-muted-foreground mr-2 h-4 w-4" />
            <span>
              {isToday(runDate) 
                ? `Today, ${format(runDate, 'h:mm a')}` 
                : format(runDate, 'EEE, MMM d, h:mm a')}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
            <span>
              {'dumpSite' in dumpRun && dumpRun.dumpSite 
                ? dumpRun.dumpSite.name 
                : 'TBD'}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Users className="text-muted-foreground mr-2 h-4 w-4" />
            <span>
              {participantsCount}/{dumpRun.maxParticipants} participants
            </span>
          </div>
        </div>
        
        {dumpRun.description && (
          <div className="mb-4 bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">{dumpRun.description}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {'participants' in dumpRun && dumpRun.participants ? (
              dumpRun.participants.slice(0, 3).map((participant, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src="" alt={participant.user?.username} />
                  <AvatarFallback className="gradient-bg-primary text-white text-xs font-semibold">
                    {participant.user?.firstName?.charAt(0)}{participant.user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : 'organizer' in dumpRun && dumpRun.organizer ? (
              <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                <AvatarImage src="" alt={dumpRun.organizer?.username} />
                <AvatarFallback className="gradient-bg-primary text-white text-xs font-semibold">
                  {dumpRun.organizer?.firstName?.charAt(0)}{dumpRun.organizer?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          
          {isOrganizer ? (
            <Button 
              size="sm"
              onClick={onClickManage}
              variant="gradient"
            >
              Manage
            </Button>
          ) : isParticipant ? (
            <Button 
              size="sm"
              variant="outline"
              onClick={onClickJoin}
              className="border-primary text-primary hover:bg-primary/10"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Joined
            </Button>
          ) : isPastRun ? (
            <Button 
              size="sm"
              variant="outline"
              disabled
            >
              <Clock className="h-4 w-4 mr-1" />
              Ended
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={onClickJoin}
              variant="secondary"
            >
              Join Run
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
