import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus, Pencil, Loader2, CheckCircle, XCircle, Trash2,
    Users, AlertTriangle, QrCode, ChevronLeft, Armchair, Info, Building2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
    useTablesByArea,
    useCreateTable,
    useUpdateTable,
    useDeleteTable,
    useSetTableStatus,
    useMarkTableAvailable,
    useMarkTableOutOfOrder,
} from "@/hooks/queries/useTableQueries";
import { useArea, useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { useBranchesByRestaurant, useRestaurantSlugByBranch } from "@/hooks/queries/useBranchQueries";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import TableQrCodeDialog from "@/components/table/TableQrCodeDialog";
import { getTableUrlWithSlug } from "@/utils/tableUrl";
import type { AreaTableDTO } from "@/types/dto";
import { TableStatus, EntityStatus } from "@/types/dto";

const TableManagement = () => {
    const { id: restaurantId, areaId } = useParams<{ id: string; areaId: string }>();
    const navigate = useNavigate();
    const { canManageTables, isRestaurantOwner } = useRoleAccess();
    const { data: area } = useArea(areaId || '');
    const { data: branches = [] } = useBranchesByRestaurant(restaurantId || '');
    const currentBranchId = area?.branchId;
    const { data: allAreas = [] } = useAreasByBranch(currentBranchId || '');
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);

    // Get restaurant slug for generating table URLs
    const { data: restaurantSlug } = useRestaurantSlugByBranch(currentBranchId || '');

    const { data: tables = [], isLoading } = useTablesByArea(areaId || '');
    const createTable = useCreateTable();
    const updateTable = useUpdateTable();
    const deleteTable = useDeleteTable();
    const setTableStatus = useSetTableStatus();
    const markAvailable = useMarkTableAvailable();
    const markOutOfOrder = useMarkTableOutOfOrder();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<AreaTableDTO | null>(null);
    const [deletingTable, setDeletingTable] = useState<AreaTableDTO | null>(null);
    const [viewingQr, setViewingQr] = useState<AreaTableDTO | null>(null);
    const [formData, setFormData] = useState({
        tag: '',
        capacity: 4,
    });

    const openCreate = () => {
        setEditingTable(null);
        setFormData({ tag: '', capacity: 4 });
        setDialogOpen(true);
    };

    const openEdit = (table: AreaTableDTO) => {
        setEditingTable(table);
        setFormData({
            tag: table.tag,
            capacity: table.capacity,
        });
        setDialogOpen(true);
    };

    const openDelete = (table: AreaTableDTO) => {
        setDeletingTable(table);
        setDeleteDialogOpen(true);
    };

    const openQr = (table: AreaTableDTO) => {
        setViewingQr(table);
        setQrDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.tag.trim() || formData.capacity <= 0 || !areaId) return;

        if (editingTable) {
            await updateTable.mutateAsync({
                id: editingTable.areaTableId!,
                data: {
                    tag: formData.tag,
                    capacity: formData.capacity,
                },
            });
        } else {
            await createTable.mutateAsync({
                areaId,
                tag: formData.tag,
                capacity: formData.capacity,
            });
        }
        setDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!deletingTable) return;
        await deleteTable.mutateAsync(deletingTable.areaTableId!);
        setDeleteDialogOpen(false);
        setDeletingTable(null);
    };

    const handleMarkAvailableAll = async () => {
        const nonAvailableTables = tables.filter(t => t.status !== TableStatus.FREE);
        for (const table of nonAvailableTables) {
            await markAvailable.mutateAsync(table.areaTableId!);
        }
    };

    const handleMarkOutOfOrderAll = async () => {
        const availableTables = tables.filter(t => t.status === TableStatus.FREE);
        for (const table of availableTables) {
            await markOutOfOrder.mutateAsync(table.areaTableId!);
        }
    };

    const availableTables = tables.filter(t => t.status === TableStatus.FREE);
    const occupiedTables = tables.filter(t => t.status === TableStatus.OCCUPIED);
    const outOfOrderTables = tables.filter(t => t.status === TableStatus.INACTIVE);

    if (!areaId) {
        return (
            <DashboardLayout>
                <div className="p-6 lg:p-8">
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Please select an area first
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-8 space-y-6">
                {/* Info Alert for Restaurant Owners (View Only) */}
                {isRestaurantOwner && !canManageTables && (
                    <Alert className="border-blue-500/50 bg-blue-500/10">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <AlertDescription className="text-sm text-foreground">
                                    You are viewing table information. To manage tables, please access the Branch Dashboard.
                                </AlertDescription>
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => navigate('/manager/dashboard')}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Building2 className="w-4 h-4" />
                                    Go to Branch Dashboard
                                </Button>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Header with Area Selector */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/dashboard/${restaurantId}/areas`)}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-display">Table Layout</h1>
                            <p className="text-sm text-muted-foreground">Manage your restaurant tables</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeAreas.length > 0 && (
                            <Select
                                value={areaId}
                                onValueChange={(value) => navigate(`/dashboard/${restaurantId}/areas/${value}/tables`)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select area" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAreas.map((a) => (
                                        <SelectItem key={a.areaId} value={a.areaId!}>
                                            {a.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {canManageTables && (
                            <Button onClick={openCreate} className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Table
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Tables</p>
                                    <p className="text-2xl font-bold">{tables.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Armchair className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Available</p>
                                    <p className="text-2xl font-bold text-teal">{availableTables.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-teal" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Occupied</p>
                                    <p className="text-2xl font-bold text-orange-500">{occupiedTables.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card border-border/60">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Out of Order</p>
                                    <p className="text-2xl font-bold text-destructive">{outOfOrderTables.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tables Grid */}
                <Card className="glass-card border-border/60">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Tabs defaultValue="all" className="w-full">
                                <div className="px-6 pt-4 flex items-center justify-between border-b">
                                    <TabsList>
                                        <TabsTrigger value="all" className="gap-2">
                                            All ({tables.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="available" className="gap-2">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Available ({availableTables.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="occupied" className="gap-2">
                                            <Users className="w-3.5 h-3.5" />
                                            Occupied ({occupiedTables.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="out-of-order" className="gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Out of Order ({outOfOrderTables.length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="all" className="m-0">
                                    <TableGrid
                                        tables={tables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                        canManage={canManageTables}
                                    />
                                </TabsContent>

                                <TabsContent value="available" className="m-0">
                                    {canManageTables && (
                                        <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleMarkOutOfOrderAll}
                                                disabled={availableTables.length === 0 || markOutOfOrder.isPending}
                                            >
                                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                                Mark All Out of Order
                                            </Button>
                                        </div>
                                    )}
                                    <TableGrid
                                        tables={availableTables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                        canManage={canManageTables}
                                    />
                                </TabsContent>

                                <TabsContent value="occupied" className="m-0">
                                    <TableGrid
                                        tables={occupiedTables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                        canManage={canManageTables}
                                    />
                                </TabsContent>

                                <TabsContent value="out-of-order" className="m-0">
                                    {canManageTables && (
                                        <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleMarkAvailableAll}
                                                disabled={outOfOrderTables.length === 0 || markAvailable.isPending}
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                                Mark All Available
                                            </Button>
                                        </div>
                                    )}
                                    <TableGrid
                                        tables={outOfOrderTables}
                                        onEdit={openEdit}
                                        onDelete={openDelete}
                                        onViewQr={openQr}
                                        onSetStatus={(table, status) => setTableStatus.mutateAsync({ id: table.areaTableId!, status })}
                                        canManage={canManageTables}
                                    />
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Table Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
                        <DialogDescription>
                            {editingTable ? "Update table information" : "Enter new table details"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="table-tag">Table Tag *</Label>
                            <Input
                                id="table-tag"
                                placeholder="e.g. T01, A02, VIP-1"
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">Must be unique within this area</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="table-capacity">Capacity *</Label>
                            <Input
                                id="table-capacity"
                                type="number"
                                min="1"
                                placeholder="e.g. 4"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Number of people this table can accommodate</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={
                                !formData.tag.trim() ||
                                formData.capacity <= 0 ||
                                createTable.isPending ||
                                updateTable.isPending
                            }
                        >
                            {(createTable.isPending || updateTable.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {editingTable ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                editingTable ? "Update" : "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Table Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete table "{deletingTable?.tag}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteTable.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Table'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* QR Code Dialog */}
            <TableQrCodeDialog
                open={qrDialogOpen}
                onOpenChange={setQrDialogOpen}
                table={viewingQr}
                tableUrl={viewingQr?.areaTableId && restaurantSlug ? getTableUrlWithSlug(viewingQr.areaTableId, restaurantSlug) : undefined}
                showTableInfo={true}
            />
        </DashboardLayout>
    );
};

interface TableGridProps {
    tables: AreaTableDTO[];
    onEdit: (table: AreaTableDTO) => void;
    onDelete: (table: AreaTableDTO) => void;
    onViewQr: (table: AreaTableDTO) => void;
    onSetStatus: (table: AreaTableDTO, status: TableStatus) => void;
    canManage: boolean;
}

const TableGrid = ({ tables, onEdit, onDelete, onViewQr, onSetStatus, canManage }: TableGridProps) => {
    if (tables.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <Armchair className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-1">No tables found</p>
                <p className="text-sm">Click "Add Table" to create your first table</p>
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map((table) => (
                <TableCard
                    key={table.areaTableId}
                    table={table}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewQr={onViewQr}
                    onSetStatus={onSetStatus}
                    canManage={canManage}
                />
            ))}
        </div>
    );
};

interface TableCardProps {
    table: AreaTableDTO;
    onEdit: (table: AreaTableDTO) => void;
    onDelete: (table: AreaTableDTO) => void;
    onViewQr: (table: AreaTableDTO) => void;
    onSetStatus: (table: AreaTableDTO, status: TableStatus) => void;
    canManage: boolean;
}

const TableCard = ({ table, onEdit, onDelete, onViewQr, onSetStatus, canManage }: TableCardProps) => {
    const getStatusStyles = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return {
                    card: 'bg-gradient-to-br from-teal/5 to-teal/10 border-teal/20 hover:border-teal/40 hover:shadow-teal/20',
                    icon: 'bg-teal/10 text-teal',
                    badge: 'bg-teal/20 text-teal',
                };
            case TableStatus.OCCUPIED:
                return {
                    card: 'bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20 hover:border-orange-500/40 hover:shadow-orange-500/20',
                    icon: 'bg-orange-500/10 text-orange-500',
                    badge: 'bg-orange-500/20 text-orange-500',
                };
            case TableStatus.INACTIVE:
                return {
                    card: 'bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:border-destructive/40 hover:shadow-destructive/20',
                    icon: 'bg-destructive/10 text-destructive',
                    badge: 'bg-destructive/20 text-destructive',
                };
            default:
                return {
                    card: 'bg-muted/50 border-border/60',
                    icon: 'bg-muted text-muted-foreground',
                    badge: 'bg-muted text-muted-foreground',
                };
        }
    };

    const getStatusIcon = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return <CheckCircle className="w-4 h-4" />;
            case TableStatus.OCCUPIED:
                return <Users className="w-4 h-4" />;
            case TableStatus.INACTIVE:
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <XCircle className="w-4 h-4" />;
        }
    };

    const getStatusText = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return 'Available';
            case TableStatus.OCCUPIED:
                return 'Occupied';
            case TableStatus.INACTIVE:
                return 'Out of Order';
            default:
                return 'Unknown';
        }
    };

    const styles = getStatusStyles();

    return (
        <Card className={`${styles.card} transition-all duration-300 cursor-pointer group relative border-2 hover:shadow-lg`}>
            <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                    {/* Table Visual */}
                    <div className={`w-20 h-20 rounded-2xl ${styles.icon} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                        <Armchair className="w-10 h-10" />
                    </div>

                    {/* Table Info */}
                    <div className="text-center w-full">
                        <h3 className="font-bold text-xl mb-1">{table.tag}</h3>
                        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-2">
                            <Users className="w-4 h-4" />
                            <span>{table.capacity} seats</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                            {getStatusIcon()}
                            <span>{getStatusText()}</span>
                        </div>
                    </div>

                    {/* Quick Actions - Show on hover */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {canManage && (
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(table);
                                }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewQr(table);
                            }}
                        >
                            <QrCode className="w-3.5 h-3.5" />
                        </Button>
                        {canManage && (
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(table);
                                }}
                            >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TableManagement;
