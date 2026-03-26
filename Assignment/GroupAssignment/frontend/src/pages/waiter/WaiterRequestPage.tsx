import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
    usePendingOrderRequests,
    useAcceptOrderRequest,
    useRejectOrderRequest,
} from "@/hooks/queries/useWaiterQueries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Inbox, MapPin, Clock, Check, X } from "lucide-react";
import type { OrderRequestDTO } from "@/types/dto";

const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);

const timeAgo = (iso: string) => {
    const d = new Date(iso).getTime();
    const s = Math.floor((Date.now() - d) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
};

const WaiterRequestPage = () => {
    const branchId = useAuthStore((s) => s.staffInfo?.branchId || "");
    const { data: requests = [], isLoading } = usePendingOrderRequests(branchId);
    const acceptMut = useAcceptOrderRequest();
    const rejectMut = useRejectOrderRequest();
    const [detail, setDetail] = useState<OrderRequestDTO | null>(null);

    const busyId =
        acceptMut.isPending || rejectMut.isPending
            ? acceptMut.variables || rejectMut.variables || null
            : null;

    if (!branchId) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        No branch assigned
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-0 flex-1 space-y-4 p-4 lg:p-6">
            <div>
                <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                    Order requests
                </h1>
                <p className="text-sm text-muted-foreground">
                    Customer orders from QR — accept to add to the table order
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : requests.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Inbox className="mb-3 h-12 w-12 text-muted-foreground/40" />
                        <p className="font-medium text-muted-foreground">No pending requests</p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            When guests order from the menu QR, requests appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {requests.map((req) => (
                        <Card
                            key={req.orderRequestId}
                            className="cursor-pointer border-border/60 transition-shadow hover:shadow-md"
                            onClick={() => setDetail(req)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 text-primary" />
                                            <span className="truncate font-semibold">
                                                {req.areaName} · Table {req.tableName}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {timeAgo(req.createdAt)}
                                            <span>·</span>
                                            <span>{req.items.length} items</span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        Pending
                                    </Badge>
                                </div>
                                <p className="mt-3 text-lg font-bold text-primary">
                                    {formatVND(req.totalPrice)}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            acceptMut.mutate(req.orderRequestId);
                                        }}
                                        disabled={!!busyId}
                                    >
                                        {busyId === req.orderRequestId && acceptMut.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            rejectMut.mutate(req.orderRequestId);
                                        }}
                                        disabled={!!busyId}
                                    >
                                        {busyId === req.orderRequestId && rejectMut.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="h-4 w-4" />
                                        )}
                                        Reject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
                <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
                    {detail && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {detail.areaName} · Table {detail.tableName}
                                </DialogTitle>
                                <DialogDescription>
                                    {timeAgo(detail.createdAt)} · {formatVND(detail.totalPrice)}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                                {detail.items.map((line) => (
                                    <div
                                        key={line.orderRequestItemId}
                                        className="rounded-lg border border-border/60 bg-muted/30 p-3"
                                    >
                                        <div className="flex justify-between gap-2">
                                            <span className="font-medium">{line.menuItemName}</span>
                                            <span className="shrink-0 text-sm font-semibold">
                                                {formatVND(line.totalPrice)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Qty {line.quantity}
                                        </p>
                                        {line.customizations?.length ? (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {line.customizations
                                                    .map((c) =>
                                                        c.quantity > 1
                                                            ? `${c.customizationName} ×${c.quantity}`
                                                            : c.customizationName
                                                    )
                                                    .join(", ")}
                                            </p>
                                        ) : null}
                                        {line.note ? (
                                            <p className="mt-1 text-xs italic text-muted-foreground">
                                                Note: {line.note}
                                            </p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setDetail(null)}>
                                    Close
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        rejectMut.mutate(detail.orderRequestId);
                                        setDetail(null);
                                    }}
                                    disabled={!!busyId}
                                >
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => {
                                        acceptMut.mutate(detail.orderRequestId);
                                        setDetail(null);
                                    }}
                                    disabled={!!busyId}
                                >
                                    Accept
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WaiterRequestPage;
