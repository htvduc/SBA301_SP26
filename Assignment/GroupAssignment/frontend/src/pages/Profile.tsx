import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { restaurantApi } from "@/api/restaurantApi";
import { userApi } from "@/api/userApi";
import { subscriptionApi } from "@/api/subscriptionApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { Store, User, Mail, Save, Loader2, Camera, Upload, Trash2, X, Settings, Eye, EyeOff, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RestaurantDTO, UserInfoUpdateRequest, UserInfoResponse, RestaurantSubscriptionOverviewDTO } from "@/types/dto";
import Navbar from "@/components/Navbar";
import { RestaurantSubscriptionCard } from "@/components/subscription/RestaurantSubscriptionCard";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantDTO[]>([]);
  const [subscriptionsOverview, setSubscriptionsOverview] = useState<RestaurantSubscriptionOverviewDTO[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  // General Settings - Change Password only (removed email change)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    if (user?.userId) {
      loadUserInfo();
      loadRestaurants();
      loadAvatar();
      loadSubscriptionsOverview();
    }
  }, [user?.userId]);

  const loadUserInfo = async () => {
    if (!user?.userId) return;
    
    try {
      const info = await userApi.getUserInfo(user.userId);
      setUserInfo(info);
      setFormData({
        username: info.username,
        email: info.email,
      });
    } catch (error) {
    }
  };

  const loadAvatar = async () => {
    if (!user?.userId) return;
    
    try {
      const url = await userApi.getAvatar(user.userId);
      setAvatarUrl(url);
    } catch (error) {
    }
  };

  const loadRestaurants = async () => {
    if (!user?.userId) return;
    
    try {
      setIsLoadingRestaurants(true);
      const data = await restaurantApi.getByOwner(user.userId);
      setRestaurants(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load restaurants",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const loadSubscriptionsOverview = async () => {
    try {
      setIsLoadingSubscriptions(true);
      const data = await subscriptionApi.getSubscriptionsOverviewForOwner();
      setSubscriptionsOverview(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleSave = async () => {
    if (!user?.userId) return;
    
    try {
      setIsSaving(true);
      
      const request: UserInfoUpdateRequest = {
        username: formData.username,
      };
      
      const result = await userApi.updateUserInfo(user.userId, request);
      
      // Update local state with returned data
      setFormData({
        username: result.username,
        email: result.email,
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userInfo) {
      setFormData({
        username: userInfo.username,
        email: userInfo.email,
      });
    }
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !user?.userId) return;

    try {
      setIsUploadingAvatar(true);
      const url = await userApi.uploadAvatar(user.userId, selectedFile);
      setAvatarUrl(url);
      setPreviewImage(null);
      setSelectedFile(null);
      setIsAvatarModalOpen(false);
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.userId) return;

    try {
      await userApi.uploadAvatar(user.userId, null);
      setAvatarUrl(null);
      setPreviewImage(null);
      setSelectedFile(null);
      setIsAvatarModalOpen(false);
      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove avatar",
        variant: "destructive",
      });
    }
  };

  const handleCancelPreview = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setIsAvatarModalOpen(false);
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword || !user?.userId) return;
    
    if (newPassword !== confirmPassword) {
      toast({ 
        title: "Error", 
        description: "New passwords do not match", 
        variant: "destructive" 
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({ 
        title: "Error", 
        description: "Password must be at least 8 characters", 
        variant: "destructive" 
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await userApi.changePassword({
        userId: user.userId,
        password: currentPassword,
        newPassword: newPassword
      });
      
      toast({ 
        title: "Success", 
        description: "Your password has been changed successfully" 
      });
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to change password";
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleRenewSubscription = async (restaurantId: string) => {
    try {
      const payment = await subscriptionApi.renewSubscription(restaurantId);
      
      if (payment.qrCodeUrl) {
        // Redirect to payment checkout page with orderCode
        navigate(`/payment/checkout?orderCode=${payment.payOsOrderCode}`);
      } else {
        toast({
          title: "Success",
          description: "Subscription renewed successfully",
        });
        loadSubscriptionsOverview();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to renew subscription",
        variant: "destructive",
      });
    }
  };

  const handleUpgradeSubscription = async (restaurantId: string) => {
    // Navigate to package selection page with restaurantId and upgrade action
    navigate(`/payment/select?restaurantId=${restaurantId}&action=upgrade`);
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await subscriptionApi.cancelSubscription(subscriptionId);
      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      loadSubscriptionsOverview();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and restaurants</p>
          </div>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="personal">
                <User className="w-4 h-4 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="restaurants">
                <CreditCard className="w-4 h-4 mr-2" />
                My Subscriptions
              </TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="mt-6 space-y-6">
              {/* Theme Toggle */}
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize the look and feel of your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Dark Theme</p>
                      <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={handleThemeToggle}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Change Password - Only for non-Google accounts */}
              {userInfo && !userInfo.googleAccount && (
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPw ? "text" : "password"}
                          placeholder="Enter current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                        >
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPw ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPw(!showNewPw)}
                        >
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPw ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirmPw(!showConfirmPw)}
                        >
                          {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={!currentPassword || !newPassword || !confirmPassword || isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Info for Google accounts */}
              {userInfo && userInfo.googleAccount && (
                <Card>
                  <CardHeader>
                    <CardTitle>Google Account</CardTitle>
                    <CardDescription>
                      This account is managed by Google
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your account is linked to Google. Password changes should be made through your Google account settings.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    View and edit your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                      <Avatar className="w-32 h-32">
                        <AvatarImage 
                          src={avatarUrl || undefined} 
                          alt={user?.username || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Click avatar to manage
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="restaurants" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Restaurant Subscriptions</CardTitle>
                  <CardDescription>
                    Manage subscriptions and view payment history for your restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSubscriptions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : subscriptionsOverview.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        You don't have any restaurants yet
                      </p>
                      <Button onClick={() => navigate("/payment/select")}>
                        Create New Restaurant
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {subscriptionsOverview.map((overview) => (
                        <RestaurantSubscriptionCard
                          key={overview.restaurantId}
                          data={overview}
                          onRenew={handleRenewSubscription}
                          onUpgrade={handleUpgradeSubscription}
                          onCancel={handleCancelSubscription}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Avatar Management Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Avatar</DialogTitle>
            <DialogDescription>
              Upload a new avatar or remove the current one
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            {/* Current or Preview Avatar */}
            <div className="relative">
              <Avatar className="w-48 h-48 border-4 border-border">
                <AvatarImage 
                  src={previewImage || avatarUrl || undefined} 
                  alt={user?.username || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl">{getUserInitials()}</AvatarFallback>
              </Avatar>
              {previewImage && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 rounded-full shadow-lg"
                  onClick={handleCancelPreview}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Preview Info */}
            {previewImage && (
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Upload" to save this avatar
                </p>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {previewImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelPreview}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadAvatar}
                  disabled={isUploadingAvatar}
                  className="w-full sm:w-auto"
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleFileSelect}
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
                {avatarUrl && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveAvatar}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Profile;
