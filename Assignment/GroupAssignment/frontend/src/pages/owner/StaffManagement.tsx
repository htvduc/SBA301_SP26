import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  ArrowLeft,
  Plus,
  Pencil,
  UserCircle,
  Loader2,
  Users,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  ArrowRightLeft,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useBranchesByRestaurant } from "@/hooks/queries/useBranchQueries";
import {
  useStaffByBranch,
  useCreateStaffAccount,
  useUpdateStaffAccount,
  useToggleStaffStatus,
  useResetStaffPassword,
  useTransferStaffToBranch,
} from "@/hooks/queries/useStaffQueries";
import type {
  BranchDTO,
  StaffAccountDTO,
  StaffRoleName,
} from "@/types/dto";

const roleColors: Record<StaffRoleName, string> = {
  WAITER: "bg-[#0b2926] text-[#2dd4bf] border-[#0f3d38]",
  RECEPTIONIST: "bg-[#291a0b] text-[#fbbf24] border-[#3d260f]",
  ADMIN: "bg-[#0b1733] text-[#60a5fa] border-[#0f224d]",
  RESTAURANT_OWNER: "bg-[#0b1733] text-[#60a5fa] border-[#0f224d]",
  BRANCH_MANAGER: "bg-[#0b1733] text-[#60a5fa] border-[#0f224d]",
};

const roleLabel: Record<StaffRoleName, string> = {
  WAITER: "Waiter",
  RECEPTIONIST: "Receptionist",
  ADMIN: "Admin",
  RESTAURANT_OWNER: "Owner",
  BRANCH_MANAGER: "Branch Manager",
};

