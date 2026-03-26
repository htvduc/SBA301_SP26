import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Plus, Pencil, Loader2, Armchair, CheckCircle, XCircle, Trash2, Users, AlertTriangle, ArrowLeft, QrCode,
} from "lucide-react";
import {
    useTablesByArea,
    useCreateTable,
    useUpdateTable,
    useDeleteTable,
    useMarkTableAvailable,
    useMarkTableOccupied,
    useMarkTableOutOfOrder,
} from "@/hooks/queries/useTableQueries";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { useRestaurantSlugByBranch } from "@/hooks/queries/useBranchQueries";
import { useBranchContext } from "@/hooks/useBranchContext";
import TableQrCodeDialog from "@/components/table/TableQrCodeDialog";
import { getTableUrlWithSlug } from "@/utils/tableUrl";
import type { AreaTableDTO } from "@/types/dto";
import { TableStatus, EntityStatus } from "@/types/dto";

const ManagerTableManagement = () => {
    const { areaId } = useParams<{ areaId: string }>();
    const navigate = useNavigate();
    const { branchId } = useBranchContext();

    const { data: allAreas = [] } = useAreasByBranch(branchId || '');
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);

    // Get restaurant slug for generating table URLs
    const { data: restaurantSlug } = useRestaurantSlugByBranch(branchId || '');

    const [selectedAreaId, setSelectedAreaId] = useState<string>(areaId || (activeAreas.length > 0 ? activeAreas[0].areaId! : ''));
    const selectedArea = activeAreas.find(a => a.areaId === selectedAreaId);

    const { data: tables = [], isLoading } = useTablesByArea(selectedAreaId);
    const createTable = useCreateTable();
    const updateTable = useUpdateTable();
    const deleteTable = useDeleteTable();
    const markAvailable = useMarkTableAvailable();
    const markOccupied = useMarkTableOccupied();
    const markOutOfOrder = useMarkTableOutOfOrder();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<AreaTableDTO | null>(null);
    const [deletingTable, setDeletingTable] = useState<AreaTableDTO | null>(null);
    const [viewingQr, setViewingQr] = useState<AreaTableDTO | null>(null);
    const [formData, setFormData] = useState({
        tag: '',
        capacity: 2,
        status: TableStatus.FREE,
    });

    const openCreate = () => {
        setEditingTable(null);
        setFormData({ tag: '', capacity: 2, status: TableStatus.FREE });
        setDialogOpen(true);
    };

    const openEdit = (table: AreaTableDTO) => {
        setEditingTable(table);
        setFormData({
            tag: table.tag,
            capacity: table.capacity,
            status: table.status,
        });
        setDialogOpen(true);
    };

    const openDelete = (table: AreaTableDTO) => {
        setDeletingTable(table);
        setDeleteDialogOpen(true);
    };

    const openQrCode = (table: AreaTableDTO) => {
        setViewingQr(table);
        setQrDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.tag.trim() || !selectedAreaId) return;

        if (editingTable) {
            await updateTable.mutateAsync({
                id: editingTable.areaTableId!,
                data: {
                    tag: formData.tag,
                    capacity: formData.capacity,
                    status: formData.status,
                },
            });
        } else {
            await createTable.mutateAsync({
                areaId: selectedAreaId,
                tag: formData.tag,
                capacity: formData.capacity,
                status: formData.status,
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

    const handleStatusChange = async (table: AreaTableDTO, newStatus: TableStatus) => {
        switch (newStatus) {
            case TableStatus.FREE:
                await markAvailable.mutateAsync(table.areaTableId!);
                break;
            case TableStatus.OCCUPIED:
                await markOccupied.mutateAsync(table.areaTableId!);
                break;
            case TableStatus.INACTIVE:
                await markOutOfOrder.mutateAsync(table.areaTableId!);
                break;
        }
    };

    const availableTables = tables.filter(t => t.status === TableStatus.FREE);
    const occupiedTables = tables.filter(t => t.status === TableStatus.OCCUPIED);
    const outOfOrderTables = tables.filter(t => t.status === TableStatus.INACTIVE);

    if (!branchId) {
        return (
            <div className="p-6 lg:p-8">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No branch assigned to your account
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/manager/areas')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Areas
                    </Button>
                    <div>
                        <h1 className="text-2xl font-display">Table Management</h1>
                        <p className="text-sm text-muted-foreground">
                            {selectedArea ? `Managing tables in ${selectedArea.name}` : 'Select an area to manage tables'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {activeAreas.length > 0 && (
                        <Select
                            value={selectedAreaId}
                            onValueChange={setSelectedAreaId}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeAreas.map((area) => (
                                    <SelectItem key={area.areaId} value={area.areaId!}>
                                        {area.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {selectedAreaId && (
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Table
                        </Button>
                    )}
                </div>
            </div>

            {selectedAreaId ? (
                <>
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
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Armchair className="w-4 h-4 text-primary" />
                                Tables in {selectedArea?.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <Tabs defaultValue="all" className="w-full">
                                    <div className="px-6 pt-2 flex items-center justify-between border-b">
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
                                            onStatusChange={handleStatusChange}
                                            onViewQr={openQrCode}
                                        />
                                    </TabsContent>

                                    <TabsContent value="available" className="m-0">
                                        <TableGrid
                                            tables={availableTables}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                            onStatusChange={handleStatusChange}
                                            onViewQr={openQrCode}
                                        />
                                    </TabsContent>

                                    <TabsContent value="occupied" className="m-0">
                                        <TableGrid
                                            tables={occupiedTables}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                            onStatusChange={handleStatusChange}
                                            onViewQr={openQrCode}
                                        />
                                    </TabsContent>

                                    <TabsContent value="out-of-order" className="m-0">
                                        <TableGrid
                                            tables={outOfOrderTables}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                            onStatusChange={handleStatusChange}
                                            onViewQr={openQrCode}
                                        />
                                    </TabsContent>
                                </Tabs>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="glass-card border-border/60">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Armchair className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-1">No areas available</p>
                        <p className="text-sm">Create an area first to manage tables</p>
                        <Button
                            className="mt-4"
                            onClick={() => navigate('/manager/areas')}
                        >
                            Go to Area Management
                        </Button>
                    </CardContent>
                </Card>
            )}

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
                                placeholder="e.g. T1, A01, VIP-1"
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="table-capacity">Capacity *</Label>
                            <Input
                                id="table-capacity"
                                type="number"
                                min="1"
                                max="20"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="table-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: TableStatus) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TableStatus.FREE}>🟢 Available</SelectItem>
                                    <SelectItem value={TableStatus.OCCUPIED}>🟠 Occupied</SelectItem>
                                    <SelectItem value={TableStatus.INACTIVE}>🔴 Out of Order</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={
                                !formData.tag.trim() ||
                                formData.capacity < 1 ||
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
            />
        </div>
    );
};

interface TableGridProps {
    tables: AreaTableDTO[];
    onEdit: (table: AreaTableDTO) => void;
    onDelete: (table: AreaTableDTO) => void;
    onStatusChange: (table: AreaTableDTO, status: TableStatus) => void;
    onViewQr: (table: AreaTableDTO) => void;
}

const TableGrid = ({ tables, onEdit, onDelete, onStatusChange, onViewQr }: TableGridProps) => {
    if (tables.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <Armchair className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-1">No tables found</p>
                <p className="text-sm">Click "Add Table" to create one.</p>
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table) => (
                <TableCard
                    key={table.areaTableId}
                    table={table}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onViewQr={onViewQr}
                />
            ))}
        </div>
    );
};

interface TableCardProps {
    table: AreaTableDTO;
    onEdit: (table: AreaTableDTO) => void;
    onDelete: (table: AreaTableDTO) => void;
    onStatusChange: (table: AreaTableDTO, status: TableStatus) => void;
    onViewQr: (table: AreaTableDTO) => void;
}

const TableCard = ({ table, onEdit, onDelete, onStatusChange, onViewQr }: TableCardProps) => {
    const getStatusStyles = () => {
        switch (table.status) {
            case TableStatus.FREE:
                return {
                    card: 'bg-gradient-to-br from-teal/5 to-teal/10 border-teal/20 hover:border-teal/40',
                    icon: 'bg-teal/10 text-teal',
                    badge: 'bg-teal/20 text-teal',
                };
            case TableStatus.OCCUPIED:
                return {
                    card: 'bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
                    icon: 'bg-orange-500/10 text-orange-500',
                    badge: 'bg-orange-500/20 text-orange-500',
                };
            case TableStatus.INACTIVE:
                return {
                    card: 'bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:border-destructive/40',
                    icon: 'bg-destructive/10 text-destructive',
                    badge: 'bg-destructive/20 text-destructive',
                };
            default:
                return {
                    card: 'bg-muted/50 border-border/60 hover:border-border',
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
        <Card className={`${styles.card} transition-all duration-300 border-2 group hover:shadow-lg`}>
            <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                    {/* Table Visual & Actions */}
                    <div className="flex items-start justify-between">
                        <div className={`w-16 h-16 rounded-2xl ${styles.icon} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                            <Armchair className="w-8 h-8" />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onViewQr(table)}
                                title="View QR Code"
                            >
                                <QrCode className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onEdit(table)}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onDelete(table)}
                            >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                        </div>
                    </div>

                    {/* Table Info */}
                    <div>
                        <h3 className="font-bold text-xl mb-1">{table.tag}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                            <Users className="w-4 h-4" />
                            <span>{table.capacity} seats</span>
                        </div>

                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${styles.badge} mb-3`}>
                            {getStatusIcon()}
                            <span>{getStatusText()}</span>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex gap-1">
                            {table.status !== TableStatus.FREE && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-teal hover:bg-teal/10"
                                    onClick={() => onStatusChange(table, TableStatus.FREE)}
                                >
                                    Mark Available
                                </Button>
                            )}
                            {table.status !== TableStatus.OCCUPIED && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-orange-500 hover:bg-orange-500/10"
                                    onClick={() => onStatusChange(table, TableStatus.OCCUPIED)}
                                >
                                    Mark Occupied
                                </Button>
                            )}
                            {table.status !== TableStatus.INACTIVE && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-destructive hover:bg-destructive/10"
                                    onClick={() => onStatusChange(table, TableStatus.INACTIVE)}
                                >
                                    Out of Order
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManagerTableManagement;