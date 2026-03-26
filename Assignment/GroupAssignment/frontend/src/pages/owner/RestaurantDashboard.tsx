import { useParams, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Store, Loader2, GitBranch, Trash2, CheckCircle, XCircle, AlertCircle, Info, TrendingUp, TrendingDown, DollarSign, ExternalLink, Copy,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ComingSoon from "@/components/ComingSoon";
import StaffManagement from "@/pages/owner/StaffManagement";
import CategoryManagement from "@/pages/owner/CategoryManagement";
import CustomizationManagement from "@/pages/owner/CustomizationManagement";
import MenuItemManagement from "@/pages/owner/MenuItemManagement";
import PromotionManagement from "@/pages/owner/PromotionManagement";
import { RestaurantAnalytics } from "@/pages/owner/RestaurantAnalytics";
import BranchAreaSelection from "@/pages/owner/BranchAreaSelection";
import { useRestaurant, useUpdateRestaurant, useDeleteRestaurant } from "@/hooks/queries/useRestaurantQueries";
import { useBranchesByRestaurant, useCreateBranch, useUpdateBranch } from "@/hooks/queries/useBranchQueries";
import { useBranchLimit, useCanCreateBranch } from "@/hooks/useFeatureLimits";
import { useTodayRevenue } from "@/hooks/queries/useAnalyticsQueries";
import type { BranchDTO, RestaurantDTO } from "@/types/dto";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";

const RestaurantDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const { data: restaurant, isLoading } = useRestaurant(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // if (!restaurant) return <Navigate to="/restaurants" replace />;

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<OverviewPage restaurant={restaurant} />} />
        <Route path="menu" element={<MenuItemManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="customizations" element={<CustomizationManagement />} />
        <Route path="areas" element={<BranchAreaSelection />} />
        <Route path="promotions" element={<PromotionManagement />} />
        <Route path="analytics" element={<RestaurantAnalytics />} />
        <Route path="orders" element={<ComingSoon title="Orders" />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="settings" element={<ComingSoon title="Settings" />} />
      </Routes>
    </DashboardLayout>
  );
};

const OverviewPage = ({ restaurant }: { restaurant: RestaurantDTO }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: branches = [], isLoading: isLoadingBranches } = useBranchesByRestaurant(restaurant.restaurantId);
  const { data: branchLimit } = useBranchLimit(restaurant.restaurantId);
  const { data: canCreateBranch } = useCanCreateBranch(restaurant.restaurantId);
  const { data: todayRevenue, isLoading: isTodayRevenueLoading } = useTodayRevenue(restaurant.restaurantId);
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const updateRestaurant = useUpdateRestaurant();
  const deleteRestaurant = useDeleteRestaurant();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDTO | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    branchPhone: '',
    mail: '',
    openingTime: '08:00',
    closingTime: '22:00',
  });

  // Restaurant info state
  const [restaurantInfoDialogOpen, setRestaurantInfoDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantFormData, setRestaurantFormData] = useState({
    name: restaurant?.name,
    email: restaurant?.email,
    restaurantPhone: restaurant?.restaurantPhone,
    publicUrl: restaurant?.publicUrl || '',
    description: restaurant?.description || '',
  });

  // Copy URL to clipboard
  const copyPublicUrl = () => {
    const fullUrl = `${window.location.origin}/${restaurant?.publicUrl}/home`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Copied!",
      description: "Public URL copied to clipboard",
    });
  };

  const openCreate = () => {
    setEditingBranch(null);
    setFormData({
      address: '',
      branchPhone: '',
      mail: '',
      openingTime: '08:00',
      closingTime: '22:00',
    });
    setDialogOpen(true);
  };

  const openEdit = (b: BranchDTO) => {
    setEditingBranch(b);
    setFormData({
      address: b.address,
      branchPhone: b.branchPhone,
      mail: b.mail,
      openingTime: b.openingTime.substring(0, 5), // HH:mm
      closingTime: b.closingTime.substring(0, 5), // HH:mm
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.address.trim() || !formData.branchPhone.trim() || !formData.mail.trim()) return;

    if (editingBranch) {
      await updateBranch.mutateAsync({
        id: editingBranch.branchId!,
        data: {
          address: formData.address,
          branchPhone: formData.branchPhone,
          mail: formData.mail,
          openingTime: formData.openingTime + ':00',
          closingTime: formData.closingTime + ':00',
        },
      });
    } else {
      await createBranch.mutateAsync({
        restaurantId: restaurant?.restaurantId,
        address: formData.address,
        branchPhone: formData.branchPhone,
        mail: formData.mail,
        openingTime: formData.openingTime + ':00',
        closingTime: formData.closingTime + ':00',
      });
    }
    setDialogOpen(false);
  };

  const toggleActive = async (branch: BranchDTO) => {
    await updateBranch.mutateAsync({
      id: branch.branchId!,
      data: {
        isActive: !branch.isActive,
      },
    });
  };

  const handleRestaurantInfoSave = async () => {
    if (!restaurantFormData.name.trim() || !restaurantFormData.email.trim()) return;

    await updateRestaurant.mutateAsync({
      id: restaurant?.restaurantId,
      data: {
        name: restaurantFormData.name,
        email: restaurantFormData.email,
        restaurantPhone: restaurantFormData.restaurantPhone,
        publicUrl: restaurantFormData.publicUrl || undefined,
        description: restaurantFormData.description || undefined,
      },
    });
    setRestaurantInfoDialogOpen(false);
  };

  const handleDeleteRestaurant = async () => {
    await deleteRestaurant.mutateAsync(restaurant?.restaurantId);
    setDeleteDialogOpen(false);
    navigate('/restaurants');
  };

  const handleActivateAll = async () => {
    const inactiveBranches = branches.filter(b => !b.isActive);
    for (const branch of inactiveBranches) {
      await updateBranch.mutateAsync({
        id: branch.branchId!,
        data: { isActive: true },
      });
    }
  };

  const handleDeactivateAll = async () => {
    const activeBranches = branches.filter(b => b.isActive);
    for (const branch of activeBranches) {
      await updateBranch.mutateAsync({
        id: branch.branchId!,
        data: { isActive: false },
      });
    }
  };

  const activeBranches = branches.filter(b => b.isActive);
  const inactiveBranches = branches.filter(b => !b.isActive);

  return (
    <>
      <div className="p-6 lg:p-8">
        {/* Today Revenue Card */}
        <Card className="glass-card border-border/60 mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-6">
            {isTodayRevenueLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Today's Revenue</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(todayRevenue?.todayRevenue || 0)}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        (todayRevenue?.change || 0) >= 0 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(todayRevenue?.change || 0) >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                          {Math.abs(todayRevenue?.change || 0).toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        vs yesterday ({formatCurrency(todayRevenue?.yesterdayRevenue || 0)})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Orders Today</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {todayRevenue?.todayOrders || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Yesterday: {todayRevenue?.yesterdayOrders || 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Info Section */}
        <Card className="glass-card border-border/60 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                  🍽️
                </div>
                <div>
                  <h1 className="text-2xl font-display mb-1">{restaurant?.name}</h1>
                  <p className="text-sm text-muted-foreground mb-2">{restaurant?.email}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      {activeBranches.length} Active Branches
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      {branches.length} Total Branches
                    </span>
                  </div>
                  {restaurant?.publicUrl && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">
                            🌐 Public URL (Customer Page)
                          </p>
                          <a
                            href={`${window.location.origin}/${restaurant.publicUrl}/home`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1.5 font-medium break-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            {window.location.origin}/{restaurant.publicUrl}/home
                          </a>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-2 flex-shrink-0"
                          onClick={copyPublicUrl}
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRestaurantFormData({
                      name: restaurant.name,
                      email: restaurant.email,
                      restaurantPhone: restaurant.restaurantPhone,
                      publicUrl: restaurant.publicUrl || '',
                      description: restaurant.description || '',
                    });
                    setRestaurantInfoDialogOpen(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit Info
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Management Section */}
        <Card className="glass-card border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Store className="w-4 h-4 text-primary" />
                Branch Management
              </CardTitle>
              <Button size="sm" onClick={openCreate} disabled={canCreateBranch === false}>
                <Plus className="w-4 h-4 mr-1" />
                Add Branch
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Limit Info */}
            {branchLimit !== null && branchLimit !== undefined && branchLimit !== -1 && branchLimit > 0 && (
              <div className="px-6 pt-4">
                <Alert className={`${canCreateBranch === false ? 'border-destructive/50 bg-destructive/5' : branches.length >= branchLimit * 0.8 ? 'border-amber/50 bg-amber/5' : 'border-primary/50 bg-primary/5'}`}>
                  {canCreateBranch === false ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : branches.length >= branchLimit * 0.8 ? (
                    <AlertCircle className="h-4 w-4 text-amber" />
                  ) : (
                    <Info className="h-4 w-4 text-primary" />
                  )}
                  <AlertDescription className="text-sm">
                    {branches.length} / {branchLimit} branches used
                    {canCreateBranch === false && (
                      <span className="ml-2 font-medium">
                        - You've reached your branch limit. Upgrade your plan to add more branches.
                      </span>
                    )}
                    {branches.length >= branchLimit * 0.8 && canCreateBranch !== false && (
                      <span className="ml-2">
                        - You're approaching your limit. Consider upgrading your plan.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {isLoadingBranches ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <div className="px-6 pt-2 flex items-center justify-between border-b">
                  <TabsList>
                    <TabsTrigger value="active" className="gap-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active ({activeBranches.length})
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="gap-2">
                      <XCircle className="w-3.5 h-3.5" />
                      Inactive ({inactiveBranches.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="active" className="m-0">
                  <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeactivateAll}
                      disabled={activeBranches.length === 0 || updateBranch.isPending}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Deactivate All
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Address</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBranches.map((b) => (
                        <TableRow key={b.branchId}>
                          <TableCell className="pl-6 font-medium text-sm max-w-[200px] truncate">{b.address}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{b.branchPhone}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{b.mail}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {b.openingTime.substring(0, 5)} - {b.closingTime.substring(0, 5)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch checked={b.isActive} onCheckedChange={() => toggleActive(b)} />
                              <span className="text-xs font-medium text-teal">Active</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {activeBranches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No active branches. Click "Add Branch" to create one.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="inactive" className="m-0">
                  <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleActivateAll}
                      disabled={inactiveBranches.length === 0 || updateBranch.isPending}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Activate All
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Address</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveBranches.map((b) => (
                        <TableRow key={b.branchId}>
                          <TableCell className="pl-6 font-medium text-sm max-w-[200px] truncate">{b.address}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{b.branchPhone}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{b.mail}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {b.openingTime.substring(0, 5)} - {b.closingTime.substring(0, 5)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Switch checked={b.isActive} onCheckedChange={() => toggleActive(b)} />
                              <span className="text-xs font-medium text-muted-foreground">Inactive</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {inactiveBranches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No inactive branches.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Branch Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
            <DialogDescription>
              {editingBranch ? "Update branch information" : "Enter new branch details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="branch-address">Address *</Label>
              <Input
                id="branch-address"
                placeholder="e.g. 123 Main St, District 1"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-phone">Phone *</Label>
              <Input
                id="branch-phone"
                placeholder="e.g. +84 123 456 789"
                value={formData.branchPhone}
                onChange={(e) => setFormData({ ...formData, branchPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch-email">Email *</Label>
              <Input
                id="branch-email"
                type="email"
                placeholder="e.g. branch@restaurant.com"
                value={formData.mail}
                onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening-time">Opening Time *</Label>
                <Input
                  id="opening-time"
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing-time">Closing Time *</Label>
                <Input
                  id="closing-time"
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.address.trim() ||
                !formData.branchPhone.trim() ||
                !formData.mail.trim() ||
                createBranch.isPending ||
                updateBranch.isPending
              }
            >
              {(createBranch.isPending || updateBranch.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingBranch ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingBranch ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Restaurant Info Dialog */}
      <Dialog open={restaurantInfoDialogOpen} onOpenChange={setRestaurantInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Restaurant Information</DialogTitle>
            <DialogDescription>
              Update your restaurant's basic information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Restaurant Name *</Label>
              <Input
                id="restaurant-name"
                placeholder="e.g. Pho Hanoi"
                value={restaurantFormData.name}
                onChange={(e) => setRestaurantFormData({ ...restaurantFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-email">Email *</Label>
              <Input
                id="restaurant-email"
                type="email"
                placeholder="e.g. contact@phohanoi.com"
                value={restaurantFormData.email}
                onChange={(e) => setRestaurantFormData({ ...restaurantFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-phone">Phone *</Label>
              <Input
                id="restaurant-phone"
                placeholder="e.g. +84 123 456 789"
                value={restaurantFormData.restaurantPhone}
                onChange={(e) => setRestaurantFormData({ ...restaurantFormData, restaurantPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-url" className="text-muted-foreground">Public URL (Auto-generated)</Label>
              <Input
                id="restaurant-url"
                value={restaurantFormData.publicUrl}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">This URL is automatically generated and cannot be edited</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-description">Description</Label>
              <Textarea
                id="restaurant-description"
                placeholder="Tell us about your restaurant..."
                value={restaurantFormData.description}
                onChange={(e) => setRestaurantFormData({ ...restaurantFormData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestaurantInfoDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRestaurantInfoSave}
              disabled={
                !restaurantFormData.name?.trim() ||
                !restaurantFormData.email?.trim() ||
                updateRestaurant.isPending
              }
            >
              {updateRestaurant.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Restaurant Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the restaurant "{restaurant?.name}" and all its branches.
              The restaurant will no longer be visible in your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRestaurant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRestaurant.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Restaurant'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </>
  );
};

export default RestaurantDashboard;
