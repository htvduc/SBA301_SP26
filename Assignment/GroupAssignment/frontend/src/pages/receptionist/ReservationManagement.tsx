import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ReservationFilters } from '@/components/reservation/ReservationFilters';
import { ReservationList } from '@/components/reservation/ReservationList';
import { ReservationDetailDialog } from '@/components/reservation/ReservationDetailDialog';
import { CreateReservationDialog } from '@/components/reservation/CreateReservationDialog';
import { useReservations } from '@/hooks/queries/useReservationQueries';
import type { ReservationDTO, ReservationFilterParams } from '@/types/dto/reservation.dto';
import { ReservationStatus } from '@/types/dto/reservation.dto';

const ReservationManagement = () => {
  const staffInfo = useAuthStore((state) => state.staffInfo);
  const branchId = staffInfo?.branchId;

  const [filters, setFilters] = useState<ReservationFilterParams>({
    statuses: [
      ReservationStatus.PENDING,
      ReservationStatus.APPROVED,
      ReservationStatus.CONFIRMED,
    ],
  });

  const [selectedReservation, setSelectedReservation] = useState<ReservationDTO | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: reservations = [], isLoading } = useReservations(branchId || '', filters);

  const handleSelectReservation = (reservation: ReservationDTO) => {
    setSelectedReservation(reservation);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedReservation(null);
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      confirmed: 0,
      total: reservations.length,
    };

    reservations.forEach((reservation) => {
      switch (reservation.status) {
        case ReservationStatus.PENDING:
          counts.pending++;
          break;
        case ReservationStatus.APPROVED:
          counts.approved++;
          break;
        case ReservationStatus.CONFIRMED:
          counts.confirmed++;
          break;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

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
        <div>
          <h1 className="text-2xl font-display">Reservation Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer reservations and track dining status
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Reservation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{statusCounts.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.approved}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-teal-600">{statusCounts.confirmed}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ReservationFilters filters={filters} onFiltersChange={setFilters} />

      {/* Reservation List */}
      <Card className="glass-card border-border/60">
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Reservations
              {reservations.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({reservations.length} {reservations.length === 1 ? 'result' : 'results'})
                </span>
              )}
            </h2>
          </div>
          <ReservationList
            reservations={reservations}
            isLoading={isLoading}
            onSelectReservation={handleSelectReservation}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <ReservationDetailDialog
        reservation={selectedReservation}
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
      />

      {/* Create Dialog */}
      <CreateReservationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default ReservationManagement;
