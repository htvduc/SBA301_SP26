import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Phone, Mail, MapPin, Store, Save, Loader2 } from "lucide-react";
import { useBranch, useUpdateBranchContactInfo } from "@/hooks/queries/useBranchQueries";
import { useBranchContext } from "@/hooks/useBranchContext";

export default function BranchInfo() {
  const { branchId } = useBranchContext();

  const { data: branch, isLoading } = useBranch(branchId ?? "");
  const updateContactInfo = useUpdateBranchContactInfo();

  const [phone, setPhone] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [email, setEmail] = useState("");

  // Sync form state when branch data loads
  useEffect(() => {
    if (branch) {
      setPhone(branch.branchPhone ?? "");
      setEmail(branch.mail ?? "");
    }
  }, [branch]);

  const handleSave = async () => {
    if (!branchId || !branch) return;
    await updateContactInfo.mutateAsync({
      id: branchId,
      data: {
        branchPhone: phone,
        mail: email,
      },
    });
    setConfirmOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
        <p className="text-muted-foreground">Manage contact information for this branch</p>
      </div>

      <Card className="glass-card border-border/60 w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Branch Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">Update contact details for your branch</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-10 bg-muted/50"
                    value={branch?.address ?? ""}
                    readOnly
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Address cannot be changed by managers
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setConfirmOpen(true)}
                  disabled={updateContactInfo.isPending}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Confirm Save Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to save the changes to this branch's contact information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateContactInfo.isPending}>
              {updateContactInfo.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {updateContactInfo.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
