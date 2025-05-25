import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Settings, Bell, CreditCard, LogOut, Truck, Phone, Mail, Edit, Camera,
  ShieldCheck, AlertTriangle, HelpCircle, FileText, Lock
} from "lucide-react";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const saveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">My Profile</h1>
        <p className="text-neutral-600">Manage your account and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" alt={user?.username} />
                      <AvatarFallback className="text-lg bg-primary text-white">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="mt-4 text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-sm text-neutral-600">@{user?.username}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">0</span>
                      <span className="text-xs text-neutral-600">Organized</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">0</span>
                      <span className="text-xs text-neutral-600">Joined</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Methods
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Privacy & Security
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Cancel' : <><Edit className="h-4 w-4 mr-2" /> Edit</>}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue={user?.firstName} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue={user?.lastName} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" defaultValue={user?.phone || ''} />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch id="hasTruck" defaultChecked={user?.hasTruck ?? false} />
                        <Label htmlFor="hasTruck">I have a truck/vehicle for transportation</Label>
                      </div>
                      
                      <Button onClick={saveProfile}>Save Changes</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-neutral-600">First Name</div>
                          <div>{user?.firstName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600">Last Name</div>
                          <div>{user?.lastName}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-neutral-600" />
                        <div>{user?.email}</div>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-neutral-600" />
                        <div>{user?.phone || 'Not provided'}</div>
                      </div>
                      
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-2 text-neutral-600" />
                        <div>{user?.hasTruck ? 'Has vehicle for transportation' : 'No vehicle for transportation'}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Manage your payment methods and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">No payment methods have been added yet.</p>
                  <Button variant="outline" className="mt-4">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Customize how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-neutral-600">Receive email notifications</div>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Dump Run Updates</div>
                        <div className="text-sm text-neutral-600">Get notified about changes to dump runs</div>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">New Messages</div>
                        <div className="text-sm text-neutral-600">Receive notifications for new messages</div>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Join Requests</div>
                        <div className="text-sm text-neutral-600">Notifications for join requests on your dump runs</div>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Marketing Emails</div>
                        <div className="text-sm text-neutral-600">Receive marketing and promotional emails</div>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-2">Change Password</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                        <Button>Update Password</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-600">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">
                        <Lock className="h-4 w-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-red-600">Danger Zone</h3>
                      <p className="text-sm text-neutral-600">
                        Permanently delete your account and all associated data
                      </p>
                      <Button variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Terms & Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
