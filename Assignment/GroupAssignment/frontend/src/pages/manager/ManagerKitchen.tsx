import { useMemo, useEffect, useState, useCallback, memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useBranchContext } from "@/hooks/useBranchContext";
import { managerApi } from "@/api/managerApi";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChefHat, Utensils, Info, Play, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OrderLineDTO } from "@/types/dto";

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
}: {
  line: OrderLineDTO;
  nowMs: number;
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
      </CardFooter>
    </Card>
  );
};

const MemoOrderLineCard = memo(OrderLineCard);
MemoOrderLineCard.displayName = "OrderLineCard";

const ManagerKitchen = () => {
  const queryClient = useQueryClient();
  const { branchId } = useBranchContext();

  const { data: orderLines = [], isLoading } = useQuery({
    queryKey: ["current-order-lines", branchId],
    queryFn: () => managerApi.getCurrentOrderLines(branchId),
    enabled: !!branchId,
    staleTime: 5000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

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
            Kitchen Monitor
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Kitchen display for branch staff.
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

      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="all">All Items ({orderLines.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingLines.length})</TabsTrigger>
          <TabsTrigger value="preparing">Preparing ({preparingLines.length})</TabsTrigger>
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
                />
              ))}
              {preparingLines.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-20 text-muted-foreground">No items currently cooking.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerKitchen;
