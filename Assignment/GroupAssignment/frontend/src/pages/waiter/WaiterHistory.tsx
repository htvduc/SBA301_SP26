import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search, Loader2, Receipt, Clock, DollarSign,
    CheckCircle, XCircle, Armchair, CreditCard, ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useOrderHistorySummaries, useBillByOrder } from "@/hooks/queries/useWaiterQueries";
import { useTablesByBranch } from "@/hooks/queries/useTableQueries";
import type { OrderHistorySummaryDTO } from "@/types/dto";
import { OrderStatus, EntityStatus } from "@/types/dto";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { waiterOrderApi } from "@/api/waiterOrderApi";

const formatVND = (value: number): string =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

const WaiterHistory = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId || "";

    const { data: summaries = [], isLoading } = useOrderHistorySummaries(branchId);
    const { data: allTables = [] } = useTablesByBranch(branchId);
    const { data: allAreas = [] } = useAreasByBranch(branchId);
    const activeAreas = allAreas.filter((a) => a.status === EntityStatus.ACTIVE);

    const [searchQ, setSearchQ] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTable, setFilterTable] = useState("all");
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const filteredRows = useMemo(() => {
        let rows = [...summaries];

        if (filterStatus !== "all") {
            rows = rows.filter((o) => o.status === filterStatus);
        }
        if (filterTable !== "all") {
            rows = rows.filter((o) => o.areaTableId === filterTable);
        }
        if (searchQ.trim()) {
            const q = searchQ.toLowerCase();
            rows = rows.filter(
                (o) =>
                    o.tableName.toLowerCase().includes(q) ||
                    o.orderId.toLowerCase().includes(q) ||
                    o.areaName.toLowerCase().includes(q)
            );
        }

        return rows.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }, [summaries, filterStatus, filterTable, searchQ]);

    const stats = useMemo(() => {
        const completed = summaries.filter((o) => o.status === OrderStatus.COMPLETED);
        const cancelled = summaries.filter((o) => o.status === OrderStatus.CANCELLED);
        const totalRevenue = completed.reduce(
            (sum, o) => sum + Number(o.paidAmount ?? o.totalPrice),
            0
        );
        return { completed: completed.length, cancelled: cancelled.length, totalRevenue };
    }, [summaries]);

    const tableStats = useMemo(() => {
        const map = new Map<string, { tableName: string; count: number; revenue: number }>();
        summaries
            .filter((o) => o.status === OrderStatus.COMPLETED)
            .forEach((o) => {
                const existing = map.get(o.areaTableId);
                if (existing) {
                    existing.count++;
                    existing.revenue += Number(o.paidAmount ?? o.totalPrice);
                } else {
                    map.set(o.areaTableId, {
                        tableName: o.tableName,
                        count: 1,
                        revenue: Number(o.paidAmount ?? o.totalPrice),
                    });
                }
            });
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    }, [summaries]);

    const tableOptions = useMemo(
        () =>
            activeAreas.flatMap((area) =>
                allTables
                    .filter((t) => t.areaId === area.areaId)
                    .map((t) => ({ ...t, fullName: `${area.name} - ${t.tag}` }))
            ),
        [activeAreas, allTables]
    );

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
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
        <div className="space-y-6 p-6 lg:p-8">
            <div>
                <h1 className="font-display text-2xl">Order History</h1>
                <p className="text-sm text-muted-foreground">Past orders & bills</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-teal">{stats.completed}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                                <CheckCircle className="h-6 w-6 text-teal" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Cancelled</p>
                                <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <XCircle className="h-6 w-6 text-destructive" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground">Total revenue</p>
                                <p className="text-xl font-bold text-primary sm:text-2xl">
                                    {formatVND(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {tableStats.length > 0 && (
                <Card className="glass-card border-border/60">
                    <CardContent className="p-4">
                        <h3 className="mb-3 text-sm font-semibold">By table</h3>
                        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                            {tableStats.slice(0, 10).map((ts) => (
                                <div
                                    key={ts.tableName}
                                    className="flex min-w-[88px] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-lg bg-muted/50 px-3 py-2 transition-colors hover:bg-muted"
                                    onClick={() => {
                                        const t = allTables.find((x) => x.tag === ts.tableName);
                                        if (t?.areaTableId) setFilterTable(t.areaTableId);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            const t = allTables.find((x) => x.tag === ts.tableName);
                                            if (t?.areaTableId) setFilterTable(t.areaTableId);
                                        }
                                    }}
                                >
                                    <Armchair className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-xs font-semibold">{ts.tableName}</span>
                                    <span className="text-[11px] text-muted-foreground">
                                        {ts.count} orders
                                    </span>
                                    <span className="text-[11px] font-medium text-teal">
                                        {formatVND(ts.revenue)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-wrap gap-3">
                <div className="relative min-w-[180px] max-w-xs flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Table, order ID, area…"
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterTable} onValueChange={setFilterTable}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All tables" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All tables</SelectItem>
                        {tableOptions.map((t) => (
                            <SelectItem key={t.areaTableId} value={t.areaTableId!}>
                                {t.fullName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        <SelectItem value={OrderStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                {(filterTable !== "all" || filterStatus !== "all" || searchQ) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setFilterTable("all");
                            setFilterStatus("all");
                            setSearchQ("");
                        }}
                    >
                        Clear filters
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredRows.length === 0 ? (
                <Card className="glass-card border-border/60">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Receipt className="mb-3 h-12 w-12 text-muted-foreground/40" />
                        <p className="font-medium text-muted-foreground">No orders</p>
                        <p className="text-xs text-muted-foreground">Try other filters</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filteredRows.map((row) => (
                        <OrderRow
                            key={row.orderId}
                            row={row}
                            onClick={() => setSelectedOrderId(row.orderId)}
                            formatDate={formatDate}
                            formatTime={formatTime}
                        />
                    ))}
                </div>
            )}

            {selectedOrderId && (
                <OrderDetailDialog
                    orderId={selectedOrderId}
                    open={!!selectedOrderId}
                    onOpenChange={(open) => {
                        if (!open) setSelectedOrderId(null);
                    }}
                    formatDate={formatDate}
                    formatTime={formatTime}
                />
            )}
        </div>
    );
};

const OrderRow = ({
    row,
    onClick,
    formatDate,
    formatTime,
}: {
    row: OrderHistorySummaryDTO;
    onClick: () => void;
    formatDate: (s: string) => string;
    formatTime: (s: string) => string;
}) => {
    const isCompleted = row.status === OrderStatus.COMPLETED;

    return (
        <Card
            className="glass-card cursor-pointer border-border/60 transition-all hover:border-primary/20 hover:shadow-md"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isCompleted ? "bg-teal/10" : "bg-destructive/10"
                        }`}
                    >
                        {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-teal" />
                        ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">{row.tableName}</span>
                            <Badge
                                variant="secondary"
                                className={`text-[10px] ${
                                    isCompleted
                                        ? "bg-teal/10 text-teal"
                                        : "bg-destructive/10 text-destructive"
                                }`}
                            >
                                {row.status}
                            </Badge>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(row.updatedAt)} · {formatTime(row.updatedAt)}
                            </span>
                            <span>
                                {row.itemCount} item{row.itemCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="text-sm font-bold">{formatVND(Number(row.paidAmount ?? row.totalPrice))}</p>
                        <p className="text-[10px] text-muted-foreground">
                            #{row.orderId.slice(0, 8)}
                        </p>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );
};

const OrderDetailDialog = ({
    orderId,
    open,
    onOpenChange,
    formatDate,
    formatTime,
}: {
    orderId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formatDate: (s: string) => string;
    formatTime: (s: string) => string;
}) => {
    const {
        data: order,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["waiter", "order", orderId],
        queryFn: () => waiterOrderApi.getOrder(orderId),
        enabled: open && !!orderId,
    });

    const billOrderId =
        open && order?.status === OrderStatus.COMPLETED ? order.orderId : "";
    const { data: bill, isError: billError } = useBillByOrder(billOrderId);

    const allItems = order?.orderLines?.flatMap((line) => line.orderItems) ?? [];
    const isCompleted = order?.status === OrderStatus.COMPLETED;
    const itemDiscountTotal = allItems.reduce((sum, item) => {
        const discounted = item.discountedPrice ?? item.menuItemPrice;
        return sum + Math.max(item.menuItemPrice - discounted, 0) * item.quantity;
    }, 0);
    const grossTotal = allItems.reduce((sum, item) => {
        const discounted = item.discountedPrice ?? item.menuItemPrice;
        const savings = Math.max(item.menuItemPrice - discounted, 0) * item.quantity;
        return sum + item.totalPrice + savings;
    }, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-auto">
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {isError && (
                    <p className="py-8 text-center text-sm text-destructive">Could not load order.</p>
                )}
                {order && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex flex-wrap items-center gap-2">
                                Order #{order.orderId.slice(0, 8)}
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                        isCompleted
                                            ? "bg-teal/10 text-teal"
                                            : "bg-destructive/10 text-destructive"
                                    }`}
                                >
                                    {order.status}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                {order.tableName} · {formatDate(order.createdAt)} ·{" "}
                                {formatTime(order.createdAt)}
                            </DialogDescription>
                        </DialogHeader>

                        {isCompleted && bill && !billError && (
                            <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Payment</span>
                                    <span className="flex items-center gap-1 font-medium">
                                        <CreditCard className="h-3 w-3" />
                                        {bill.paymentMethod}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Paid at</span>
                                    <span className="font-medium">
                                        {formatDate(bill.paidTime)} · {formatTime(bill.paidTime)}
                                    </span>
                                </div>
                                {bill.note && (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Note</span>
                                        <span className="max-w-[200px] truncate text-right font-medium">
                                            {bill.note}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Items ({allItems.length})</h4>
                            <div className="space-y-2">
                                {allItems.map((item) => (
                                    <div
                                        key={item.orderItemId}
                                        className="flex gap-3 rounded-lg bg-muted/30 p-2"
                                    >
                                        {item.menuItemImageUrl && (
                                            <img
                                                src={item.menuItemImageUrl}
                                                alt={item.menuItemName}
                                                className="h-12 w-12 shrink-0 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h5 className="truncate text-sm font-medium">
                                                    {item.menuItemName}
                                                </h5>
                                                <span className="shrink-0 text-sm font-semibold">
                                                    {formatVND(item.totalPrice)}
                                                </span>
                                            </div>
                                            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                <span>Qty {item.quantity}</span>
                                                {item.discountedPrice != null && item.discountedPrice < item.menuItemPrice ? (
                                                    <span>
                                                        @ <span className="line-through">{formatVND(item.menuItemPrice)}</span>{" "}
                                                        <span className="font-semibold text-primary">{formatVND(item.discountedPrice)}</span>
                                                    </span>
                                                ) : (
                                                    <span>@ {formatVND(item.menuItemPrice)}</span>
                                                )}
                                            </div>
                                            {item.customizations?.length ? (
                                                <div className="mt-0.5 text-xs text-muted-foreground">
                                                    {item.customizations.map((c) => (
                                                        <p key={c.orderItemCustomizationId}>
                                                            + {c.customizationName}
                                                            {c.quantity > 1 ? ` x${c.quantity}` : ""} (
                                                            {formatVND(c.totalPrice)})
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : null}
                                            {item.note ? (
                                                <p className="mt-0.5 text-xs italic text-muted-foreground">
                                                    &ldquo;{item.note}&rdquo;
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 border-t pt-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Gross total</span>
                                <span>{formatVND(grossTotal)}</span>
                            </div>
                            {itemDiscountTotal > 0 && (
                                <div className="flex justify-between text-sm text-teal">
                                    <span>Item discounts</span>
                                    <span>-{formatVND(itemDiscountTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatVND(order.totalPrice)}</span>
                            </div>
                            {isCompleted && bill && !billError ? (
                                <>
                                    {bill.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm text-blue-600">
                                            <div className="flex flex-col">
                                                <span>Order discount</span>
                                                <span className="text-[10px] opacity-70">
                                                    {bill.promotionName || bill.promotionCode || "Promotion"}
                                                </span>
                                            </div>
                                            <span>-{formatVND(bill.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base font-bold">
                                        <span>Total paid</span>
                                        <span className="text-teal">{formatVND(bill.finalPrice)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>{formatVND(order.totalPrice)}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WaiterHistory;
