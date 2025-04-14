import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPickupRequestSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2, Square, Package, Sofa } from "lucide-react";

interface RequestPickupModalProps {
  onClose: () => void;
}

const requestPickupFormSchema = insertPickupRequestSchema.omit({ userId: true, createdAt: true, estimatedPrice: true }).extend({
  date: z.string().min(1, "Date is required"),
});

type RequestPickupFormValues = z.infer<typeof requestPickupFormSchema>;

export function RequestPickupModal({ onClose }: RequestPickupModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  const form = useForm<RequestPickupFormValues>({
    resolver: zodResolver(requestPickupFormSchema),
    defaultValues: {
      address: "",
      date: format(new Date(), "yyyy-MM-dd"),
      timeSlot: "morning",
      itemSize: "small",
      itemDescription: "",
      specialInstructions: "",
      status: "pending",
    },
  });

  const requestPickupMutation = useMutation({
    mutationFn: async (values: RequestPickupFormValues) => {
      // Convert date string to Date object
      const { date, ...restValues } = values;
      const dateObj = new Date(date);
      
      const response = await apiRequest("POST", "/api/pickup-requests", {
        ...restValues,
        date: dateObj.toISOString(),
      });
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pickup-requests"] });
      
      toast({
        title: "Pickup request submitted",
        description: "Your pickup request has been submitted successfully!",
      });
      
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit pickup request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RequestPickupFormValues) => {
    requestPickupMutation.mutate(values);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  // Calculate estimated price based on item size
  const getEstimatedPrice = (size: string) => {
    switch (size) {
      case "small":
        return "$20-30";
      case "medium":
        return "$40-60";
      case "large":
        return "$70-100";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl bg-orange-500 text-white p-4 -mx-5 -mt-5 rounded-t-lg flex justify-between items-center">
            Request On-Demand Pickup
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your address" 
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
                    <FormLabel>Preferred Date</FormLabel>
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
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="itemSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Size Category</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-2"
                    >
                      <FormItem className="flex flex-col items-center justify-center border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 cursor-pointer space-y-0 space-x-0 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                        <FormControl>
                          <RadioGroupItem value="small" className="sr-only" />
                        </FormControl>
                        <div className="text-center">
                          <Square className="mx-auto h-8 w-8 text-neutral-500" />
                          <FormLabel className="text-sm font-medium block mt-1">Small</FormLabel>
                          <span className="text-xs text-neutral-500 block">($20-30)</span>
                        </div>
                      </FormItem>
                      
                      <FormItem className="flex flex-col items-center justify-center border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 cursor-pointer space-y-0 space-x-0 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                        <FormControl>
                          <RadioGroupItem value="medium" className="sr-only" />
                        </FormControl>
                        <div className="text-center">
                          <Package className="mx-auto h-8 w-8 text-neutral-500" />
                          <FormLabel className="text-sm font-medium block mt-1">Medium</FormLabel>
                          <span className="text-xs text-neutral-500 block">($40-60)</span>
                        </div>
                      </FormItem>
                      
                      <FormItem className="flex flex-col items-center justify-center border border-neutral-200 rounded-md p-3 hover:bg-neutral-50 cursor-pointer space-y-0 space-x-0 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                        <FormControl>
                          <RadioGroupItem value="large" className="sr-only" />
                        </FormControl>
                        <div className="text-center">
                          <Sofa className="mx-auto h-8 w-8 text-neutral-500" />
                          <FormLabel className="text-sm font-medium block mt-1">Large</FormLabel>
                          <span className="text-xs text-neutral-500 block">($70-100)</span>
                        </div>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Items Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the items you need picked up"
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
              name="specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any access instructions or other notes"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                className="bg-orange-500 hover:bg-orange-600"
                disabled={requestPickupMutation.isPending}
              >
                {requestPickupMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Request Pickup
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
