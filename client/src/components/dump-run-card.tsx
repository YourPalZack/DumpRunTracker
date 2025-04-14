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
        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
          Your Run
        </span>
      );
    }
    
    if (isPastRun) {
      return (
        <span className="bg-neutral-500 text-white text-xs px-2 py-1 rounded-full">
          Completed
        </span>
      );
    }
    
    if (isToday(runDate)) {
      return (
        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Active
        </span>
      );
    }
    
    if (isTomorrow(runDate)) {
      return (
        <span className="bg-yellow-500 text-neutral-900 text-xs px-2 py-1 rounded-full">
          Tomorrow
        </span>
      );
    }
    
    return (
      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
        Upcoming
      </span>
    );
  };

  return (
    <Card className={`
      overflow-hidden border hover:shadow-md transition duration-200
      ${isOrganizer ? 'border-primary' : 'border-neutral-200'}
    `}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-neutral-900">{dumpRun.title}</h3>
            <p className="text-sm text-neutral-600">{dumpRun.location}</p>
          </div>
          {statusBadge()}
        </div>
        
        <div className="mb-3">
          <div className="flex items-center text-sm mb-1">
            <CalendarDays className="text-neutral-500 mr-2 h-4 w-4" />
            <span>
              {isToday(runDate) 
                ? `Today, ${format(runDate, 'h:mm a')}` 
                : format(runDate, 'EEE, MMM d, h:mm a')}
            </span>
          </div>
          
          <div className="flex items-center text-sm mb-1">
            <MapPin className="text-neutral-500 mr-2 h-4 w-4" />
            <span>
              {'dumpSite' in dumpRun && dumpRun.dumpSite 
                ? dumpRun.dumpSite.name 
                : 'TBD'}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Users className="text-neutral-500 mr-2 h-4 w-4" />
            <span>
              {participantsCount}/{dumpRun.maxParticipants} participants
            </span>
          </div>
        </div>
        
        {dumpRun.description && (
          <div className="mb-3 bg-neutral-50 p-2 rounded-md">
            <p className="text-sm">{dumpRun.description}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex -space-x-2">
            {'participants' in dumpRun && dumpRun.participants ? (
              dumpRun.participants.slice(0, 3).map((participant, index) => (
                <Avatar key={index} className="h-7 w-7 border-2 border-white">
                  <AvatarImage src="" alt={participant.user?.username} />
                  <AvatarFallback className="bg-primary-light text-white text-xs">
                    {participant.user?.firstName?.charAt(0)}{participant.user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : 'organizer' in dumpRun && dumpRun.organizer ? (
              <Avatar className="h-7 w-7 border-2 border-white">
                <AvatarImage src="" alt={dumpRun.organizer?.username} />
                <AvatarFallback className="bg-primary-light text-white text-xs">
                  {dumpRun.organizer?.firstName?.charAt(0)}{dumpRun.organizer?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          
          {isOrganizer ? (
            <Button 
              size="sm"
              onClick={onClickManage}
              className="bg-primary hover:bg-primary/90"
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
              className="bg-blue-500 hover:bg-blue-600"
            >
              Join Run
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
