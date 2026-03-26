import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
    CheckCircle, XCircle, Users, Armchair, Loader2,
    CreditCard, DollarSign, Minus, Plus, Trash2, Receipt, X, Printer, Search,
    UtensilsCrossed, Settings2, ChevronLeft, Calendar, QrCode,
} from "lucide-react";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { useTablesByBranch } from "@/hooks/queries/useTableQueries";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import {
    useActiveOrderByTable, useUpdateOrderItem, useRemoveOrderItem,
    useConfirmPayment, useWaiterSetTableStatus, useCancelOrder,
} from "@/hooks/queries/useWaiterQueries";
import { useReservationsByTable } from "@/hooks/queries/useReservationQueries";
import type { AreaTableDTO, OrderDTO, BillDTO } from "@/types/dto";
import { TableStatus, EntityStatus, PaymentMethod, ReservationStatus } from "@/types/dto";
import InvoiceView from "@/components/waiter/InvoiceView";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import TableQrCodeDialog from "@/components/table/TableQrCodeDialog";
import { getTableUrlWithSlug } from "@/utils/tableUrl";
import { useRestaurantSlugByBranch } from "@/hooks/queries/useBranchQueries";

const formatVND = (value: number): string =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

const WaiterTableView = () => {
    const navigate = useNavigate();
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId;
    const cart = useCartStore();

    const { data: allAreas = [] } = useAreasByBranch(branchId || '');
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);
    const { data: allTables = [], isLoading } = useTablesByBranch(branchId || '', {
        // Ensure dashboard reflects QR customer orders in near real-time
        refetchInterval: 3000,
        refetchOnWindowFocus: true,
    });

    const [selectedTable, setSelectedTable] = useState<AreaTableDTO | null>(null);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [orderPanelOpen, setOrderPanelOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [promotionCode, setPromotionCode] = useState("");
    const [paymentNote, setPaymentNote] = useState("");
    const [showInvoice, setShowInvoice] = useState(false);
    const [lastBill, setLastBill] = useState<BillDTO | null>(null);
    const [lastOrder, setLastOrder] = useState<OrderDTO | null>(null);
    const [autoPrint, setAutoPrint] = useState(true);

    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [viewingQr, setViewingQr] = useState<AreaTableDTO | null>(null);

    const [searchQ, setSearchQ] = useState("");
    const [filterArea, setFilterArea] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const { data: restaurantSlug } = useRestaurantSlugByBranch(branchId || '');

    const confirmPaymentMutation = useConfirmPayment();
    const updateOrderItemMutation = useUpdateOrderItem();
    const removeOrderItemMutation = useRemoveOrderItem();
    const setTableStatusMutation = useWaiterSetTableStatus();
    const cancelOrderMutation = useCancelOrder();

    const invoiceRef = useRef<HTMLDivElement>(null);
    const [pendingAutoPrint, setPendingAutoPrint] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
        documentTitle: `Invoice-${lastBill?.billId?.slice(0, 8) || 'receipt'}`,
    });

    useEffect(() => {
        if (pendingAutoPrint && showInvoice && lastBill && invoiceRef.current) {
            const timer = setTimeout(() => {
                handlePrint();
                setPendingAutoPrint(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [pendingAutoPrint, showInvoice, lastBill, handlePrint]);

    const filtered = useMemo(() => {
        let tables = allTables;
        if (filterArea !== "all") {
            tables = tables.filter(t => t.areaId === filterArea);
        }
        if (filterStatus !== "all") {
            tables = tables.filter(t => t.status === filterStatus);
        }
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            tables = tables.filter(t =>
                t.tag.toLowerCase().includes(q) ||
                (t.areaName && t.areaName.toLowerCase().includes(q))
            );
        }
        return tables;
    }, [allTables, filterArea, filterStatus, searchQ]);

    const tablesByArea = useMemo(() => {
        if (filterArea !== "all") {
            const area = activeAreas.find(a => a.areaId === filterArea);
            if (!area) return [];
            return [{ area, tables: filtered.filter(t => t.areaId === area.areaId) }];
        }
        return activeAreas.map(area => ({
            area,
            tables: filtered.filter(t => t.areaId === area.areaId),
        })).filter(g => g.tables.length > 0);
    }, [activeAreas, filtered, filterArea]);

    const totalTables = allTables.length;
    const freeTables = allTables.filter(t => t.status === TableStatus.FREE).length;
    const occupiedTables = allTables.filter(t => t.status === TableStatus.OCCUPIED).length;

    const handleTableClick = (table: AreaTableDTO) => {
        setSelectedTable(table);
        // Always open table dialog - let the dialog determine what to show based on activeOrder
        setTableDialogOpen(true);
        // Pre-open order panel if table appears occupied (will be confirmed by activeOrder query)
        if (table.status === TableStatus.OCCUPIED) {
            setOrderPanelOpen(true);
        }
    };

    const handleConfirmPayment = async (activeOrder: OrderDTO) => {
        if (!selectedTable || !branchId) return;

        try {
            const bill = await confirmPaymentMutation.mutateAsync({
                orderId: activeOrder.orderId,
                branchId,
                paymentMethod,
                note: paymentNote,
                promotionCode,
            });
            setLastBill(bill);
            setLastOrder(bill.order || activeOrder);
            setTableDialogOpen(false);
            setOrderPanelOpen(false);
            setPaymentMethod(PaymentMethod.CASH);
            setPromotionCode("");
            setPaymentNote("");
            setShowInvoice(true);
            if (autoPrint) {
                setPendingAutoPrint(true);
            }
        } catch { /* handled by mutation */ }
    };

    const handleStatusChange = async (status: TableStatus) => {
        if (!selectedTable?.areaTableId) return;
        try {
            await setTableStatusMutation.mutateAsync({ id: selectedTable.areaTableId, status });
            setTableDialogOpen(false);
            setOrderPanelOpen(false);
            setSelectedTable(null);
        } catch { /* handled by mutation */ }
    };

    const handleOrderCancelled = () => {
        setTableDialogOpen(false);
        setOrderPanelOpen(false);
        setSelectedTable(null);
    };

    const handleGoToOrder = (table: AreaTableDTO) => {
        if (!table.areaTableId) return;
        cart.setSelectedTable(table.areaTableId, table.tag);
        setSelectedTable(null);
        navigate("/waiter/orders");
    };

    const openQrCode = (table: AreaTableDTO) => {
        setViewingQr(table);
        setQrDialogOpen(true);
    };

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
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display">Tables Overview</h1>
                    <p className="text-sm text-muted-foreground">Manage tables and process payments</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Tables</p>
                                <p className="text-2xl font-bold">{totalTables}</p>
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
                                <p className="text-2xl font-bold text-teal">{freeTables}</p>
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
                                <p className="text-2xl font-bold text-orange-500">{occupiedTables}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by table name..."
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterArea} onValueChange={setFilterArea}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        {activeAreas.map(a => (
                            <SelectItem key={a.areaId} value={a.areaId!}>{a.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={TableStatus.FREE}>Available</SelectItem>
                        <SelectItem value={TableStatus.OCCUPIED}>Occupied</SelectItem>
                        <SelectItem value={TableStatus.INACTIVE}>Out of Order</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tables Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : tablesByArea.length === 0 ? (
                <Card className="glass-card border-border/60">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Armchair className="w-12 h-12 text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground font-medium">No tables found</p>
                        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {tablesByArea.map(({ area, tables }) => (
                        <div key={area.areaId}>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-lg font-semibold">{area.name}</h2>
                                <Badge variant="secondary" className="text-xs">
                                    {tables.length} tables
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {tables.map((table) => (
                                    <TableCard
                                        key={table.areaTableId}
                                        table={table}
                                        onClick={() => handleTableClick(table)}
                                        onViewQr={() => openQrCode(table)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table Detail Dialog */}
            {selectedTable && (
                <TableDetailDialog
                    open={tableDialogOpen}
                    onOpenChange={(open) => {
                        setTableDialogOpen(open);
                        if (!open) {
                            setOrderPanelOpen(false);
                            setSelectedTable(null);
                        }
                    }}
                    table={selectedTable}
                    orderPanelOpen={orderPanelOpen}
                    setOrderPanelOpen={setOrderPanelOpen}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    promotionCode={promotionCode}
                    setPromotionCode={setPromotionCode}
                    paymentNote={paymentNote}
                    setPaymentNote={setPaymentNote}
                    autoPrint={autoPrint}
                    setAutoPrint={setAutoPrint}
                    onConfirmPayment={handleConfirmPayment}
                    isConfirming={confirmPaymentMutation.isPending}
                    updateOrderItem={updateOrderItemMutation}
                    removeOrderItem={removeOrderItemMutation}
                    onStatusChange={handleStatusChange}
                    isStatusChanging={setTableStatusMutation.isPending}
                    cancelOrderMutation={cancelOrderMutation}
                    onOrderCancelled={handleOrderCancelled}
                    onGoToOrder={() => handleGoToOrder(selectedTable)}
                />
            )}

            {/* Invoice Dialog */}
            {showInvoice && lastBill && lastOrder && (
                <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Invoice</DialogTitle>
                            <DialogDescription>Payment receipt</DialogDescription>
                        </DialogHeader>
                        <div ref={invoiceRef}>
                            <InvoiceView bill={lastBill} order={lastOrder} />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowInvoice(false)}>
                                Close
                            </Button>
                            <Button onClick={() => handlePrint()}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

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

interface TableCardProps {
    table: AreaTableDTO;
    onClick: () => void;
    onViewQr: () => void;
}

const TableCard = ({ table, onClick, onViewQr }: TableCardProps) => {
    const { data: reservations = [] } = useReservationsByTable(table.areaTableId || '');
    const [reservationDialogOpen, setReservationDialogOpen] = useState(false);

    // Find all active reservations (APPROVED or CONFIRMED status)
    const activeReservations = reservations.filter(
        r => r.status === ReservationStatus.APPROVED || r.status === ReservationStatus.CONFIRMED
    );

    const getStyles = () => {
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
                    card: 'bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20',
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

    const styles = getStyles();
    const statusText = table.status === TableStatus.FREE ? 'Available'
        : table.status === TableStatus.OCCUPIED ? 'Occupied'
        : table.status === TableStatus.INACTIVE ? 'Out of Order' : 'Unknown';

    return (
        <>
            <Card
                className={`${styles.card} transition-all duration-300 border-2 cursor-pointer hover:shadow-lg hover:scale-[1.02] relative`}
                onClick={onClick}
            >
                <CardContent className="p-4">
                    <div className="flex flex-col items-center gap-2">
                        {/* QR Button - Top Right Corner */}
                        <div className="absolute top-2 right-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewQr();
                                }}
                                title="View QR Code"
                            >
                                <QrCode className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <div className={`w-16 h-16 rounded-2xl ${styles.icon} flex items-center justify-center`}>
                            <Armchair className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-lg">{table.tag}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{table.capacity} seats</span>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${styles.badge} border-0`}>
                            {statusText}
                        </Badge>

                        {/* Reservation Badge */}
                        {activeReservations.length > 0 && (
                            <Badge
                                variant="outline"
                                className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20 cursor-pointer hover:bg-blue-500/20 mt-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setReservationDialogOpen(true);
                                }}
                            >
                                <Calendar className="w-3 h-3 mr-1" />
                                {activeReservations.length} Reserved
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reservation Detail Dialog */}
            {activeReservations.length > 0 && (
                <Dialog open={reservationDialogOpen} onOpenChange={setReservationDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Reservations for Table {table.tag}</DialogTitle>
                            <DialogDescription>
                                {table.areaName} - {activeReservations.length} active reservation(s)
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {activeReservations.map((reservation, index) => (
                                <Card key={reservation.reservationId} className="border-border/60">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-semibold">Reservation #{index + 1}</h4>
                                            <Badge variant={reservation.status === ReservationStatus.CONFIRMED ? 'default' : 'secondary'}>
                                                {reservation.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Customer Name</p>
                                                <p className="font-medium">{reservation.customerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                                <p className="font-medium">{reservation.customerPhone}</p>
                                            </div>
                                        </div>

                                        {reservation.customerEmail && (
                                            <div className="mt-3">
                                                <p className="text-xs text-muted-foreground mb-1">Email</p>
                                                <p className="font-medium">{reservation.customerEmail}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                                                <p className="font-medium">{format(new Date(reservation.startTime), 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Guests</p>
                                                <p className="font-medium">{reservation.guestNumber} people</p>
                                            </div>
                                        </div>

                                        {reservation.estimatedDurationMinutes && (
                                            <div className="mt-3">
                                                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                                <p className="font-medium">{reservation.estimatedDurationMinutes} minutes</p>
                                            </div>
                                        )}

                                        {reservation.note && (
                                            <div className="mt-3">
                                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                                <p className="text-sm">{reservation.note}</p>
                                            </div>
                                        )}

                                        {reservation.arrivalTime && (
                                            <div className="mt-3">
                                                <p className="text-xs text-muted-foreground mb-1">Arrival Time</p>
                                                <p className="font-medium">{format(new Date(reservation.arrivalTime), 'MMM dd, yyyy HH:mm')}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setReservationDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

interface TableDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    table: AreaTableDTO;
    orderPanelOpen: boolean;
    setOrderPanelOpen: (open: boolean) => void;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (m: PaymentMethod) => void;
    promotionCode: string;
    setPromotionCode: (code: string) => void;
    paymentNote: string;
    setPaymentNote: (note: string) => void;
    autoPrint: boolean;
    setAutoPrint: (v: boolean) => void;
    onConfirmPayment: (order: OrderDTO) => void;
    isConfirming: boolean;
    updateOrderItem: ReturnType<typeof useUpdateOrderItem>;
    removeOrderItem: ReturnType<typeof useRemoveOrderItem>;
    onStatusChange: (status: TableStatus) => void;
    isStatusChanging: boolean;
    cancelOrderMutation: ReturnType<typeof useCancelOrder>;
    onOrderCancelled: () => void;
    onGoToOrder: () => void;
}

const TableDetailDialog = ({
    open, onOpenChange, table, orderPanelOpen, setOrderPanelOpen,
    paymentMethod, setPaymentMethod, promotionCode, setPromotionCode,
    paymentNote, setPaymentNote, autoPrint, setAutoPrint,
    onConfirmPayment, isConfirming, updateOrderItem, removeOrderItem,
    onStatusChange, isStatusChanging, cancelOrderMutation, onOrderCancelled, onGoToOrder,
}: TableDetailDialogProps) => {
    const { data: activeOrder, isLoading, refetch } = useActiveOrderByTable(table.areaTableId || '');

    // Determine if table is truly occupied based on activeOrder (source of truth)
    const isOccupied = !!activeOrder;
    
    const statusColor = isOccupied ? 'text-orange-500'
        : table.status === TableStatus.INACTIVE ? 'text-destructive'
        : 'text-teal';

    const statusText = isOccupied ? 'Occupied'
        : table.status === TableStatus.INACTIVE ? 'Out of Order'
        : 'Available';

    const allItems = activeOrder?.orderLines?.flatMap(line =>
        line.orderItems.map(item => ({ ...item, orderLineStatus: line.orderLineStatus }))
    ) || [];

    const subtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

    const handleQuantityChange = async (orderItemId: string, newQty: number, note: string | null) => {
        setUpdatingItemId(orderItemId);
        try {
            if (newQty <= 0) {
                await removeOrderItem.mutateAsync(orderItemId);
            } else {
                await updateOrderItem.mutateAsync({
                    orderItemId,
                    request: { quantity: newQty, note: note || '' },
                });
            }
            await refetch();
        } catch { /* handled by mutation onError */ }
        finally { setUpdatingItemId(null); }
    };

    const handleRemoveItem = async (orderItemId: string) => {
        setUpdatingItemId(orderItemId);
        try {
            await removeOrderItem.mutateAsync(orderItemId);
            await refetch();
        } catch { /* handled by mutation onError */ }
        finally { setUpdatingItemId(null); }
    };

    const showOrderSplit = orderPanelOpen && !!activeOrder;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                hideClose={showOrderSplit}
                className={`${orderPanelOpen ? 'max-w-5xl' : 'max-w-md'} max-h-[90vh] p-0 flex flex-col overflow-hidden`}
            >
                <div className="flex flex-1 min-h-0">
                    {/* Left Panel */}
                    <div className={`${orderPanelOpen ? 'w-1/2 border-r' : 'w-full'} p-6 space-y-4 overflow-y-auto`}>
                        <DialogHeader>
                            <div className="flex items-center justify-between gap-2 pr-10 sm:pr-0">
                                <div className="min-w-0 flex-1">
                                    <DialogTitle className="text-xl">Table {table.tag}</DialogTitle>
                                    <DialogDescription>
                                        {table.areaName && `${table.areaName} · `}{table.capacity} seats
                                    </DialogDescription>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    {showOrderSplit && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-sm text-muted-foreground hover:text-foreground"
                                            onClick={() => onOpenChange(false)}
                                            aria-label="Close"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                {/* Compact status change popover */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                                            <Settings2 className="w-3.5 h-3.5" />
                                            <Badge variant="secondary" className={`${statusColor} text-xs px-1.5`}>
                                                {statusText}
                                            </Badge>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2" align="end">
                                        {activeOrder ? (
                                            <div className="space-y-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start gap-2 h-8 text-destructive"
                                                    onClick={async () => {
                                                        if (!activeOrder.orderId || cancelOrderMutation.isPending) return;
                                                        await cancelOrderMutation.mutateAsync(activeOrder.orderId);
                                                        onOrderCancelled();
                                                    }}
                                                    disabled={cancelOrderMutation.isPending}
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Cancel order
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start gap-2 h-8"
                                                    onClick={() => onStatusChange(TableStatus.FREE)}
                                                    disabled={isStatusChanging || table.status === TableStatus.FREE}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5 text-teal" />
                                                    Available
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start gap-2 h-8"
                                                    onClick={() => onStatusChange(TableStatus.INACTIVE)}
                                                    disabled={isStatusChanging || table.status === TableStatus.INACTIVE}
                                                >
                                                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                                                    Out of Order
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Payment Section (only when there's an active order) */}
                        {isOccupied && activeOrder && (
                            <div className="space-y-3 pt-2 border-t">
                                <h4 className="font-semibold text-sm">Payment</h4>
                                <div>
                                    <label className="text-xs text-muted-foreground">Payment Method</label>
                                    <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={PaymentMethod.CASH}>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4" />
                                                    Cash
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={PaymentMethod.CARD}>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    Card
                                                </div>
                                            </SelectItem>
                                            <SelectItem value={PaymentMethod.ONLINE}>
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="w-4 h-4" />
                                                    Online
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground">Promotion Code</label>
                                    <Input
                                        className="mt-1"
                                        placeholder="Enter promotion code"
                                        value={promotionCode}
                                        onChange={(e) => setPromotionCode(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground">Note</label>
                                    <Textarea
                                        className="mt-1"
                                        placeholder="Add a note..."
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <Checkbox checked={autoPrint} onCheckedChange={(v) => setAutoPrint(!!v)} />
                                    <span className="text-sm">Print receipt after payment</span>
                                </label>

                                <div className="pt-2 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-medium">{formatVND(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span>{formatVND(subtotal)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    {!orderPanelOpen && (
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setOrderPanelOpen(true)}
                                        >
                                            <Receipt className="w-4 h-4 mr-2" />
                                            View Order
                                        </Button>
                                    )}
                                    <Button
                                        className="flex-1"
                                        onClick={() => onConfirmPayment(activeOrder)}
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                        )}
                                        Confirm Payment
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        )}

                        {!isLoading && !isOccupied && (
                            <div className="space-y-3 pt-2 border-t">
                                <p className="text-sm text-muted-foreground text-center">No active order for this table</p>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        onGoToOrder();
                                    }}
                                >
                                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                                    Create order for this table
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Order Items */}
                    {orderPanelOpen && activeOrder && (
                        <div className="w-1/2 flex flex-col min-h-0 bg-muted/30">
                            <div className="flex items-center justify-between gap-2 px-6 py-4 border-b shrink-0">
                                <h3 className="font-semibold truncate">Order items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 gap-1.5 text-muted-foreground"
                                    onClick={() => setOrderPanelOpen(false)}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-xs font-medium">Hide list</span>
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {allItems.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No items in this order</p>
                                ) : (
                                    allItems.map((item) => {
                                        const isUpdating = updatingItemId === item.orderItemId;
                                        return (
                                            <Card key={item.orderItemId} className="border-border/60">
                                                <CardContent className="p-3">
                                                    <div className="flex gap-3">
                                                        {item.menuItemImageUrl && (
                                                            <img
                                                                src={item.menuItemImageUrl}
                                                                alt={item.menuItemName}
                                                                className="w-14 h-14 rounded-lg object-cover shrink-0"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className="font-medium text-sm truncate">{item.menuItemName}</h4>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-destructive shrink-0"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleRemoveItem(item.orderItemId);
                                                                    }}
                                                                    disabled={isUpdating}
                                                                >
                                                                    {isUpdating ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                            {item.customizations?.length > 0 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.customizations.map(c => c.customizationName).join(', ')}
                                                                </p>
                                                            )}
                                                            {item.note && (
                                                                <p className="text-xs text-muted-foreground italic">Note: {item.note}</p>
                                                            )}
                                                            <div className="flex items-center justify-between mt-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(item.orderItemId, item.quantity - 1, item.note);
                                                                        }}
                                                                        disabled={isUpdating}
                                                                    >
                                                                        <Minus className="w-3 h-3" />
                                                                    </Button>
                                                                    <span className="w-8 text-center text-sm font-medium">
                                                                        {isUpdating ? (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                                                                        ) : (
                                                                            item.quantity
                                                                        )}
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            handleQuantityChange(item.orderItemId, item.quantity + 1, item.note);
                                                                        }}
                                                                        disabled={isUpdating}
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                                <span className="font-semibold text-sm text-primary">{formatVND(item.totalPrice)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WaiterTableView;
