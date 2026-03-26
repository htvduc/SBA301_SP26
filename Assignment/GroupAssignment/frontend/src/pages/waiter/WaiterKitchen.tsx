import { useMemo, useEffect, useState, useCallback, memo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useBranchContext } from "@/hooks/useBranchContext";
import { waiterOrderApi } from "@/api/waiterOrderApi";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChefHat, Utensils, Info, Play, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OrderLineDTO } from "@/types/dto";
import { OrderLineStatus } from "@/types/dto";

function normalizeEpochMs(createdAt?: string) {
  if (!createdAt) return NaN;
  let start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return NaN;
  // Detect seconds timestamp (Unix epoch) vs ms
  if (start < 10000000000) start *= 1000;
  return start;
}

function formatElapsed(nowMs: number, startMs: number) {
  if (!Number.isFinite(startMs)) return "--:--";
  const diff = Math.max(0, nowMs - startMs);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (hours > 0) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const OrderLineCard = ({
  line,
  nowMs,
  onUpdateStatus,
  isUpdating,
}: {
  line: OrderLineDTO;
  nowMs: number;
  onUpdateStatus: (orderLineId: string, status: OrderLineStatus) => void;
  isUpdating: boolean;
}) => {
  const startMs = useMemo(() => normalizeEpochMs(line.createdAt), [line.createdAt]);
  const elapsed = useMemo(() => formatElapsed(nowMs, startMs), [nowMs, startMs]);

  const isLate = useMemo(() => {
    if (elapsed === "--:--") return false;
    const [first] = elapsed.split(":");
    const mins = Number.parseInt(first, 10);
    return Number.isFinite(mins) && mins > 10;
  }, [elapsed]);

  return (
    <Card
      className={`overflow-hidden border-l-4 ${line.orderLineStatus === "PENDING" ? "border-l-amber-500" : "border-l-blue-500"} shadow-md hover:shadow-lg transition-shadow flex flex-col`}
    >
      <CardHeader className="bg-muted/30 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Table: {line.tableName || "N/A"}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              Line: #{line.orderLineId.substring(0, 6)} | Order: #{line.orderId.substring(0, 8)}
            </div>
          </div>
          <Badge
            variant={line.orderLineStatus === "PENDING" ? "secondary" : "default"}
            className={line.orderLineStatus === "PENDING" ? "animate-pulse" : ""}
          >
            {line.orderLineStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-1">
        {line.orderItems?.map((item) => (
          <div key={item.orderItemId} className="border-b last:border-0 pb-2 last:pb-0">
            <div className="flex justify-between font-bold text-base">
              <span>{item.menuItemName}</span>
              <span className="bg-primary/10 text-primary px-2 rounded-full">x{item.quantity}</span>
            </div>
            {item.note && (
              <div className="mt-1 flex items-start gap-1 p-1 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm italic font-medium">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{item.note}</span>
              </div>
            )}
            {item.customizations && item.customizations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {item.customizations.map((c) => (
                  <Badge key={c.orderItemCustomizationId} variant="outline" className="text-[10px] font-normal py-0">
                    {c.customizationName} {c.quantity > 1 ? `x${c.quantity}` : ""}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter className="bg-muted/10 p-3 flex flex-col gap-3 border-t">
        <div className="flex justify-between items-center w-full text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Clock className="h-4 w-4" />
            <span className={isLate ? "text-destructive font-bold" : ""}>{elapsed}</span>
          </div>
          <div className="text-xs font-semibold text-primary">
            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(line.totalPrice)}
          </div>
        </div>

        <div className="w-full">
          {line.orderLineStatus === "PENDING" ? (
            <button
              onClick={() => onUpdateStatus(line.orderLineId, OrderLineStatus.PREPARING)}
              disabled={isUpdating}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              PREPARING
            </button>
          ) : line.orderLineStatus === "PREPARING" ? (
            <button
              onClick={() => onUpdateStatus(line.orderLineId, OrderLineStatus.COMPLETED)}
              disabled={isUpdating}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              finish
            </button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
};

const MemoOrderLineCard = memo(OrderLineCard);
MemoOrderLineCard.displayName = "OrderLineCard";

const WaiterKitchen = () => {
  const queryClient = useQueryClient();
  const { branchId } = useBranchContext();
  const kitchenCompletedQueryKey = ["waiter", "kitchen", "completed", branchId] as const;

  const { data: orderLines = [], isLoading } = useQuery({
    queryKey: ["current-order-lines", branchId],
    queryFn: () => waiterOrderApi.getCurrentOrderLines(branchId),
    enabled: !!branchId,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  // Kitchen completed orders live in client cache; no backend refetch.
  const { data: completedOrderLines = [] } = useQuery({
    queryKey: kitchenCompletedQueryKey,
    queryFn: () =>
      queryClient.getQueryData<OrderLineDTO[]>(kitchenCompletedQueryKey) ?? [],
    enabled: !!branchId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialData: [],
  });

  const completedOrders = useMemo(() => {
    const byOrderId = new Map<string, OrderLineDTO[]>();
    completedOrderLines.forEach((l) => {
      const key = l.orderId || "unknown";
      if (!byOrderId.has(key)) byOrderId.set(key, []);
      byOrderId.get(key)!.push(l);
    });

    return Array.from(byOrderId.entries())
      .map(([orderId, lines]) => {
        const table = lines[0]?.tableName || "N/A";
        const itemQty = lines.reduce((sum, line) => {
          const qty = (line.orderItems || []).reduce((s, item) => s + (item.quantity || 0), 0);
          return sum + qty;
        }, 0);
        return { orderId, table, itemQty, lines };
      })
      .sort((a, b) => b.lines[0]?.createdAt?.localeCompare(a.lines[0]?.createdAt || "") || 0);
  }, [completedOrderLines]);

  const handleDeleteCompletedOrder = useCallback(
    (orderId: string) => {
      queryClient.setQueryData<OrderLineDTO[]>(kitchenCompletedQueryKey, (prev = []) =>
        prev.filter((l) => l.orderId !== orderId)
      );
      toast.success("Deleted completed order(s) from kitchen", {
        description: `Order ${orderId.substring(0, 8)} removed from kitchen list.`,
      });
    },
    [kitchenCompletedQueryKey, queryClient]
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderLineId, status }: { orderLineId: string; status: OrderLineStatus }) =>
      waiterOrderApi.updateOrderLineStatus(orderLineId, status),
    onMutate: async ({ orderLineId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["current-order-lines", branchId] });
      const previous = queryClient.getQueryData<OrderLineDTO[]>(["current-order-lines", branchId]) || [];
      const targetLine = previous.find((l) => l.orderLineId === orderLineId);

      queryClient.setQueryData<OrderLineDTO[]>(["current-order-lines", branchId], (old = []) =>
        status === OrderLineStatus.COMPLETED
          ? old.filter((line) => line.orderLineId !== orderLineId)
          : old.map((line) =>
              line.orderLineId === orderLineId
                ? {
                    ...line,
                    orderLineStatus: status,
                  }
                : line
            )
      );

      return { previous, targetLine };
    },
    onSuccess: (_data, variables, context) => {
      if (variables.status === OrderLineStatus.COMPLETED) {
        const completedLineFromMutation = (context as { targetLine?: OrderLineDTO } | undefined)?.targetLine;

        if (completedLineFromMutation) {
          const normalizedCompletedLine: OrderLineDTO = {
            ...completedLineFromMutation,
            orderLineStatus: OrderLineStatus.COMPLETED,
          };

          queryClient.setQueryData<OrderLineDTO[]>(kitchenCompletedQueryKey, (prev = []) => {
            const without = prev.filter((l) => l.orderLineId !== normalizedCompletedLine.orderLineId);
            return [...without, normalizedCompletedLine];
          });
        }

        const completed = queryClient.getQueryData<OrderLineDTO[]>(kitchenCompletedQueryKey) || [];
        const byOrderId = new Map<string, OrderLineDTO[]>();
        completed.forEach((l) => {
          const key = l.orderId || "unknown";
          if (!byOrderId.has(key)) byOrderId.set(key, []);
          byOrderId.get(key)!.push(l);
        });

        const summaryLines = Array.from(byOrderId.entries())
          .slice(0, 10)
          .map(([orderId, lines]) => {
            const table = lines[0]?.tableName || "N/A";
            const itemQty = lines.reduce((sum, line) => {
              const qty = (line.orderItems || []).reduce((s, item) => s + (item.quantity || 0), 0);
              return sum + qty;
            }, 0);
            return `- Order ${orderId.substring(0, 8)} (Table ${table}): ${itemQty} items`;
          });

        toast.success("Orders completed in kitchen", {
          description:
            summaryLines.length > 0
              ? `Completed orders:\n${summaryLines.join("\n")}`
              : "Completed order(s) has been updated successfully.",
        });
      } else {
        toast.success("Status updated successfully");
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData<OrderLineDTO[]>(["current-order-lines", branchId], context.previous);
      }
      toast.error("Failed to update status", {
        description: error.response?.data?.message || "An error occurred",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["current-order-lines", branchId] });
    },
  });

  const handleUpdateStatusStable = useCallback(
    (orderLineId: string, status: OrderLineStatus) => {
      updateStatusMutation.mutate({ orderLineId, status });
    },
    [updateStatusMutation]
  );

  const pendingLines = useMemo(() => orderLines.filter((line) => line.orderLineStatus === "PENDING"), [orderLines]);
  const preparingLines = useMemo(() => orderLines.filter((line) => line.orderLineStatus === "PREPARING"), [orderLines]);

  // One shared timer tick for all cards (prevents N intervals + lag)
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (!orderLines.length) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [orderLines.length]);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-500" />
            Kitchen Display
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Manage cooking statuses.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm border border-amber-200 dark:border-amber-900/50">
            <span className="text-2xl">{pendingLines.length}</span>
            <span className="text-xs uppercase leading-tight">Pending<br />Items</span>
          </div>
          <div className="bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm border border-blue-200 dark:border-blue-900/50">
            <span className="text-2xl">{preparingLines.length}</span>
            <span className="text-xs uppercase leading-tight">Cooking<br />Now</span>
          </div>
        </div>
      </div>

      {completedOrders.length > 0 && (
        <Card className="border-border/60 bg-muted/10">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Completed Orders ({completedOrders.length})</CardTitle>
              </div>
              <div className="text-xs text-muted-foreground">
                Click “finish” để move items vào danh sách này
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-4">
              {completedOrders.slice(0, 10).map((o) => (
                <div key={o.orderId} className="space-y-3">
                  <div className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        Order #{o.orderId.substring(0, 8)} · Table {o.table}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.itemQty} items completed
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCompletedOrder(o.orderId)}
                      className="text-xs font-semibold px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors whitespace-nowrap"
                      title="Delete completed order from kitchen"
                    >
                      x
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {o.lines.map((line) => (
                      <MemoOrderLineCard
                        key={line.orderLineId}
                        line={line}
                        nowMs={nowMs}
                        onUpdateStatus={handleUpdateStatusStable}
                        isUpdating={updateStatusMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {completedOrders.length > 10 && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Showing latest 10 completed orders
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-4 md:w-[520px]">
          <TabsTrigger value="all">All Items ({orderLines.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingLines.length})</TabsTrigger>
          <TabsTrigger value="preparing">Preparing ({preparingLines.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-16 bg-muted"></div>
                    <CardContent className="h-40"></CardContent>
                  </Card>
                ))
              ) : orderLines.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/10 dark:bg-muted/5 rounded-xl border border-dashed border-border">
                  <ChefHat className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-xl font-medium text-muted-foreground">Kitchen is currently empty</p>
                </div>
              ) : (
                orderLines.map((line) => (
                  <MemoOrderLineCard
                    key={line.orderLineId}
                    line={line}
                    nowMs={nowMs}
                    onUpdateStatus={handleUpdateStatusStable}
                    isUpdating={updateStatusMutation.isPending}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="pending" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {pendingLines.map((line) => (
                <MemoOrderLineCard
                  key={line.orderLineId}
                  line={line}
                  nowMs={nowMs}
                  onUpdateStatus={handleUpdateStatusStable}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))}
              {pendingLines.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-20 text-muted-foreground">No pending items.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preparing" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
              {preparingLines.map((line) => (
                <MemoOrderLineCard
                  key={line.orderLineId}
                  line={line}
                  nowMs={nowMs}
                  onUpdateStatus={handleUpdateStatusStable}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))}
              {preparingLines.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-20 text-muted-foreground">No items currently cooking.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="flex-1 overflow-hidden mt-4">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-6">
              {completedOrders.length === 0 && !isLoading && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/10 dark:bg-muted/5 rounded-xl border border-dashed border-border">
                  <ChefHat className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-xl font-medium text-muted-foreground">No completed orders in kitchen</p>
                </div>
              )}

              {completedOrders.map((o) => (
                <div
                  key={o.orderId}
                  className="rounded-xl border border-border/60 bg-background/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <div className="font-semibold truncate">
                        Order #{o.orderId.substring(0, 8)} · Table {o.table}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.itemQty} items completed
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCompletedOrder(o.orderId)}
                      className="text-xs font-semibold px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      title="Delete completed order from kitchen"
                    >
                      delete
                    </button>
                  </div>

                  <div className="space-y-4">
                    {o.lines.map((line) => (
                      <MemoOrderLineCard
                        key={line.orderLineId}
                        line={line}
                        nowMs={nowMs}
                        onUpdateStatus={handleUpdateStatusStable}
                        isUpdating={updateStatusMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaiterKitchen;
