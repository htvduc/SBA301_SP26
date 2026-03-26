import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Users, Phone, Mail, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCreateReservation, useAvailableTables } from '@/hooks/queries/useReservationQueries';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { branchApi } from '@/api/branchApi';
import type { CreateReservationRequest, TableAvailabilityStatus, GetAvailableTablesParams } from '@/types/dto';

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReservationDialog({
  open,
  onOpenChange,
}: CreateReservationDialogProps) {
  const { staffInfo } = useAuthStore();
  const branchId = staffInfo?.branchId || '';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [guestNumber, setGuestNumber] = useState('');
  const [reservationDateTime, setReservationDateTime] = useState<Date | null>(null);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('120'); // default 2 hours
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateReservation();

  // Fetch branch info to get operating hours
  const { data: branchInfo } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => branchApi.getById(branchId),
    enabled: !!branchId,
  });

  // Helper function to format date to LocalDateTime string (YYYY-MM-DDTHH:mm:ss)
  const formatToLocalDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Fetch available tables based on time and guest count
  const shouldFetchTables = !!branchId && !!reservationDateTime && !!guestNumber && parseInt(guestNumber) > 0;
  
  const availableTablesParams: GetAvailableTablesParams = {
    branchId,
    // Format to LocalDateTime string without timezone conversion
    time: reservationDateTime ? formatToLocalDateTime(reservationDateTime) : '',
    guests: parseInt(guestNumber) || 0,
    duration: parseInt(estimatedDuration) || undefined,
  };

  const { data: availableTables = [], isLoading: isLoadingTables } = useAvailableTables(availableTablesParams);
  
  // Show all available tables (no area filtering)
  const filteredTables = availableTables;

  useEffect(() => {
    if (open) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setGuestNumber('');
      setReservationDateTime(null);
      setSelectedTableId('');
      setEstimatedDuration('120');
      setNote('');
      setErrors({});
    }
  }, [open, branchId]);

  // Clear selected table if it becomes unavailable or not in filtered list
  useEffect(() => {
    if (selectedTableId && filteredTables.length > 0) {
      const selectedTable = filteredTables.find(t => t.tableId === selectedTableId);
      if (!selectedTable || selectedTable.status === 'UNAVAILABLE') {
        setSelectedTableId('');
      }
    }
  }, [filteredTables, selectedTableId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid phone number (10-11 digits)';
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!guestNumber || parseInt(guestNumber) <= 0) {
      newErrors.guestNumber = 'Guest number must be greater than 0';
    }

    if (!reservationDateTime) {
      newErrors.reservationDateTime = 'Reservation date and time is required';
    } else {
      const now = new Date();
      const minAllowedTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      
      if (reservationDateTime < minAllowedTime) {
        newErrors.reservationDateTime = 'Reservation time must be at least 10 minutes in the future';
      }

      // Check if time is within branch operating hours
      if (branchInfo?.openingTime && branchInfo?.closingTime) {
        const selectedHour = reservationDateTime.getHours();
        const selectedMinute = reservationDateTime.getMinutes();
        
        const [openHour, openMin] = branchInfo.openingTime.split(':').map(Number);
        const [closeHour, closeMin] = branchInfo.closingTime.split(':').map(Number);
        
        const selectedTimeInMinutes = selectedHour * 60 + selectedMinute;
        const openTimeInMinutes = openHour * 60 + openMin;
        const closeTimeInMinutes = closeHour * 60 + closeMin;
        
        if (selectedTimeInMinutes < openTimeInMinutes || selectedTimeInMinutes > closeTimeInMinutes) {
          newErrors.reservationDateTime = `Reservation time must be between ${branchInfo.openingTime.slice(0, 5)} and ${branchInfo.closingTime.slice(0, 5)}`;
        }
      }
    }

    if (!selectedTableId || selectedTableId === 'none') {
      newErrors.selectedTableId = 'Please select a table for the reservation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const requestData: CreateReservationRequest = {
      branchId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      guestNumber: parseInt(guestNumber),
      startTime: formatToLocalDateTime(reservationDateTime!),
      areaTableId: selectedTableId,
      estimatedDurationMinutes: parseInt(estimatedDuration),
      note: note.trim() || undefined,
    };

    createMutation.mutate(requestData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    // Add 15 minutes buffer to allow for immediate bookings
    now.setMinutes(now.getMinutes() + 15);
    return now;
  };

  const getBranchOperatingHours = () => {
    if (!branchInfo?.openingTime || !branchInfo?.closingTime) {
      return { minTime: new Date(0, 0, 0, 0, 0), maxTime: new Date(0, 0, 0, 23, 59) };
    }

    // Parse "HH:mm:ss" format
    const [openHour, openMin] = branchInfo.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = branchInfo.closingTime.split(':').map(Number);

    return {
      minTime: new Date(0, 0, 0, openHour, openMin),
      maxTime: new Date(0, 0, 0, closeHour, closeMin),
    };
  };

  const getTimeConstraints = () => {
    const { minTime: branchMinTime, maxTime: branchMaxTime } = getBranchOperatingHours();
    
    // If selecting today, use the later of "now + 15 min" or branch opening time
    if (reservationDateTime && reservationDateTime.toDateString() === new Date().toDateString()) {
      const minDateTime = getMinDateTime();
      const minHour = minDateTime.getHours();
      const minMinute = minDateTime.getMinutes();
      
      const branchMinHour = branchMinTime.getHours();
      const branchMinMinute = branchMinTime.getMinutes();
      
      // Compare times and use the later one
      if (minHour > branchMinHour || (minHour === branchMinHour && minMinute > branchMinMinute)) {
        return { minTime: minDateTime, maxTime: branchMaxTime };
      }
    }
    
    return { minTime: branchMinTime, maxTime: branchMaxTime };
  };

  const getTableStatusIcon = (status: TableAvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'RISKY':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'UNAVAILABLE':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getTableStatusColor = (status: TableAvailabilityStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'text-green-600';
      case 'RISKY':
        return 'text-yellow-600';
      case 'UNAVAILABLE':
        return 'text-red-600 line-through';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
          <DialogDescription>
            Create a new reservation on behalf of a customer
          </DialogDescription>
        </DialogHeader>

        <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="customerName"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) {
                      setErrors({ ...errors, customerName: '' });
                    }
                  }}
                  autoComplete="off"
                  className={`pl-9 ${errors.customerName ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.customerName && (
                <p className="text-xs text-destructive">{errors.customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="customerPhone"
                  placeholder="0123456789"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.customerPhone) {
                      setErrors({ ...errors, customerPhone: '' });
                    }
                  }}
                  autoComplete="off"
                  className={`pl-9 ${errors.customerPhone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.customerPhone && (
                <p className="text-xs text-destructive">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="customerEmail"
                type="email"
                placeholder="john.doe@example.com"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (errors.customerEmail) {
                    setErrors({ ...errors, customerEmail: '' });
                  }
                }}
                autoComplete="off"
                className={`pl-9 ${errors.customerEmail ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.customerEmail && (
              <p className="text-xs text-destructive">{errors.customerEmail}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestNumber">
                Number of Guests <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="guestNumber"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={guestNumber}
                  onChange={(e) => {
                    setGuestNumber(e.target.value);
                    if (errors.guestNumber) {
                      setErrors({ ...errors, guestNumber: '' });
                    }
                  }}
                  autoComplete="off"
                  className={`pl-9 ${errors.guestNumber ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.guestNumber && (
                <p className="text-xs text-destructive">{errors.guestNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="30"
                  step="15"
                  placeholder="120"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  autoComplete="off"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">Default: 120 minutes (2 hours)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservationDateTime">
              Reservation Date & Time <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <div className="flex gap-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Clock className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              </div>
              <DatePicker
                selected={reservationDateTime}
                onChange={(date) => {
                  setReservationDateTime(date);
                  if (errors.reservationDateTime) {
                    setErrors({ ...errors, reservationDateTime: '' });
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                minTime={getTimeConstraints().minTime}
                maxTime={getTimeConstraints().maxTime}
                placeholderText="Select date and time"
                className={`w-full pl-16 pr-4 py-2 rounded-md border ${
                  errors.reservationDateTime ? 'border-destructive' : 'border-input'
                } bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
              />
            </div>
            {errors.reservationDateTime && (
              <p className="text-xs text-destructive">{errors.reservationDateTime}</p>
            )}
            {branchInfo?.openingTime && branchInfo?.closingTime && (
              <p className="text-xs text-muted-foreground">
                Branch hours: {branchInfo.openingTime.slice(0, 5)} - {branchInfo.closingTime.slice(0, 5)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="table">
              Table <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={selectedTableId} 
              onValueChange={(value) => {
                setSelectedTableId(value);
                if (errors.selectedTableId) {
                  setErrors({ ...errors, selectedTableId: '' });
                }
              }}
            >
              <SelectTrigger id="table" className={errors.selectedTableId ? 'border-destructive' : ''}>
                <SelectValue placeholder={
                  isLoadingTables 
                    ? "Loading tables..." 
                    : !reservationDateTime || !guestNumber
                    ? "Select date, time and guests first"
                    : filteredTables.length === 0
                    ? "No tables available"
                    : "Select a table"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredTables.length === 0 && !isLoadingTables && shouldFetchTables ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    No tables available in this area
                  </div>
                ) : (
                  filteredTables.map((table) => (
                    <SelectItem 
                      key={table.tableId} 
                      value={table.tableId}
                      disabled={table.status === 'UNAVAILABLE'}
                    >
                      <div className="flex items-center gap-2">
                        {getTableStatusIcon(table.status)}
                        <span className={getTableStatusColor(table.status)}>
                          {table.tableTag} (Capacity: {table.capacity})
                        </span>
                        {table.reason && (
                          <span className="text-xs text-muted-foreground">- {table.reason}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.selectedTableId && (
              <p className="text-xs text-destructive">{errors.selectedTableId}</p>
            )}
            {reservationDateTime && guestNumber && shouldFetchTables && (
              <div className="text-xs space-y-1 mt-2">
                {isLoadingTables ? (
                  <p className="text-muted-foreground">Checking table availability...</p>
                ) : filteredTables.length === 0 ? (
                  <p className="text-destructive">No tables available for the selected time and guest count. Please choose a different time or reduce the number of guests.</p>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-2">Table availability legend:</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Available - No conflicts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-600" />
                      <span className="text-yellow-600">Risky - Close to another reservation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span className="text-red-600">Unavailable - Time conflict</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Any special requests or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Reservation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
