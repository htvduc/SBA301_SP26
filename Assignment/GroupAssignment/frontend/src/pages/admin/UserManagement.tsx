import { useState } from "react";
import { Eye, Search, Store, Mail, Calendar, User, LayoutGrid, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useRestaurantOwners, useUserDetails } from "@/hooks/queries/useAdminUserQueries";

// Component phụ để render Badge trạng thái hiện đại, mượt mà hơn
const StatusBadge = ({ status }: { status: string | boolean }) => {
  const isActive = typeof status === 'boolean' ? status : status === "ACTIVE";
  
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Active
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Inactive
    </span>
  );
};

const UserManagement = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const { data: usersData, isLoading, error } = useRestaurantOwners(search, page, 10);
  const { data: detailUser, isLoading: isLoadingDetail } = useUserDetails(detailUserId || '', !!detailUserId);

  const users = usersData?.content ||[];

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage restaurant owners and their establishments</p>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="flex items-center gap-3 bg-card p-1 rounded-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/50" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[350px] pl-6">User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restaurants</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Table Loading Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell className="text-right pr-6"><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-destructive">
                    Error loading data. Please try again later.
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Inbox className="w-12 h-12 mb-4 opacity-20" />
                      <p>No restaurant owners found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.userId} className="hover:bg-muted/30 transition-colors group">
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                            {getInitials(u.username || u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {u.username || 'Name not updated'}
                          </span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Store className="w-4 h-4 opacity-50" />
                        <span className="font-medium">{u.restaurants.length}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => setDetailUserId(u.userId)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        {/* Pagination Section */}
        {!isLoading && usersData && usersData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10">
            <p className="text-xs text-muted-foreground font-medium">
              Showing {usersData.page * usersData.size + 1} - {Math.min((usersData.page + 1) * usersData.size, usersData.totalElements)} of {usersData.totalElements} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page - 1)}
                disabled={usersData.first}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-center">
                {usersData.page + 1} / {usersData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage(page + 1)}
                disabled={usersData.last}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modern User Detail Dialog (Profile Card Style) */}
      <Dialog open={!!detailUserId} onOpenChange={(open) => !open && setDetailUserId(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden gap-0 bg-background">
          {isLoadingDetail || !detailUser ? (
            <div className="p-8 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Header Banner */}
              <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50 relative">
                <DialogHeader className="p-6 absolute inset-0">
                  <DialogTitle className="sr-only">Restaurant Owner Information</DialogTitle>
                </DialogHeader>
              </div>

              {/* Profile Info Section */}
              <div className="px-6 pb-6 relative">
                <div className="flex justify-between items-end -mt-10 mb-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-sm bg-muted">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                      {getInitials(detailUser.username || detailUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <StatusBadge status={detailUser.status} />
                </div>

                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {detailUser.username || 'Name not updated'}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                    <Mail className="w-4 h-4 opacity-70" />
                    <span>{detailUser.email}</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="flex flex-col p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Joined Date</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatDate(detailUser.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-xs font-medium">Total Restaurants</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {detailUser.restaurants?.length || 0} restaurant{detailUser.restaurants?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Restaurants List Section */}
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    Restaurant List
                  </h3>
                  
                  {detailUser.restaurants && detailUser.restaurants.length > 0 ? (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      {detailUser.restaurants.map(restaurant => (
                        <div 
                          key={restaurant.restaurantId} 
                          className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-card hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Store className="w-5 h-5 text-primary/70" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{restaurant.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Created: {formatDate(restaurant.createdAt)}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={restaurant.status} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-border/60 bg-muted/10">
                      <Store className="w-8 h-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">No restaurants yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;