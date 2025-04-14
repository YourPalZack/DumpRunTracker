import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { DumpRunWithDetails, InsertDumpRunParticipant, InsertChatMessage, ChatMessage } from "@shared/schema";
import { CalendarDays, MapPin, Users, DollarSign, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

interface DumpRunDetailModalProps {
  dumpRunId: number;
  onClose: () => void;
}

const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type ChatFormValues = z.infer<typeof chatFormSchema>;

export function DumpRunDetailModal({ dumpRunId, onClose }: DumpRunDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch dump run details
  const { data: dumpRun, isLoading } = useQuery<DumpRunWithDetails>({
    queryKey: [`/api/dump-runs/${dumpRunId}`],
  });

  const form = useForm<ChatFormValues>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  });

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setIsWebSocketConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message' && data.dumpRunId === dumpRunId) {
          setChatMessages((prevMessages) => [...prevMessages, data]);
          
          // Scroll to bottom of chat container
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsWebSocketConnected(false);
    };

    socket.onclose = () => {
      setIsWebSocketConnected(false);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [dumpRunId, user]);

  // Fetch chat messages
  useEffect(() => {
    if (dumpRun?.messages) {
      setChatMessages(dumpRun.messages);
      
      // Scroll to bottom of chat container
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [dumpRun?.messages]);

  // Join dump run mutation
  const joinDumpRunMutation = useMutation({
    mutationFn: async (data: InsertDumpRunParticipant) => {
      const response = await apiRequest("POST", `/api/dump-runs/${dumpRunId}/join`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dump-runs/${dumpRunId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/dump-runs"] });
      
      toast({
        title: "Request submitted",
        description: "Your request to join this dump run has been sent to the organizer",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join dump run",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send chat message mutation
  const sendChatMessageMutation = useMutation({
    mutationFn: async (data: InsertChatMessage) => {
      const response = await apiRequest("POST", `/api/dump-runs/${dumpRunId}/messages`, data);
      return response.json();
    },
    onSuccess: (newMessage) => {
      // Send message over WebSocket to notify other participants
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          ...newMessage
        }));
      }
      
      // Reset form
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinDumpRun = () => {
    if (!user) return;
    
    joinDumpRunMutation.mutate({
      dumpRunId,
      userId: user.id,
      status: "pending",
      itemSize: "medium",
      itemDescription: "",
    });
  };

  const onSubmitChat = (values: ChatFormValues) => {
    if (!user) return;
    
    sendChatMessageMutation.mutate({
      dumpRunId,
      userId: user.id,
      message: values.message,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  // Check if user is already a participant
  const isParticipant = () => {
    if (!user || !dumpRun?.participants) return false;
    return dumpRun.participants.some(p => p.userId === user.id);
  };

  // Check if user is the organizer
  const isOrganizer = () => {
    if (!user || !dumpRun) return false;
    return dumpRun.organizerId === user.id;
  };

  // Get participant status
  const getParticipantStatus = () => {
    if (!user || !dumpRun?.participants) return null;
    const participant = dumpRun.participants.find(p => p.userId === user.id);
    return participant?.status;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!dumpRun) {
    return (
      <Dialog open={isOpen} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center items-center h-48">
            <p>Dump run not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const runStatus = () => {
    if (isOrganizer()) {
      return (
        <Badge className="bg-primary text-white">Your Run</Badge>
      );
    }
    
    const status = getParticipantStatus();
    if (status === "approved") {
      return (
        <Badge className="bg-green-500 text-white">Joined</Badge>
      );
    } else if (status === "pending") {
      return (
        <Badge className="bg-yellow-500 text-white">Pending Approval</Badge>
      );
    } else if (status === "rejected") {
      return (
        <Badge className="bg-red-500 text-white">Request Declined</Badge>
      );
    }
    
    const runDate = new Date(dumpRun.date);
    const now = new Date();
    
    if (now > runDate) {
      return (
        <Badge className="bg-neutral-500">Completed</Badge>
      );
    }
    
    if (now.toDateString() === runDate.toDateString()) {
      return (
        <Badge className="bg-green-500 text-white">Active</Badge>
      );
    }
    
    return (
      <Badge className="bg-blue-500 text-white">Upcoming</Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl bg-primary text-white p-4 -mx-5 -mt-5 rounded-t-lg flex justify-between items-center">
            {dumpRun.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-1">
          <div className="mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{dumpRun.title}</h2>
                <p className="text-neutral-600">{dumpRun.location}</p>
              </div>
              {runStatus()}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-2">Details</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <div className="flex items-center text-sm mb-2">
                    <CalendarDays className="text-neutral-500 mr-2 h-4 w-4" />
                    <span>{format(new Date(dumpRun.date), 'EEEE, MMMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex items-center text-sm mb-2">
                    <MapPin className="text-neutral-500 mr-2 h-4 w-4" />
                    <span>
                      {dumpRun.dumpSite ? dumpRun.dumpSite.name : 'Location not specified'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm mb-2">
                    <Users className="text-neutral-500 mr-2 h-4 w-4" />
                    <span>
                      {dumpRun.participants ? dumpRun.participants.length : 0}/
                      {dumpRun.maxParticipants} participants
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="text-neutral-500 mr-2 h-4 w-4" />
                    <span>
                      {dumpRun.dumpSite ? 
                        `Estimated cost: $${dumpRun.dumpSite.minFee || 0}-${dumpRun.dumpSite.minFee ? dumpRun.dumpSite.minFee + 10 : 0} per person` 
                        : 'Estimated cost: Not available'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-neutral-900 mb-2">Description</h4>
                <div className="bg-neutral-50 p-3 rounded-md">
                  <p className="text-sm">
                    {dumpRun.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Participants</h4>
              <div className="bg-neutral-50 p-3 rounded-md">
                <ul className="divide-y divide-neutral-200">
                  {/* Organizer */}
                  <li className="flex items-center py-2">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src="" alt={dumpRun.organizer?.username} />
                      <AvatarFallback className="bg-primary text-white">
                        {dumpRun.organizer?.firstName?.charAt(0)}
                        {dumpRun.organizer?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {dumpRun.organizer?.firstName} {dumpRun.organizer?.lastName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Organizer {dumpRun.organizer?.hasTruck ? '• Has truck' : ''}
                      </p>
                    </div>
                  </li>
                  
                  {/* Approved Participants */}
                  {dumpRun.participants
                    .filter(p => p.status === 'approved')
                    .map((participant) => (
                      <li key={participant.id} className="flex items-center py-2">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src="" alt={participant.user?.username} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {participant.user?.firstName?.charAt(0)}
                            {participant.user?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {participant.user?.firstName} {participant.user?.lastName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {participant.itemSize ? `${participant.itemSize} items` : ''} 
                            {participant.user?.hasTruck ? '• Has truck' : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                    
                  {/* No participants message */}
                  {dumpRun.participants.filter(p => p.status === 'approved').length === 0 && (
                    <li className="py-2 text-sm text-neutral-500 text-center">
                      No other participants have joined yet
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {!isOrganizer() && !isParticipant() && (
              <Button
                onClick={handleJoinDumpRun}
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={joinDumpRunMutation.isPending}
              >
                {joinDumpRunMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Request to Join
              </Button>
            )}
          </div>
          
          {/* Chat Section */}
          <div className="border-t border-neutral-200 pt-4">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Chat</h4>
            
            <div 
              ref={chatContainerRef}
              className="bg-neutral-50 rounded-md h-64 p-3 mb-3 overflow-y-auto"
            >
              <div className="flex flex-col space-y-3">
                {chatMessages.length > 0 ? (
                  chatMessages.map((message) => {
                    const sender = message.userId === dumpRun.organizer?.id
                      ? dumpRun.organizer
                      : dumpRun.participants.find(p => p.userId === message.userId)?.user;
                    
                    return (
                      <div key={message.id} className="flex items-start">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="" alt={sender?.username} />
                          <AvatarFallback className="bg-blue-500 text-white text-xs">
                            {sender?.firstName?.charAt(0)}{sender?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm max-w-xs">
                          <p className="text-xs font-medium text-neutral-900">
                            {sender?.firstName} {sender?.lastName}
                          </p>
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-neutral-500">No messages yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {(isOrganizer() || getParticipantStatus() === 'approved') && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitChat)} className="flex">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Type a message..."
                            {...field}
                            className="rounded-r-none"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="rounded-l-none bg-primary"
                    disabled={!isWebSocketConnected || sendChatMessageMutation.isPending}
                  >
                    {sendChatMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
