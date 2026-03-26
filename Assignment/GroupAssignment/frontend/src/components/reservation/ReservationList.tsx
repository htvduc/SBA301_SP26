import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  UserCheck,
  CheckSquare,
  UserX,
  Loader2,
  Users,
  Calendar,
  Clock,
} from 'lucide-react';
import { ReservationStatus, type ReservationDTO } from '@/types/dto/reservation.dto';
import {
  useApproveReservation,
  useRejectReservation,
  useMarkArrived,
  useCompleteReservation,
  useMarkNoShow,
} from '@/hooks/queries/useReservationQueries';

interface ReservationListProps {
  reservations: ReservationDTO[];
  isLoading?: boolean;
  onSelectReservation?: (reservation: ReservationDTO) => void;
}

const statusConfig: Record<
  ReservationStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  [ReservationStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    icon: <Clock className="h-3 w-3" />,
  },
  [ReservationStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [ReservationStatus.CONFIRMED]: {
    label: 'Confirmed',
    className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    icon: <UserCheck className="h-3 w-3" />,
  },
  [ReservationStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    icon: <CheckSquare className="h-3 w-3" />,
  },
  [ReservationStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: <XCircle className="h-3 w-3" />,
  },
  [ReservationStatus.NO_SHOW]: {
    label: 'No Show',
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
    icon: <UserX className="h-3 w-3" />,
  },
};

export function ReservationList({
  reservations,
  isLoading = false,
  onSelectReservation,
}: ReservationListProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [arrivalDialogOpen, setArrivalDialogOpen] = useState(false);
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false);

  const approveMutation = useApproveReservation();
  const rejectMutation = useRejectReservation();
  const arriveMutation = useMarkArrived();
  const completeMutation = useCompleteReservation();
  const noShowMutation = useMarkNoShow();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleRejectClick = (id: string) => {
    setSelectedReservationId(id);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedReservationId) {
      rejectMutation.mutate(
        {
          id: selectedReservationId,
          data: { reason: rejectionReason || undefined },
        },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setSelectedReservationId(null);
            setRejectionReason('');
          },
        }
      );
    }
  };

  const handleMarkArrivedClick = (id: string) => {
    setSelectedReservationId(id);
    setArrivalDialogOpen(true);
  };

  const handleMarkArrivedConfirm = () => {
    if (selectedReservationId) {
      arriveMutation.mutate(selectedReservationId, {
        onSuccess: () => {
          setArrivalDialogOpen(false);
          setSelectedReservationId(null);
        },
      });
    }
  };

  const handleComplete = (id: string) => {
    completeMutation.mutate(id);
  };

  const handleMarkNoShowClick = (id: string) => {
    setSelectedReservationId(id);
    setNoShowDialogOpen(true);
  };

  const handleMarkNoShowConfirm = () => {
    if (selectedReservationId) {
      noShowMutation.mutate(selectedReservationId, {
        onSuccess: () => {
          setNoShowDialogOpen(false);
          setSelectedReservationId(null);
        },
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        date: format(date, 'MMM dd, yyyy'),
        time: format(date, 'HH:mm'),
      };
    } catch {
      return { date: 'Invalid date', time: '' };
    }
  };

  const getActionButtons = (reservation: ReservationDTO) => {
    const isProcessing =
      approveMutation.isPending ||
      rejectMutation.isPending ||
      arriveMutation.isPending ||
      completeMutation.isPending ||
      noShowMutation.isPending;

    switch (reservation.status) {
      case ReservationStatus.PENDING:
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(reservation.reservationId);
              }}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleRejectClick(reservation.reservationId);
              }}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        );

      case ReservationStatus.APPROVED:
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkArrivedClick(reservation.reservationId);
              }}
              disabled={isProcessing}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {arriveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              Arrived
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkNoShowClick(reservation.reservationId);
              }}
              disabled={isProcessing}
            >
              <UserX className="h-4 w-4" />
              No Show
            </Button>
          </div>
        );

      case ReservationStatus.CONFIRMED:
        return (
          <Button
            size="sm"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              handleComplete(reservation.reservationId);
            }}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {completeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckSquare className="h-4 w-4" />
            )}
            Complete
          </Button>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground/40 mb-3" />
        <p className="text-lg font-medium text-muted-foreground">No reservations found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or create a new reservation
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Reservation Time</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation) => {
              const { date, time } = formatDateTime(reservation.startTime);
              const statusInfo = statusConfig[reservation.status];

              return (
                <TableRow
                  key={reservation.reservationId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectReservation?.(reservation)}
                >
                  <TableCell>
                    <div className="font-medium">{reservation.customerName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{reservation.customerPhone}</div>
                      {reservation.customerEmail && (
                        <div className="text-xs text-muted-foreground">
                          {reservation.customerEmail}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{reservation.guestNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{date}</div>
                      <div className="text-xs text-muted-foreground">{time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.tableTag ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{reservation.tableTag}</div>
                        {reservation.tableCapacity && (
                          <div className="text-xs text-muted-foreground">
                            Capacity: {reservation.tableCapacity}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`flex items-center gap-1.5 w-fit ${statusInfo.className}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      {getActionButtons(reservation)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this reservation? You can optionally provide a reason
              that will be sent to the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason (Optional)
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                'Reject Reservation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={arrivalDialogOpen} onOpenChange={setArrivalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Customer Arrival</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this customer as arrived? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={arriveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkArrivedConfirm}
              disabled={arriveMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {arriveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm Arrival'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm No-Show</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this customer as a no-show? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={noShowMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkNoShowConfirm}
              disabled={noShowMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {noShowMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Confirm No-Show'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