const StaffManagement = () => {
  const { id: restaurantId } = useParams<{ id: string }>();

  const {
    data: branches = [],
    isLoading: isLoadingBranches,
  } = useBranchesByRestaurant(restaurantId || "");

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffAccountDTO | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const size = 10;

  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<StaffRoleName>("WAITER");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [staffToToggle, setStaffToToggle] = useState<StaffAccountDTO | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"activate" | "deactivate">("activate");

  // Reset password state
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [staffToReset, setStaffToReset] = useState<StaffAccountDTO | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdResetError, setPwdResetError] = useState("");

  // Transfer branch state
  const [transferOpen, setTransferOpen] = useState(false);
  const [staffToTransfer, setStaffToTransfer] = useState<StaffAccountDTO | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string>("");
  
  const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError("At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const {
    data: staffPage,
    isLoading: isLoadingStaff,
  } = useStaffByBranch(
    selectedBranchId || undefined, 
    page, 
    size, 
    debouncedSearchQuery || undefined, 
    roleFilter === "ALL" ? undefined : roleFilter, 
    activeTab === "active" // pass true for active tab, false for inactive
  );

  const staff: StaffAccountDTO[] = staffPage?.content || [];

  const createStaff = useCreateStaffAccount();
  const updateStaff = useUpdateStaffAccount();
  const toggleStatus = useToggleStaffStatus();
  const resetPassword = useResetStaffPassword();
  const transferStaff = useTransferStaffToBranch();

  const openResetPassword = (s: StaffAccountDTO) => {
    setStaffToReset(s);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPwd(false);
    setPwdResetError("");
    setResetPwdOpen(true);
  };

  const handleResetPassword = async () => {
    if (!staffToReset) return;
    if (newPassword !== confirmPassword) {
      setPwdResetError("Passwords do not match");
      return;
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      setPwdResetError("At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char");
      return;
    }
    setPwdResetError("");
    await resetPassword.mutateAsync({ staffAccountId: staffToReset.id, newPassword });
    setResetPwdOpen(false);
  };

  const openTransferBranch = (s: StaffAccountDTO) => {
    setStaffToTransfer(s);
    setTargetBranchId("");
    setTransferOpen(true);
  };

  const handleTransferBranch = async () => {
    if (!staffToTransfer || !targetBranchId) return;
    await transferStaff.mutateAsync({ 
      staffAccountId: staffToTransfer.id, 
      newBranchId: targetBranchId 
    });
    setTransferOpen(false);
  };

  const selectedBranch: BranchDTO | undefined = branches.find(
    (b) => b.branchId === selectedBranchId,
  );

  const getStaffCount = (branch: BranchDTO) => branch.staffCount ?? 0;

  const openCreate = () => {
    setEditingStaff(null);
    setFormUsername("");
    setFormPassword("");
    setFormRole("WAITER");
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEdit = (s: StaffAccountDTO) => {
    setEditingStaff(s);
    setFormUsername(s.username);
    setFormPassword("");
    setShowPassword(false);
    setFormRole((s.role?.name as StaffRoleName) || "WAITER");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBranchId || !formUsername.trim()) return;

    if (editingStaff) {
      await updateStaff.mutateAsync({
        staffAccountId: editingStaff.id,
        username: formUsername.trim(),
        role: {
          name: formRole,
          description: editingStaff.role?.description || "",
        },
        status: editingStaff.status,
        branchId: selectedBranchId,
      });
    } else {
      if (!validatePassword(formPassword.trim())) return;

      await createStaff.mutateAsync({
        username: formUsername.trim(),
        password: formPassword.trim(),
        branchId: selectedBranchId,
        role: {
          name: formRole,
          description: "",
        },
      });
    }

    setDialogOpen(false);
  };

  const toggleActive = (staff: StaffAccountDTO) => {
    setStaffToToggle(staff);
    setToggleConfirmOpen(true);
  };

  const handleConfirmToggle = () => {
    if (staffToToggle) {
      toggleStatus.mutate(staffToToggle.id, {
        onSuccess: () => {
          setToggleConfirmOpen(false);
          setStaffToToggle(null);
        }
      });
    }
  };

  const filteredStaff = staff; // Backend already filters by status, keyword, and role
  const activeStaff = activeTab === "active" ? filteredStaff : [];
  const inactiveStaff = activeTab === "inactive" ? filteredStaff : [];

  // Reset page when search, filters, or tab changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, roleFilter, activeTab]);

  const handleDeactivateAll = () => {
    setBulkAction("deactivate");
    setBulkConfirmOpen(true);
  };

  const handleActivateAll = () => {
    setBulkAction("activate");
    setBulkConfirmOpen(true);
  };

  const handleConfirmBulk = async () => {
    const list = bulkAction === "activate" ? inactiveStaff : activeStaff;
    await Promise.all(list.map(s => toggleStatus.mutateAsync(s.id)));
    setBulkConfirmOpen(false);
  };

  // Branch list view
  if (!selectedBranchId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-display mb-1">Staff Management</h2>
          <p className="text-sm text-muted-foreground">
            Select a branch to manage its staff accounts
          </p>
        </div>

        {isLoadingBranches ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3">
            {branches.map((branch) => (
              <Card
                key={branch.branchId}
                className="bg-card dark:bg-[#1a1c24] border border-border dark:border-gray-800 cursor-pointer hover:border-primary/40 dark:hover:border-primary/40 transition-colors text-card-foreground dark:text-gray-200 shadow-sm"
                onClick={() => setSelectedBranchId(branch.branchId!)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm max-w-[220px] truncate">
                          {branch.address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {branch.mail}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {getStaffCount(branch)} staff
                      </Badge>
                      {branch.isActive === false && (
                        <Badge
                          variant="secondary"
                          className="text-muted-foreground"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {branches.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No branches yet. Add branches in the Overview tab first.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Staff list view for selected branch
  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedBranchId(null)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-lg font-display">
              {selectedBranch?.address || "Branch"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedBranch?.mail}
            </p>
          </div>
        </div>

        <Card className="bg-card dark:bg-[#1a1c24] border border-border dark:border-0 text-card-foreground dark:text-white shadow-sm dark:shadow-md rounded-2xl min-h-[400px] flex flex-col mt-4">
          <CardHeader className="pb-3 border-b border-border dark:border-gray-800">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-foreground dark:text-gray-200">
                <UserCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Staff Accounts
              </CardTitle>
              <Button size="sm" className="h-8 gap-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-4" onClick={openCreate}>
                <Plus className="w-4 h-4" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {isLoadingStaff ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "inactive")} className="w-full">
                <div className="px-5 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-border dark:border-gray-800">
                  <TabsList className="w-max bg-secondary dark:bg-[#14161f] border border-border dark:border-gray-800 p-1 h-10 rounded-xl">
                    <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-[#2a2d3d] data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground dark:text-gray-400">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-[#2a2d3d] data-[state=active]:text-foreground dark:data-[state=active]:text-white rounded-lg px-4 py-1.5 text-sm font-medium text-muted-foreground dark:text-gray-400">
                      Inactive
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <TabsContent value="active" className="m-0">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-10 px-5 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 text-red-600 dark:text-red-500 dark:hover:bg-red-500/20 border-0 rounded-lg text-sm font-medium"
                        onClick={handleDeactivateAll}
                        disabled={activeStaff.length === 0 || toggleStatus.isPending}
                      >
                        Deactivate All
                      </Button>
                    </TabsContent>
                    <TabsContent value="inactive" className="m-0">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-teal/10 dark:hover:bg-teal/20 dark:text-teal h-10 px-5 border-0 rounded-lg text-sm font-medium"
                        onClick={handleActivateAll}
                        disabled={inactiveStaff.length === 0 || toggleStatus.isPending}
                      >
                        Activate All
                      </Button>
                    </TabsContent>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[140px] h-10 bg-background dark:bg-[#1a1c24] border-border dark:border-gray-800 text-foreground dark:text-gray-300 rounded-lg text-sm">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent className="bg-background dark:bg-[#1a1c24] border-border dark:border-gray-800 text-foreground dark:text-gray-300">
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="WAITER">Waiter</SelectItem>
                        <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                        <SelectItem value="BRANCH_MANAGER">Branch Manager</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative flex-1 min-w-[200px] max-w-[280px]">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-500" />
                      <Input
                        className="pl-10 h-10 bg-background dark:bg-[#14161f] border-border dark:border-gray-800 text-foreground dark:text-gray-200 placeholder:text-muted-foreground dark:placeholder:text-gray-500 rounded-lg focus-visible:ring-1 focus-visible:ring-ring dark:focus-visible:ring-gray-700 text-sm"
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                <TabsContent value="active" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border dark:border-gray-800 hover:bg-transparent">
                        <TableHead className="pl-6 w-[25%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Username</TableHead>
                        <TableHead className="w-[30%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Role</TableHead>
                        <TableHead className="w-[30%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Status</TableHead>
                        <TableHead className="text-right pr-6 w-[15%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeStaff.map((s) => {
                        const roleName = (s.role?.name || "WAITER") as StaffRoleName;
                        return (
                          <TableRow key={s.id} className="border-b border-border dark:border-gray-800 hover:bg-muted/50 dark:hover:bg-[#20222a] border-t-0">
                            <TableCell className="pl-6 font-medium text-[13px] text-foreground dark:text-gray-200">
                              {s.username}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`border w-max px-3 py-1 text-[13px] font-medium ${roleColors[roleName]}`}>
                                {roleLabel[roleName]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked
                                  onCheckedChange={() => toggleActive(s)}
                                  className="scale-90"
                                />
                                <span className="text-[12px] font-medium text-teal-600 dark:text-teal">
                                  Active
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10"
                                  onClick={() => openTransferBranch(s)}
                                  title="Transfer to another branch"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/10"
                                  onClick={() => openResetPassword(s)}
                                  title="Reset password"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                                  onClick={() => openEdit(s)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {activeStaff.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No active staff accounts matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="inactive" className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border dark:border-gray-800 hover:bg-transparent">
                        <TableHead className="pl-6 w-[25%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Username</TableHead>
                        <TableHead className="w-[30%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Role</TableHead>
                        <TableHead className="w-[30%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Status</TableHead>
                        <TableHead className="text-right pr-6 w-[15%] text-muted-foreground dark:text-gray-400 font-medium h-12 text-[13px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveStaff.map((s) => {
                        const roleName = (s.role?.name || "WAITER") as StaffRoleName;
                        return (
                          <TableRow key={s.id} className="border-b border-border dark:border-gray-800 hover:bg-muted/50 dark:hover:bg-[#20222a] border-t-0">
                            <TableCell className="pl-6 font-medium text-[13px] text-foreground dark:text-gray-200">
                              {s.username}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`border w-max px-3 py-1 text-[13px] font-medium ${roleColors[roleName]}`}>
                                {roleLabel[roleName]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={false}
                                  onCheckedChange={() => toggleActive(s)}
                                  className="scale-90"
                                />
                                <span className="text-[12px] font-medium text-muted-foreground">
                                  Inactive
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-black/5 dark:hover:bg-white/10"
                                  onClick={() => openTransferBranch(s)}
                                  title="Transfer to another branch"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-black/5 dark:hover:bg-white/10"
                                  onClick={() => openResetPassword(s)}
                                  title="Reset password"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
                                  onClick={() => openEdit(s)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {inactiveStaff.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No inactive staff accounts matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}

          {/* Pagination */}
          {!isLoadingStaff && staffPage && staffPage.totalPages > 1 && (
            <div className="py-4 border-t border-border dark:border-gray-800">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: staffPage.totalPages }).map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink 
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(staffPage.totalPages, p + 1))}
                      className={page === staffPage.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Create/Edit Staff Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff Account" : "Add New Staff Account"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff
                ? "Update staff account information"
                : "Enter new staff account details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staff-username">Username *</Label>
              <Input
                id="staff-username"
                placeholder="e.g. waiter01"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
            </div>
            {!editingStaff && (
              <div className="space-y-2">
                <Label htmlFor="staff-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a temporary password"
                    value={formPassword}
                    onChange={(e) => {
                      setFormPassword(e.target.value);
                      if (passwordError) validatePassword(e.target.value);
                    }}
                    onBlur={(e) => validatePassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formRole}
                onValueChange={(v) => setFormRole(v as StaffRoleName)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAITER">Waiter</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem value="BRANCH_MANAGER">Branch Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formUsername.trim() ||
                (!editingStaff && (!formPassword.trim() || !!passwordError)) ||
                createStaff.isPending ||
                updateStaff.isPending
              }
            >
              {createStaff.isPending || updateStaff.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingStaff ? "Saving..." : "Creating..."}
                </>
              ) : editingStaff ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={toggleConfirmOpen} onOpenChange={setToggleConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to {staffToToggle?.isActive ? "deactivate" : "activate"} user <strong>{staffToToggle?.username}</strong>?
              {!staffToToggle?.isActive && " They will be able to log in again."}
              {staffToToggle?.isActive && " They will no longer be able to log in."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleConfirmOpen(false)}>Cancel</Button>
            <Button
              variant={staffToToggle?.isActive ? "destructive" : "default"}
              onClick={handleConfirmToggle}
              disabled={toggleStatus.isPending}
            >
              {toggleStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {staffToToggle?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} all {bulkAction === "activate" ? "inactive" : "active"} staff members?
              This will affect {bulkAction === "activate" ? inactiveStaff.length : activeStaff.length} accounts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirmOpen(false)}>Cancel</Button>
            <Button
              variant={bulkAction === "deactivate" ? "destructive" : "default"}
              onClick={handleConfirmBulk}
              disabled={toggleStatus.isPending}
            >
              {toggleStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {bulkAction === "deactivate" ? "Deactivate All" : "Activate All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPwdOpen} onOpenChange={setResetPwdOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{staffToReset?.username}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="owner-new-password">New Password *</Label>
              <Input
                id="owner-new-password"
                type={showNewPwd ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPwdResetError(""); }}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner-confirm-password">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="owner-confirm-password"
                  type={showNewPwd ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPwdResetError(""); }}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                >
                  {showNewPwd ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            {pwdResetError && <p className="text-sm text-destructive">{pwdResetError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwdOpen(false)}>Cancel</Button>
            <Button
              onClick={handleResetPassword}
              disabled={!newPassword || !confirmPassword || resetPassword.isPending}
            >
              {resetPassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Branch Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Staff to Another Branch</DialogTitle>
            <DialogDescription>
              Transfer <strong>{staffToTransfer?.username}</strong> to a different branch within the same restaurant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Target Branch</Label>
              <Select value={targetBranchId} onValueChange={setTargetBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    .filter(b => b.branchId !== staffToTransfer?.branchId)
                    .map(branch => (
                      <SelectItem key={branch.branchId} value={branch.branchId!}>
                        {branch.address}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button
              onClick={handleTransferBranch}
              disabled={!targetBranchId || transferStaff.isPending}
            >
              {transferStaff.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaffManagement;
