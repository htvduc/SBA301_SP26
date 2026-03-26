import { useState, useMemo } from "react";
import React from "react";
import { 
  Plus, Eye, Pencil, ToggleLeft, ToggleRight, X, ChevronDown, ChevronUp, 
  Loader2, Package, Trash2, Settings2, Info, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { usePackages, useFeatures, useCreatePackage, useUpdatePackage, useActivatePackage, useDeactivatePackage } from "@/hooks/queries/usePackageQueries";
import type { PackageFeatureDTO, FeatureValueDTO, FeatureCode } from "@/types/dto/package.dto";

const featureCodeOptions: { value: FeatureCode; label: string }[] =[
  { value: "LIMIT_MENU_ITEMS", label: "Menu Items Limit" },
  { value: "LIMIT_BRANCH_CREATION", label: "Branch Creation Limit" },
  { value: "LIMIT_CUSTOMIZATION_PER_CATEGORY", label: "Customization Per Category Limit" },
  { value: "UNLIMITED_BRANCH_CREATION", label: "Unlimited Branch Creation" },
];

interface FormData {
  name: string;
  description: string;
  price: number;
  billingPeriod: number;
  available: boolean;
  features: FeatureValueDTO[];
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: 0,
  billingPeriod: 1,
  available: true,
  features:[],
};

// Helper format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PackageManagement = () => {
  const { data: packages =[], isLoading } = usePackages();
  const { data: allFeatures =[] } = useFeatures();
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage();
  const activateMutation = useActivatePackage();
  const deactivateMutation = useDeactivatePackage();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const[editPkg, setEditPkg] = useState<PackageFeatureDTO | null>(null);
  const[form, setForm] = useState<FormData>(emptyForm);
  const [activeTab, setActiveTab] = useState("general");

  // Feature add state
  const [limitCode, setLimitCode] = useState<FeatureCode>("LIMIT_MENU_ITEMS");
  const [limitValue, setLimitValue] = useState<number>(10);
  const [descName, setDescName] = useState("");
  const[descDesc, setDescDesc] = useState("");

  const limitFeatures = useMemo(() => allFeatures.filter(f => f.code != null), [allFeatures]);

  const openCreate = () => {
    setEditPkg(null);
    setForm({ ...emptyForm, features:[] });
    setActiveTab("general");
    setFormOpen(true);
  };

  const openEdit = (pkg: PackageFeatureDTO) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      billingPeriod: pkg.billingPeriod,
      available: pkg.available,
      features: [...pkg.features],
    });
    setActiveTab("general");
    setFormOpen(true);
  };

  const addLimitFeature = () => {
    const selectedFeature = limitFeatures.find(f => f.code === limitCode);
    if (!selectedFeature) return;

    const newFeature: FeatureValueDTO = {
      featureId: selectedFeature.id,
      featureName: selectedFeature.name,
      description: selectedFeature.description,
      featureCode: limitCode,
      value: limitValue,
    };

    setForm(prev => ({ ...prev, features: [...prev.features, newFeature] }));
  };

  const addDescFeature = () => {
    if (!descName.trim()) return;
    const newFeature: FeatureValueDTO = {
      featureName: descName.trim(),
      description: descDesc.trim(),
      value: null,
    };

    setForm(prev => ({ ...prev, features: [...prev.features, newFeature] }));
    setDescName("");
    setDescDesc("");
  };

  const removeFeature = (index: number) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setActiveTab("general");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      billingPeriod: form.billingPeriod,
      available: form.available,
      features: form.features,
    };

    try {
      if (editPkg) {
        await updatePackageMutation.mutateAsync({ packageId: editPkg.packageId!, data: payload });
      } else {
        await createPackageMutation.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (error) {}
  };

  const toggleStatus = async (pkg: PackageFeatureDTO) => {
    if (!pkg.packageId) return;
    try {
      if (pkg.available) await deactivateMutation.mutateAsync(pkg.packageId);
      else await activateMutation.mutateAsync(pkg.packageId);
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Package Management</h1>
            <p className="text-muted-foreground text-sm">Design and configure subscription tiers for your platform</p>
          </div>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Create Package
        </Button>
      </div>

      {/* Table Section */}
      <Card className="border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Package Name</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Features</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  No packages found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => (
                <React.Fragment key={pkg.packageId}>
                  <TableRow className={`transition-colors hover:bg-muted/30 ${expandedId === pkg.packageId ? 'bg-muted/30' : ''}`}>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setExpandedId(expandedId === pkg.packageId ? null : pkg.packageId)}
                      >
                        {expandedId === pkg.packageId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{pkg.name}</TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{formatCurrency(pkg.price)}</span>
                      <span className="text-muted-foreground text-xs"> / period</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{pkg.billingPeriod} {pkg.billingPeriod > 1 ? 'months' : 'month'}</TableCell>
                    <TableCell>
                      <Badge variant={pkg.available ? "default" : "secondary"} className={pkg.available ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                        {pkg.available ? "Available" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-normal">
                        {pkg.features.length} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-4 space-x-1">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)} className="h-8 w-8">
                              <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Package</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => toggleStatus(pkg)}
                                disabled={
                                  activateMutation.isPending || 
                                  deactivateMutation.isPending || 
                                  (pkg.available && (pkg.activeSubscriptionCount ?? 0) > 0)
                                }
                              >
                                {pkg.available ? 
                                  <ToggleRight className="w-5 h-5 text-emerald-500" /> : 
                                  <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                }
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {pkg.available && (pkg.activeSubscriptionCount ?? 0) > 0 
                              ? `Cannot deactivate: ${pkg.activeSubscriptionCount} active subs` 
                              : `Toggle Status`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row Detail */}
                  {expandedId === pkg.packageId && (
                    <TableRow key={`${pkg.packageId}-detail`}>
                      <TableCell colSpan={7} className="p-0 border-b-0">
                        <div className="bg-muted/10 border-l-4 border-primary/60 p-6 shadow-inner">
                          <div className="flex flex-col md:flex-row gap-8">
                            {/* Left Column: Description & Metadata */}
                            <div className="flex-1 space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold flex items-center gap-2 mb-1">
                                  <Info className="w-4 h-4 text-primary" /> Description
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {pkg.description || "No description provided."}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {(pkg.activeSubscriptionCount ?? 0) > 0 && (
                                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                                    {pkg.activeSubscriptionCount} Active Subscription{pkg.activeSubscriptionCount !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <Separator orientation="vertical" className="hidden md:block h-auto" />

                            {/* Right Column: Features Grid */}
                            <div className="flex-[2] space-y-3">
                              <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-primary" /> Included Features
                              </h4>
                              {pkg.features.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No features configured.</p>
                              ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                  {pkg.features.map((f, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border shadow-sm">
                                      <div className="mt-0.5">
                                        {f.featureCode ? 
                                          <Settings2 className="w-4 h-4 text-blue-500" /> : 
                                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        }
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{f.featureName}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{f.description}</p>
                                      </div>
                                      {f.value != null && (
                                        <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                                          {f.value}
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {editPkg ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              Configure package details, pricing, and define the features included.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-[65vh]">
            <div className="px-6 border-b border-border">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0">
                <TabsTrigger 
                  value="general" 
                  className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 py-3"
                >
                  General Details
                </TabsTrigger>
                <TabsTrigger 
                  value="features" 
                  className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 py-3 flex gap-2"
                >
                  Features & Limits
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] bg-muted">
                    {form.features.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {/* TAB 1: GENERAL INFO */}
              <TabsContent value="general" className="space-y-5 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Package Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. Pro Plan" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Price (VND) <span className="text-destructive">*</span></Label>
                    <Input type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Billing Period (Months)</Label>
                  <Input type="number" value={form.billingPeriod} onChange={e => setForm(p => ({ ...p, billingPeriod: +e.target.value }))} min={1} className="w-full md:w-1/2" />
                  <p className="text-xs text-muted-foreground">How often the customer is billed for this package.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Description</Label>
                  <Textarea 
                    placeholder="Describe what this package offers..." 
                    value={form.description} 
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} 
                    rows={4} 
                    className="resize-none"
                  />
                </div>
              </TabsContent>

              {/* TAB 2: FEATURES */}
              <TabsContent value="features" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Add Forms */}
                  <div className="space-y-6">
                    <Card className="border-border shadow-none bg-muted/20">
                      <CardHeader className="py-3 px-4 border-b border-border/50">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-blue-500" /> Add System Limit
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Feature Code</Label>
                          <Select value={limitCode} onValueChange={(v) => setLimitCode(v as FeatureCode)}>
                            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {featureCodeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-3">
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-xs">Value / Quota</Label>
                            <Input type="number" value={limitValue} onChange={e => setLimitValue(+e.target.value)} className="bg-background" />
                          </div>
                          <Button variant="secondary" onClick={addLimitFeature}>Add</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border shadow-none bg-muted/20">
                      <CardHeader className="py-3 px-4 border-b border-border/50">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Add Descriptive Feature
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Feature Name</Label>
                          <Input placeholder="e.g. 24/7 Support" value={descName} onChange={e => setDescName(e.target.value)} className="bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Description (Optional)</Label>
                          <Input placeholder="Brief details..." value={descDesc} onChange={e => setDescDesc(e.target.value)} className="bg-background" />
                        </div>
                        <Button variant="secondary" className="w-full" onClick={addDescFeature} disabled={!descName.trim()}>
                          Add Feature
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Added Features List */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                      Configured Features
                      <Badge variant="outline" className="bg-background">{form.features.length}</Badge>
                    </h3>
                    
                    {form.features.length === 0 ? (
                      <div className="h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground text-sm p-6 text-center">
                        <Package className="w-8 h-8 mb-2 opacity-50" />
                        <p>No features added yet.</p>
                        <p className="text-xs opacity-70">Use the panels on the left to add features.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pr-1 max-h-[500px] overflow-y-auto">
                        {form.features.map((f, idx) => (
                          <div key={idx} className="group flex items-start justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/40 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {f.featureCode ? 
                                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-[10px] uppercase">Limit</Badge> : 
                                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] uppercase">Text</Badge>
                                }
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{f.featureName}</p>
                                {f.description && <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>}
                                {f.value != null && (
                                  <p className="text-xs font-mono text-primary mt-1 bg-primary/5 inline-block px-1.5 py-0.5 rounded">
                                    Limit Value: {f.value}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all" 
                              onClick={() => removeFeature(idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="p-4 border-t border-border bg-muted/10">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={createPackageMutation.isPending || updatePackageMutation.isPending || !form.name.trim()}
              className="min-w-[120px]"
            >
              {(createPackageMutation.isPending || updatePackageMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                editPkg ? "Save Changes" : "Create Package"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;