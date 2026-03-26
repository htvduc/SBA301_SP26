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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus, Pencil, Loader2, MapPin, CheckCircle, XCircle, Trash2, Table as TableIcon,
} from "lucide-react";
import {
    useAreasByBranch,
    useCreateArea,
    useUpdateArea,
    useDeleteArea,
    useActivateArea,
    useDeactivateArea,
} from "@/hooks/queries/useAreaQueries";
import { useTablesByArea } from "@/hooks/queries/useTableQueries";
import { useBranchContext } from "@/hooks/useBranchContext";
import type { AreaDTO } from "@/types/dto";
import { EntityStatus } from "@/types/dto";

const ManagerAreaManagement = () => {
    const navigate = useNavigate();
    const { branchId } = useBranchContext();

    const { data: areas = [], isLoading } = useAreasByBranch(branchId || '');
    const createArea = useCreateArea();
    const updateArea = useUpdateArea();
    const deleteArea = useDeleteArea();
    const activateArea = useActivateArea();
    const deactivateArea = useDeactivateArea();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<AreaDTO | null>(null);
    const [deletingArea, setDeletingArea] = useState<AreaDTO | null>(null);
    const [formData, setFormData] = useState({
        name: '',
    });

    const openCreate = () => {
        setEditingArea(null);
        setFormData({ name: '' });
        setDialogOpen(true);
    };

    const openEdit = (area: AreaDTO) => {
        setEditingArea(area);
        setFormData({ name: area.name });
        setDialogOpen(true);
    };

    const openDelete = (area: AreaDTO) => {
        setDeletingArea(area);
        setDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !branchId) return;

        if (editingArea) {
            await updateArea.mutateAsync({
                id: editingArea.areaId!,
                data: { name: formData.name },
            });
        } else {
            await createArea.mutateAsync({
                branchId,
                name: formData.name,
            });
        }
        setDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!deletingArea) return;
        await deleteArea.mutateAsync(deletingArea.areaId!);
        setDeleteDialogOpen(false);
        setDeletingArea(null);
    };

    const handleActivateAll = async () => {
        const inactiveAreas = areas.filter(a => a.status === EntityStatus.INACTIVE);
        for (const area of inactiveAreas) {
            await activateArea.mutateAsync(area.areaId!);
        }
    };

    const handleDeactivateAll = async () => {
        const activeAreas = areas.filter(a => a.status === EntityStatus.ACTIVE);
        for (const area of activeAreas) {
            await deactivateArea.mutateAsync(area.areaId!);
        }
    };

    const activeAreas = areas.filter(a => a.status === EntityStatus.ACTIVE);
    const inactiveAreas = areas.filter(a => a.status === EntityStatus.INACTIVE);

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
        <div className="p-6 lg:p-8">
            <Card className="glass-card border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="w-4 h-4 text-primary" />
                            Area Management
                        </CardTitle>
                        <Button size="sm" onClick={openCreate}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Area
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Tabs defaultValue="active" className="w-full">
                            <div className="px-6 pt-2 flex items-center justify-between border-b">
                                <TabsList>
                                    <TabsTrigger value="active" className="gap-2">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Active ({activeAreas.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="inactive" className="gap-2">
                                        <XCircle className="w-3.5 h-3.5" />
                                        Inactive ({inactiveAreas.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="all" className="gap-2">
                                        All ({areas.length})
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="active" className="m-0">
                                <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDeactivateAll}
                                        disabled={activeAreas.length === 0 || deactivateArea.isPending}
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Deactivate All
                                    </Button>
                                </div>
                                <AreaGrid
                                    areas={activeAreas}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                    onToggleStatus={(area) =>
                                        area.status === EntityStatus.ACTIVE
                                            ? deactivateArea.mutateAsync(area.areaId!)
                                            : activateArea.mutateAsync(area.areaId!)
                                    }
                                    onViewTables={(areaId) => navigate(`/manager/areas/${areaId}/tables`)}
                                />
                            </TabsContent>

                            <TabsContent value="inactive" className="m-0">
                                <div className="px-6 py-3 border-b bg-muted/30 flex justify-end">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleActivateAll}
                                        disabled={inactiveAreas.length === 0 || activateArea.isPending}
                                    >
                                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Activate All
                                    </Button>
                                </div>
                                <AreaGrid
                                    areas={inactiveAreas}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                    onToggleStatus={(area) =>
                                        area.status === EntityStatus.ACTIVE
                                            ? deactivateArea.mutateAsync(area.areaId!)
                                            : activateArea.mutateAsync(area.areaId!)
                                    }
                                    onViewTables={(areaId) => navigate(`/manager/areas/${areaId}/tables`)}
                                />
                            </TabsContent>

                            <TabsContent value="all" className="m-0">
                                <AreaGrid
                                    areas={areas}
                                    onEdit={openEdit}
                                    onDelete={openDelete}
                                    onToggleStatus={(area) =>
                                        area.status === EntityStatus.ACTIVE
                                            ? deactivateArea.mutateAsync(area.areaId!)
                                            : activateArea.mutateAsync(area.areaId!)
                                    }
                                    onViewTables={(areaId) => navigate(`/manager/areas/${areaId}/tables`)}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Area Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingArea ? "Edit Area" : "Add New Area"}</DialogTitle>
                        <DialogDescription>
                            {editingArea ? "Update area information" : "Enter new area details"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="area-name">Area Name *</Label>
                            <Input
                                id="area-name"
                                placeholder="e.g. Floor 1, Outdoor, VIP"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSave}
                            disabled={
                                !formData.name.trim() ||
                                createArea.isPending ||
                                updateArea.isPending
                            }
                        >
                            {(createArea.isPending || updateArea.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {editingArea ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                editingArea ? "Update" : "Create"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Area Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will delete the area "{deletingArea?.name}" and all its tables.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteArea.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Area'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

interface AreaTableProps {
    areas: AreaDTO[];
    onEdit: (area: AreaDTO) => void;
    onDelete: (area: AreaDTO) => void;
    onToggleStatus: (area: AreaDTO) => void;
    onViewTables: (areaId: string) => void;
}

const AreaGrid = ({ areas, onEdit, onDelete, onToggleStatus, onViewTables }: AreaTableProps) => {
    if (areas.length === 0) {
        return (
            <div className="p-12 text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No areas found. Click "Add Area" to create one.</p>
            </div>
        );
    }

    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {areas.map((area) => (
                <AreaCard
                    key={area.areaId}
                    area={area}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onViewTables={onViewTables}
                />
            ))}
        </div>
    );
};

interface AreaCardProps {
    area: AreaDTO;
    onEdit: (area: AreaDTO) => void;
    onDelete: (area: AreaDTO) => void;
    onToggleStatus: (area: AreaDTO) => void;
    onViewTables: (areaId: string) => void;
}

const AreaCard = ({ area, onEdit, onDelete, onToggleStatus, onViewTables }: AreaCardProps) => {
    const { data: tables = [] } = useTablesByArea(area.areaId || '');
    const isActive = area.status === EntityStatus.ACTIVE;

    return (
        <Card
            className={`glass-card border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg ${isActive
                ? 'border-border/60 hover:border-primary/50 hover:shadow-primary/10'
                : 'border-border/30 opacity-60 hover:opacity-80'
                }`}
            onClick={() => onViewTables(area.areaId!)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${isActive ? 'bg-gradient-to-br from-primary/20 to-primary/10' : 'bg-muted'
                            }`}>
                            <MapPin className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{area.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <TableIcon className="w-3 h-3" />
                                {tables.length} tables
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(area);
                            }}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(area);
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(area);
                        }}
                    >
                        {isActive ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5 text-teal mr-1.5" />
                                Active
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
                                Inactive
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs group-hover:bg-primary/10 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewTables(area.areaId!);
                        }}
                    >
                        View Tables
                        <TableIcon className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManagerAreaManagement;