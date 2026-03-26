import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
    Search, ShoppingCart, Plus, Minus, Trash2, Loader2,
    UtensilsCrossed, Star, ChevronRight, StickyNote, Armchair, MapPin,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAreasByBranch } from "@/hooks/queries/useAreaQueries";
import { useTablesByBranch } from "@/hooks/queries/useTableQueries";
import {
    useWaiterMenu,
    useWaiterCategories,
    useCreateOrder,
    useAddItemsToOrder,
    useActiveOrderByTable,
    useUpdateOrderItem,
    useRemoveOrderItem,
} from "@/hooks/queries/useWaiterQueries";
import { useCartStore } from "@/stores/cartStore";
import type { WaiterMenuItemDTO, OrderItemDTO } from "@/types/dto";
import { TableStatus, EntityStatus, CustomizationType } from "@/types/dto";

// Format currency to Vietnamese Dong (consistent with customer menu)
const formatVND = (value: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/** Sentinel for Select when no table is chosen */
const NO_TABLE_VALUE = "__no_table__";
const getEffectivePrice = (price: number, discountedPrice?: number) => discountedPrice ?? price;

const WaiterOrderPage = () => {
    const staffInfo = useAuthStore((state) => state.staffInfo);
    const branchId = staffInfo?.branchId || '';

    const { data: menuItems = [], isLoading: menuLoading } = useWaiterMenu(branchId);
    const { data: categories = [] } = useWaiterCategories(branchId);
    const { data: allAreas = [] } = useAreasByBranch(branchId);
    const { data: allTables = [] } = useTablesByBranch(branchId);
    const activeAreas = allAreas.filter(a => a.status === EntityStatus.ACTIVE);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [bestSellerOnly, setBestSellerOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [customizeItem, setCustomizeItem] = useState<WaiterMenuItemDTO | null>(null);
    const [customizeQty, setCustomizeQty] = useState(1);
    const [customizeNote, setCustomizeNote] = useState("");
    const [selectedAddons, setSelectedAddons] = useState<{[key: string]: number}>({});
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
    const cart = useCartStore();
    const createOrder = useCreateOrder();
    const addItemsToOrder = useAddItemsToOrder();
    const updateOrderItemMutation = useUpdateOrderItem();
    const removeOrderItemMutation = useRemoveOrderItem();
    const { data: activeOrderForSelectedTable } = useActiveOrderByTable(cart.selectedTableId || "");
    const [updatingServerItemId, setUpdatingServerItemId] = useState<string | null>(null);

    /** Chỉ coi là có order trên bàn khi bàn OCCUPIED (tránh cache order cũ sau khi đã thanh toán → FREE). */
    const selectedTableRow = useMemo(
        () =>
            cart.selectedTableId
                ? allTables.find((t) => t.areaTableId === cart.selectedTableId)
                : undefined,
        [allTables, cart.selectedTableId]
    );
    const hasActiveDineInOnTable = selectedTableRow?.status === TableStatus.OCCUPIED;
    const activeOrderOnTable = hasActiveDineInOnTable ? activeOrderForSelectedTable ?? null : null;

    const serverOrderItems = useMemo(
        () => activeOrderOnTable?.orderLines?.flatMap((l) => l.orderItems) ?? [],
        [activeOrderOnTable]
    );

    const serverSubtotal = useMemo(
        () => serverOrderItems.reduce((s, i) => s + Number(i.totalPrice), 0),
        [serverOrderItems]
    );
    const cartTotal = cart.getTotal();
    const grandTotal = serverSubtotal + cartTotal;
    const totalLineCount = serverOrderItems.length + cart.items.length;

    const filteredItems = useMemo(() => {
        let items = menuItems;
        if (selectedCategory !== "all") {
            items = items.filter((item) => item.categoryId === selectedCategory);
        }
        if (bestSellerOnly) {
            items = items.filter((item) => item.isBestSeller);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(
                (item) =>
                    item.name.toLowerCase().includes(q) ||
                    item.description?.toLowerCase().includes(q)
            );
        }
        return items;
    }, [menuItems, selectedCategory, bestSellerOnly, searchQuery]);

    const handleOpenCustomize = (item: WaiterMenuItemDTO) => {
        setCustomizeItem(item);
        setCustomizeQty(1);
        setCustomizeNote("");
        setSelectedAddons({});
        setSelectedVariant(null);
    };

    const handleAddToCart = () => {
        if (!customizeItem) return;

        const custs: Array<{customizationId: string; name: string; price: number; quantity: number}> = [];
        
        // Add addons
        Object.entries(selectedAddons).forEach(([customizationId, quantity]) => {
            if (quantity > 0) {
                const c = customizeItem.customizations.find(x => x.customizationId === customizationId)!;
                custs.push({
                    customizationId,
                    name: c.name,
                    price: c.price,
                    quantity,
                });
            }
        });
        
        // Add variant (quantity always 1)
        if (selectedVariant) {
            const c = customizeItem.customizations.find(x => x.customizationId === selectedVariant)!;
            custs.push({
                customizationId: selectedVariant,
                name: c.name,
                price: c.price,
                quantity: 1,
            });
        }

        const custTotal = custs.reduce((sum, c) => sum + c.price * c.quantity, 0);
        const unitPrice = getEffectivePrice(customizeItem.price, customizeItem.discountedPrice);
        const totalPrice = (unitPrice + custTotal) * customizeQty;

        cart.addItem({
            cartItemId: `${customizeItem.menuItemId}-${Date.now()}`,
            menuItemId: customizeItem.menuItemId,
            name: customizeItem.name,
            price: customizeItem.price,
            discountedPrice: customizeItem.discountedPrice,
            imageUrl: customizeItem.imageUrl,
            quantity: customizeQty,
            note: customizeNote,
            customizations: custs,
            totalPrice,
        });

        setCustomizeItem(null);
    };

    const handlePlaceOrder = async () => {
        if (!cart.selectedTableId || cart.items.length === 0) return;

        const items = cart.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            note: item.note,
            customizations: item.customizations.map((c) => ({
                customizationId: c.customizationId,
                quantity: c.quantity,
            })),
        }));

        try {
            if (activeOrderOnTable?.orderId) {
                await addItemsToOrder.mutateAsync({
                    orderId: activeOrderOnTable.orderId,
                    request: { items },
                });
            } else {
                await createOrder.mutateAsync({
                    areaTableId: cart.selectedTableId,
                    items,
                });
            }
            cart.clearCart();
        } catch {}
    };

    const handleServerItemQtyChange = async (item: OrderItemDTO, delta: number) => {
        const newQty = item.quantity + delta;
        setUpdatingServerItemId(item.orderItemId);
        try {
            if (newQty <= 0) {
                await removeOrderItemMutation.mutateAsync(item.orderItemId);
            } else {
                await updateOrderItemMutation.mutateAsync({
                    orderItemId: item.orderItemId,
                    request: { quantity: newQty, note: item.note ?? "" },
                });
            }
        } finally {
            setUpdatingServerItemId(null);
        }
    };

    const tableOptions = useMemo(() => {
        return activeAreas.flatMap(area =>
            allTables
                .filter(t => t.areaId === area.areaId)
                .map(t => ({ ...t, areaName: area.name }))
        );
    }, [activeAreas, allTables]);

    const selectedTableInfo = useMemo(() => {
        if (!cart.selectedTableId) return null;
        const t = tableOptions.find((x) => x.areaTableId === cart.selectedTableId);
        if (t) {
            return {
                areaName: t.areaName,
                tag: t.tag,
                status: t.status,
            };
        }
        return {
            areaName: null as string | null,
            tag: cart.selectedTableName,
            status: null as TableStatus | null,
        };
    }, [cart.selectedTableId, cart.selectedTableName, tableOptions]);

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
        <div className="flex h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] w-full min-h-0 flex-col overflow-hidden border-t border-border/40 bg-background lg:flex-row">
            {/* Menu + search (always usable while order panel is open) */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:max-w-[calc(100%-420px)]">
                <div className="shrink-0 space-y-3 border-b border-border/60 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-display font-semibold tracking-tight sm:text-2xl">Take order</h1>
                            <p className="text-xs text-muted-foreground sm:text-sm">Tap a dish to add — order updates on the right</p>
                        </div>
                        <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs font-medium">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {totalLineCount} in order
                        </Badge>
                    </div>

                    {/* Table context — always visible */}
                    <div
                        className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 sm:px-4 ${
                            cart.selectedTableId
                                ? "border-primary/30 bg-primary/5"
                                : "border-amber-500/40 bg-amber-500/5"
                        }`}
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/60">
                            <Armchair className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Table for this order
                            </p>
                            {selectedTableInfo ? (
                                <p className="truncate text-sm font-bold sm:text-base">
                                    <MapPin className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                                    {selectedTableInfo.areaName ? `${selectedTableInfo.areaName} · ` : ""}
                                    <span className="text-primary">Table {selectedTableInfo.tag}</span>
                                    {selectedTableInfo.status != null && (
                                        <Badge variant="outline" className="ml-2 align-middle text-[10px]">
                                            {selectedTableInfo.status === TableStatus.FREE
                                                ? "Available"
                                                : selectedTableInfo.status === TableStatus.OCCUPIED
                                                  ? "Occupied"
                                                  : "N/A"}
                                        </Badge>
                                    )}
                                </p>
                            ) : (
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                    Choose a table in the order panel →
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-10"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:pb-0 sm:flex-1">
                        <Button
                            variant={selectedCategory === "all" ? "default" : "outline"}
                            size="sm"
                            className="shrink-0"
                            onClick={() => setSelectedCategory("all")}
                        >
                            All
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.categoryId}
                                variant={selectedCategory === cat.categoryId ? "default" : "outline"}
                                size="sm"
                                className="shrink-0"
                                onClick={() => setSelectedCategory(cat.categoryId)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`shrink-0 gap-1.5 font-medium transition-all ${
                            bestSellerOnly
                                ? "border-yellow-500 bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-500/35 ring-2 ring-yellow-300 hover:bg-yellow-500 hover:text-yellow-950 dark:bg-yellow-400 dark:text-yellow-950 dark:ring-yellow-400"
                                : "border-yellow-500/40 text-yellow-800 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/30"
                        }`}
                        onClick={() => setBestSellerOnly((v) => !v)}
                        title="Show only best sellers (works with category & search)"
                    >
                        <Star
                            className={`h-3.5 w-3.5 ${
                                bestSellerOnly
                                    ? "fill-yellow-700 text-yellow-800"
                                    : "fill-yellow-400 text-yellow-500"
                            }`}
                        />
                        Best sellers
                    </Button>
                </div>
                {bestSellerOnly && (
                    <p className="text-xs text-muted-foreground">
                        {selectedCategory === "all"
                            ? "Showing best sellers in all categories."
                            : `Best sellers in ${categories.find((c) => c.categoryId === selectedCategory)?.name ?? "this category"}.`}
                    </p>
                )}

                <div className="mt-6 border-t border-border/30 pt-5">
                {menuLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                        <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-1">No items found</p>
                        <p className="text-sm text-muted-foreground">Try changing the filter or search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-3">
                        {filteredItems.map(item => (
                            <MenuCard
                                key={item.menuItemId}
                                item={item}
                                onClick={() => handleOpenCustomize(item)}
                            />
                        ))}
                    </div>
                )}
                </div>
                </div>
            </div>

            {/* Current order — fixed column (desktop) / bottom panel (mobile) */}
            <aside className="flex h-[min(42vh,320px)] w-full shrink-0 flex-col border-t border-border/60 bg-muted/25 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.12)] lg:h-full lg:max-h-none lg:w-[420px] lg:border-l lg:border-t-0 lg:shadow-none xl:w-[440px]">
                <div className="shrink-0 border-b border-border/60 bg-muted/40 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <div>
                            <h2 className="text-sm font-semibold leading-tight">Current order</h2>
                            <p className="text-xs text-muted-foreground">
                                {totalLineCount === 0
                                    ? "No items yet"
                                    : `${totalLineCount} line${totalLineCount !== 1 ? "s" : ""} · ${formatVND(grandTotal)}`}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 border-b border-border/60 p-4">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Table
                    </label>
                    <Select
                        value={cart.selectedTableId || NO_TABLE_VALUE}
                        onValueChange={(val) => {
                            if (val === NO_TABLE_VALUE) {
                                cart.setSelectedTable(null, null);
                                return;
                            }
                            const t = tableOptions.find((x) => x.areaTableId === val);
                            cart.setSelectedTable(val, t?.tag || null);
                        }}
                    >
                        <SelectTrigger className="mt-1.5 h-11 bg-background">
                            <SelectValue placeholder="Select table for this order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_TABLE_VALUE} className="text-muted-foreground">
                                <span className="italic">No table selected</span>
                            </SelectItem>
                            {tableOptions.map((t) => (
                                <SelectItem key={t.areaTableId} value={t.areaTableId!}>
                                    <div className="flex items-center gap-2">
                                        <span>
                                            {t.areaName} · Table {t.tag}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {t.status === TableStatus.FREE
                                                ? "Free"
                                                : t.status === TableStatus.OCCUPIED
                                                  ? "Occupied"
                                                  : "N/A"}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                    {totalLineCount === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/50 py-10 text-center text-muted-foreground">
                            <UtensilsCrossed className="mb-2 h-10 w-10 opacity-25" />
                            <p className="text-sm font-medium">No items yet</p>
                            <p className="mt-1 max-w-[220px] text-xs">
                                Select a table, then choose dishes from the menu.
                            </p>
                        </div>
                    ) : (
                        <>
                            {serverOrderItems.map((item) => {
                                const busy = updatingServerItemId === item.orderItemId;
                                return (
                                    <Card key={`srv-${item.orderItemId}`} className="border-border/60 shadow-sm">
                                        <CardContent className="p-3">
                                            <div className="flex gap-3">
                                                {item.menuItemImageUrl && (
                                                    <img
                                                        src={item.menuItemImageUrl}
                                                        alt={item.menuItemName}
                                                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="truncate text-sm font-medium">
                                                            {item.menuItemName}
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0 text-destructive"
                                                            onClick={() =>
                                                                handleServerItemQtyChange(item, -item.quantity)
                                                            }
                                                            disabled={busy}
                                                        >
                                                            {busy ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    {item.customizations?.length ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.customizations
                                                                .map((c) =>
                                                                    c.quantity > 1
                                                                        ? `${c.customizationName} ×${c.quantity}`
                                                                        : c.customizationName
                                                                )
                                                                .join(", ")}
                                                        </p>
                                                    ) : null}
                                                    {item.note ? (
                                                        <p className="mt-0.5 flex items-center gap-1 text-xs italic text-muted-foreground">
                                                            <StickyNote className="h-3 w-3" />
                                                            {item.note}
                                                        </p>
                                                    ) : null}
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() =>
                                                                    handleServerItemQtyChange(item, -1)
                                                                }
                                                                disabled={busy}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center text-sm font-medium">
                                                                {busy ? (
                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                                                                ) : (
                                                                    item.quantity
                                                                )}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() =>
                                                                    handleServerItemQtyChange(item, 1)
                                                                }
                                                                disabled={busy}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <span className="text-sm font-semibold text-primary">
                                                            {formatVND(item.totalPrice)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {cart.items.map((item) => (
                                <Card key={item.cartItemId} className="border-border/60 shadow-sm">
                                    <CardContent className="p-3">
                                        <div className="flex gap-3">
                                            {item.imageUrl && (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="truncate text-sm font-medium">{item.name}</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 shrink-0 text-destructive"
                                                        onClick={() => cart.removeItem(item.cartItemId)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                {item.customizations.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.customizations
                                                            .map((c) =>
                                                                c.quantity > 1
                                                                    ? `${c.name} ×${c.quantity}`
                                                                    : c.name
                                                            )
                                                            .join(", ")}
                                                    </p>
                                                )}
                                                {item.note && (
                                                    <p className="mt-0.5 flex items-center gap-1 text-xs italic text-muted-foreground">
                                                        <StickyNote className="h-3 w-3" />
                                                        {item.note}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                cart.updateQuantity(
                                                                    item.cartItemId,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                cart.updateQuantity(
                                                                    item.cartItemId,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary">
                                                        {formatVND(item.totalPrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </div>

                {totalLineCount > 0 && (
                    <div className="shrink-0 space-y-3 border-t border-border/60 bg-background/95 p-4 backdrop-blur">
                        {serverSubtotal > 0 && cart.items.length > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Already on order</span>
                                <span>{formatVND(serverSubtotal)}</span>
                            </div>
                        )}
                        {cart.items.length > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">New items</span>
                                <span className="font-medium">{formatVND(cartTotal)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-border/40 pt-2 text-base font-bold">
                            <span>Total</span>
                            <span className="text-primary">{formatVND(grandTotal)}</span>
                        </div>
                        {cart.items.length > 0 ? (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handlePlaceOrder}
                                disabled={
                                    !cart.selectedTableId ||
                                    createOrder.isPending ||
                                    addItemsToOrder.isPending
                                }
                            >
                                {createOrder.isPending || addItemsToOrder.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <ChevronRight className="mr-2 h-4 w-4" />
                                )}
                                {activeOrderOnTable?.orderId
                                    ? "Add to order"
                                    : "Place Order"}
                            </Button>
                        ) : (
                            <p className="text-center text-xs text-muted-foreground">
                                Add dishes from the menu to send a new order line, or adjust quantities above.
                            </p>
                        )}
                    </div>
                )}
            </aside>

            {customizeItem && (
                <CustomizeDialog
                    item={customizeItem}
                    quantity={customizeQty}
                    setQuantity={setCustomizeQty}
                    note={customizeNote}
                    setNote={setCustomizeNote}
                    selectedAddons={selectedAddons}
                    setSelectedAddons={setSelectedAddons}
                    selectedVariant={selectedVariant}
                    setSelectedVariant={setSelectedVariant}
                    onAdd={handleAddToCart}
                    onClose={() => setCustomizeItem(null)}
                />
            )}
        </div>
    );
};

interface MenuCardProps {
    item: WaiterMenuItemDTO;
    onClick: () => void;
}

const MenuCard = ({ item, onClick }: MenuCardProps) => (
    <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden ${
            item.isBestSeller
                ? "border-amber-400/50 ring-1 ring-amber-400/20"
                : "border-border/60"
        }`}
        onClick={onClick}
    >
        <div className="relative">
            {item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                />
            ) : (
                <div className="w-full h-40 bg-muted/50 flex items-center justify-center">
                    <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                </div>
            )}
            {item.isBestSeller && (
                <div
                    className="pointer-events-none absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 shadow-md ring-2 ring-white/90"
                    title="Best seller"
                >
                    <Star className="h-5 w-5 fill-yellow-600 text-yellow-700 drop-shadow-sm" />
                </div>
            )}
            <Badge variant="secondary" className="absolute right-2 top-2 max-w-[calc(100%-3.25rem)] truncate text-xs">
                {item.categoryName}
            </Badge>
        </div>
        <CardContent className="p-4">
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
            {item.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
                <div className="flex flex-col">
                    {item.discountedPrice != null && item.discountedPrice < item.price ? (
                        <>
                            <span className="text-lg font-bold text-primary">{formatVND(item.discountedPrice)}</span>
                            <span className="text-xs text-muted-foreground line-through">{formatVND(item.price)}</span>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-primary">{formatVND(item.price)}</span>
                    )}
                </div>
                <Button size="sm" variant="outline" className="h-8">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                </Button>
            </div>
        </CardContent>
    </Card>
);

