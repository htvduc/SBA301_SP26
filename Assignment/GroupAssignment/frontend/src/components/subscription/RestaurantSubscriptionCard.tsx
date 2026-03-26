import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Store, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  XCircle, 
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  Eye,
  Timer
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { packageApi } from "@/api/packageApi";
import type { RestaurantSubscriptionOverviewDTO } from "@/types/dto";
import type { PackageFeatureDTO } from "@/types/dto/package.dto";

interface Props {
  data: RestaurantSubscriptionOverviewDTO;
  onRenew: (restaurantId: string) => void;
  onUpgrade: (restaurantId: string) => void;
  onCancel: (subscriptionId: string) => void;
}

export const RestaurantSubscriptionCard = ({ data, onRenew, onUpgrade, onCancel }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");

  // Fetch available packages
  const { data: packages = [], isLoading: isLoadingPackages } = useQuery({
    queryKey: ['packages', 'active'],
    queryFn: packageApi.getActivePackages,
    enabled: showUpgradeModal,
  });

  // Get current package price for comparison
  const currentPackagePrice = data.currentSubscription?.amount || 0;
  const currentPackageId = data.currentSubscription?.packageId;

  // Filter packages: only show packages with higher price (no downgrade)
  const availableUpgradePackages = packages.filter(pkg => 
    pkg.packageId !== currentPackageId && pkg.price > currentPackagePrice
  );

  // Check if already on highest package (Premium)
  const isOnHighestPackage = packages.length > 0 && 
    packages.every(pkg => pkg.packageId === currentPackageId || pkg.price <= currentPackagePrice);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Active", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      EXPIRED: { label: "Expired", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
      CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      PENDING_PAYMENT: { label: "Pending Payment", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'FAILED':
      case 'CANCELED':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPurposeLabel = (purpose: string) => {
    const labels = {
      NEW_SUBSCRIPTION: "New Subscription",
      RENEW: "Renewal",
      UPGRADE: "Upgrade"
    };
    return labels[purpose as keyof typeof labels] || purpose;
  };

  const calculateDaysLeft = () => {
    if (!data.currentSubscription || data.currentSubscription.status !== 'ACTIVE') {
      return null;
    }
    const endDate = new Date(data.currentSubscription.endDate);
    const today = new Date();
    const daysLeft = differenceInDays(endDate, today);
    return daysLeft;
  };

  const getDaysLeftBadge = () => {
    const daysLeft = calculateDaysLeft();
    if (daysLeft === null) return null;

    let badgeClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (daysLeft <= 7) {
      badgeClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    } else if (daysLeft <= 14) {
      badgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }

    return (
      <Badge className={badgeClass}>
        <Timer className="w-3 h-3 mr-1" />
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
      </Badge>
    );
  };

  const handleRenew = async () => {
    setIsProcessing(true);
    try {
      await onRenew(data.restaurantId);
      setShowRenewConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = () => {
    if (isOnHighestPackage) {
      toast({
        title: "Already on Premium",
        description: "You're already on the highest package available.",
        variant: "default",
      });
      return;
    }
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = () => {
    if (!selectedPackageId) {
      toast({
        title: "No Package Selected",
        description: "Please select a package to upgrade to.",
        variant: "destructive",
      });
      return;
    }

    const selectedPackage = packages.find(pkg => pkg.packageId === selectedPackageId);
    if (!selectedPackage) return;

    // Navigate to payment confirm with upgrade data
    navigate("/payment/confirm", {
      state: {
        package: selectedPackage,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        action: "upgrade"
      }
    });
  };

  const handleCancel = async () => {
    if (!data.currentSubscription) return;
    
    setIsProcessing(true);
    try {
      await onCancel(data.currentSubscription.subscriptionId);
      setShowCancelConfirm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>{data.restaurantName}</CardTitle>
                <CardDescription className="mt-1">
                  {data.currentSubscription ? (
                    <span className="flex items-center gap-2 mt-1 flex-wrap">
                      {getStatusBadge(data.currentSubscription.status)}
                      {getDaysLeftBadge()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No active subscription</span>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {data.currentSubscription ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(data.currentSubscription.startDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </p>
                  <p className="font-medium">
                    {format(new Date(data.currentSubscription.endDate), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Current Package</p>
                <p className="text-lg font-bold text-primary">
                  {data.currentSubscription.packageName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.currentSubscription.amount.toLocaleString()}đ
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPaymentHistory(true)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View History
                </Button>
                
                {data.currentSubscription.status === 'ACTIVE' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setShowRenewConfirm(true)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Renew
                    </Button>
                    {!isOnHighestPackage && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Upgrade
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No subscription found</p>
              <Button onClick={() => navigate(`/payment/select?restaurantId=${data.restaurantId}&action=subscribe`)}>
                Subscribe Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Dialog */}
      <Dialog open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment History - {data.restaurantName}</DialogTitle>
            <DialogDescription>
              View all payment transactions for this restaurant
            </DialogDescription>
          </DialogHeader>
          
          {data.paymentHistory && data.paymentHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.paymentHistory.map((payment) => (
                  <TableRow key={payment.subscriptionPaymentId}>
                    <TableCell>
                      {format(new Date(payment.date), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPurposeLabel(payment.purpose)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.amount.toLocaleString()}đ
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(payment.subscriptionPaymentStatus)}
                        <span className="text-sm">
                          {payment.subscriptionPaymentStatus}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.payOsOrderCode}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payment history found
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Package Selection Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upgrade Package</DialogTitle>
            <DialogDescription>
              Select a higher-tier package to upgrade your subscription
            </DialogDescription>
          </DialogHeader>

          {isLoadingPackages ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : availableUpgradePackages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No upgrade options available</p>
            </div>
          ) : (
            <>
              <RadioGroup value={selectedPackageId} onValueChange={setSelectedPackageId}>
                <div className="space-y-3">
                  {availableUpgradePackages.map((pkg) => (
                    <div
                      key={pkg.packageId}
                      className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        selectedPackageId === pkg.packageId
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPackageId(pkg.packageId!)}
                    >
                      <RadioGroupItem value={pkg.packageId!} id={pkg.packageId} className="mt-1" />
                      <Label htmlFor={pkg.packageId} className="flex-1 cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                            <div className="mt-3 space-y-1">
                              {pkg.features.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-green-600" />
                                  <span>{feature.featureName}: {feature.value || "Unlimited"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {pkg.price.toLocaleString()}đ
                            </p>
                            <p className="text-xs text-muted-foreground">
                              per {pkg.billingPeriod} month
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpgradeConfirm}
                  disabled={!selectedPackageId}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Continue to Payment
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Confirmation Dialog */}
      <Dialog open={showRenewConfirm} onOpenChange={setShowRenewConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Renewal</DialogTitle>
            <DialogDescription>
              Are you sure you want to renew "{data.currentSubscription?.packageName}" package?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRenewConfirm(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenew}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Confirm Renewal
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel "{data.currentSubscription?.packageName}" package?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isProcessing}
            >
              No, Keep It
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Yes, Cancel
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
