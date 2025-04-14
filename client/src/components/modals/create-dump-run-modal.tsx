import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DumpSite, insertDumpRunSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface CreateDumpRunModalProps {
  onClose: () => void;
  dumpSites: DumpSite[];
}

const createDumpRunFormSchema = insertDumpRunSchema.omit({ organizerId: true }).extend({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  hasTruck: z.boolean().default(false),
});

type CreateDumpRunFormValues = z.infer<typeof createDumpRunFormSchema>;

export function CreateDumpRunModal({ onClose, dumpSites }: CreateDumpRunModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<CreateDumpRunFormValues>({
    resolver: zodResolver(createDumpRunFormSchema),
    defaultValues: {
      title: "",
      location: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "12:00",
      dumpSiteId: undefined,
      maxParticipants: 3,
      hasTruck: user?.hasTruck || false,
    },
  });

  const createDumpRunMutation = useMutation({
    mutationFn: async (values: CreateDumpRunFormValues) => {
      // Combine date and time into a single Date object
      const { date, time, hasTruck, ...restValues } = values;
      const dateTime = new Date(`${date}T${time}`);
      
      const response = await apiRequest("POST", "/api/dump-runs", {
        ...restValues,
        date: dateTime.toISOString(),
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dump-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-dump-runs"] });
      
      toast({
        title: "Dump run created",
        description: "Your dump run has been created successfully!",
      });
      
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create dump run",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: CreateDumpRunFormValues) => {
    createDumpRunMutation.mutate(values);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl bg-primary text-white p-4 -mx-5 -mt-5 rounded-t-lg flex justify-between items-center">
            Create a Dump Run
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Garage Cleanout" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neighborhood/Area</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Downtown, Westside" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="dumpSiteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dump Site</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dump site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dumpSites.map((site) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (specify in description)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select max participants" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what type of items you'll be dumping, space constraints, fee split details, etc."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasTruck"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I have a truck/vehicle to transport items</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="pt-2 flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createDumpRunMutation.isPending}
              >
                {createDumpRunMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Run
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