interface CustomizeDialogProps {
    item: WaiterMenuItemDTO;
    quantity: number;
    setQuantity: (q: number) => void;
    note: string;
    setNote: (n: string) => void;
    selectedAddons: {[key: string]: number};
    setSelectedAddons: (addons: {[key: string]: number}) => void;
    selectedVariant: string | null;
    setSelectedVariant: (id: string | null) => void;
    onAdd: () => void;
    onClose: () => void;
}

const CustomizeDialog = ({
    item, quantity, setQuantity, note, setNote,
    selectedAddons, setSelectedAddons, selectedVariant, setSelectedVariant,
    onAdd, onClose,
}: CustomizeDialogProps) => {
    const addonCustomizations = item.customizations.filter(c => c.customizationType === CustomizationType.ADDON);
    const variantCustomizations = item.customizations.filter(c => c.customizationType === CustomizationType.VARIANT);
    
    const addonTotal = Object.entries(selectedAddons).reduce((sum, [customizationId, qty]) => {
        const c = addonCustomizations.find(x => x.customizationId === customizationId);
        return sum + (c ? c.price * qty : 0);
    }, 0);
    
    const variantTotal = selectedVariant
        ? variantCustomizations.find(x => x.customizationId === selectedVariant)?.price ?? 0
        : 0;
    
    const custTotal = addonTotal + variantTotal;
    const effectiveItemPrice = getEffectivePrice(item.price, item.discountedPrice);
    const totalPrice = (effectiveItemPrice + custTotal) * quantity;
    
    const updateAddonQuantity = (customizationId: string, qty: number) => {
        if (qty <= 0) {
            const newAddons = { ...selectedAddons };
            delete newAddons[customizationId];
            setSelectedAddons(newAddons);
        } else {
            setSelectedAddons({
                ...selectedAddons,
                [customizationId]: qty,
            });
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>Choose customization</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 overflow-y-auto min-h-0 flex-1 pr-2">
                    {item.imageUrl && (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            {item.discountedPrice != null && item.discountedPrice < item.price ? (
                                <>
                                    <span className="text-lg font-bold text-primary">{formatVND(item.discountedPrice)}</span>
                                    <span className="text-xs text-muted-foreground line-through">{formatVND(item.price)}</span>
                                </>
                            ) : (
                                <span className="text-lg font-bold text-primary">{formatVND(item.price)}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center text-lg font-bold">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Variants Section */}
                    {variantCustomizations.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Choose Option</Label>
                            <p className="text-xs text-muted-foreground">
                                Select one option (e.g., size, temperature)
                            </p>
                            <RadioGroup
                                value={selectedVariant ?? ""}
                                onValueChange={(v) => setSelectedVariant(v || null)}
                                className="gap-2"
                            >
                                {variantCustomizations.map((c) => (
                                    <div
                                        key={c.customizationId}
                                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                                    >
                                        <RadioGroupItem
                                            value={c.customizationId}
                                            id={`variant-${c.customizationId}`}
                                        />
                                        <Label
                                            htmlFor={`variant-${c.customizationId}`}
                                            className="min-w-0 flex-1 cursor-pointer font-normal"
                                        >
                                            <span className="text-sm font-medium">{c.name}</span>
                                            {c.price > 0 && (
                                                <span className="block text-xs text-muted-foreground">
                                                    +{formatVND(c.price)}
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    )}

                    {/* Add-ons Section */}
                    {addonCustomizations.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Add-ons</Label>
                            <p className="text-xs text-muted-foreground">
                                Optional extras (select multiple)
                            </p>
                            {addonCustomizations.map((c) => (
                                <div
                                    key={c.customizationId}
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                >
                                    <div className="flex-1">
                                        <h6 className="text-sm font-medium">{c.name}</h6>
                                        <p className="text-xs text-muted-foreground">
                                            +{formatVND(c.price)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateAddonQuantity(c.customizationId, (selectedAddons[c.customizationId] || 0) - 1)}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {selectedAddons[c.customizationId] || 0}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateAddonQuantity(c.customizationId, (selectedAddons[c.customizationId] || 0) + 1)}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {item.customizations.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                            No customizations available for this item.
                        </p>
                    )}

                    <div>
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                            className="mt-1"
                            placeholder='e.g. "less spicy", "no onion"'
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter className="shrink-0 mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onAdd}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Order - {formatVND(totalPrice)}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WaiterOrderPage;
