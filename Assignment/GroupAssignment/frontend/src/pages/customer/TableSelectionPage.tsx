import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { restaurantApi, branchApi, areaApi, tableApi, reservationApi } from '@/api'
import { useToast } from '@/hooks/use-toast'
import CustomerHeader from '@/components/customer/CustomerHeader'
import type { RestaurantDTO, BranchDTO, AreaDTO, AreaTableDTO, TableAvailabilityDTO } from '@/types/dto'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { setHours, setMinutes } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import './TableSelectionPage.css'

export default function TableSelectionPage() {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug?: string }>()
  const { toast } = useToast()

  const [restaurant, setRestaurant] = useState<RestaurantDTO | null>(null)
  const [branches, setBranches] = useState<BranchDTO[]>([])
  const [areas, setAreas] = useState<AreaDTO[]>([])
  const[tables, setTables] = useState<AreaTableDTO[]>([])
  const [tableAvailability, setTableAvailability] = useState<Map<string, TableAvailabilityDTO>>(new Map())

  const [selectedBranch, setSelectedBranch] = useState<BranchDTO | null>(null)
  const [selectedArea, setSelectedArea] = useState<AreaDTO | null>(null)
  const [selectedTable, setSelectedTable] = useState<AreaTableDTO | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [step, setStep] = useState<'branch' | 'details' | 'area' | 'table'>('branch')

  const[reservationData, setReservationData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    guestNumber: 2,
    reservationDate: new Date().toLocaleDateString('en-CA'),
    reservationTime: '',
    specialOccasion: 'Just Dining',
    notes: ''
  })
  
  const isToday = reservationData.reservationDate === new Date().toISOString().split("T")[0]
  const now = new Date()

  const minTime = isToday
    ? new Date(now.getTime() + 30 * 60000) // ít nhất 30 phút sau hiện tại
    : setHours(setMinutes(new Date(), 0), 8)

  const maxTime = setHours(setMinutes(new Date(), 0), 21)

  // Fetch restaurant and branches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const restaurantSlug = slug || 'default'

        try {
          const restaurantData = await restaurantApi.getBySlug(restaurantSlug)
          setRestaurant(restaurantData)

          const branchesData = await branchApi.getByPublicRestaurant(restaurantData.restaurantId)
          setBranches(branchesData)
          if (branchesData.length > 0) {
            setSelectedBranch(branchesData[0])
          }
        } catch (err) {
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  // Fetch areas when branch changes
  useEffect(() => {
    const fetchAreas = async () => {
      if (selectedBranch) {
        try {
          const areasData = await areaApi.getByPublicBranch(selectedBranch.branchId || '')
          setAreas(areasData)
          if (areasData.length > 0) {
            setSelectedArea(areasData[0])
          }
        } catch (err) {
        }
      }
    }

    fetchAreas()
  }, [selectedBranch])

  // Fetch tables when area changes
  useEffect(() => {
    const fetchTables = async () => {
      if (selectedArea) {
        try {
          const tablesData = await tableApi.getByPublicArea(selectedArea.areaId)
          setTables(tablesData)
          setSelectedTable(null)
        } catch (err) {
        }
      }
    }

    fetchTables()
  }, [selectedArea])

  // Fetch table availability when reservation details or area changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedBranch || !reservationData.reservationDate || !reservationData.reservationTime) {
        return
      }

      try {
        setLoadingAvailability(true)
        const dateTime = `${reservationData.reservationDate}T${reservationData.reservationTime}:00`
        
        const availableTables = await reservationApi.getAvailableTables({
          branchId: selectedBranch.branchId || '',
          time: dateTime,
          guests: reservationData.guestNumber,
          duration: undefined
        })

        // Convert array to Map for quick lookup
        const availabilityMap = new Map<string, TableAvailabilityDTO>()
        availableTables.forEach(table => {
          availabilityMap.set(table.tableId, table)
        })
        setTableAvailability(availabilityMap)

        // Clear selected table if it's no longer available
        if (selectedTable) {
          const selectedAvailability = availabilityMap.get(selectedTable.areaTableId || '')
          if (!selectedAvailability || selectedAvailability.status !== 'AVAILABLE') {
            setSelectedTable(null)
          }
        }
      } catch (err) {
      } finally {
        setLoadingAvailability(false)
      }
    }

    fetchAvailability()
  }, [selectedBranch, reservationData.reservationDate, reservationData.reservationTime, reservationData.guestNumber])

  const validateReservationDetails = (): boolean => {
    const { customerName, customerPhone, customerEmail, guestNumber, reservationDate, reservationTime } = reservationData

    if (!customerName || customerName.trim() === '') {
      toast({ title: 'Cảnh báo', description: 'Vui lòng nhập Họ tên', variant: 'destructive' })
      return false
    }

    if (!customerPhone || customerPhone.trim() === '') {
      toast({ title: 'Cảnh báo', description: 'Vui lòng nhập Số điện thoại', variant: 'destructive' })
      return false
    }

    if (!customerEmail || customerEmail.trim() === '') {
      toast({ title: 'Cảnh báo', description: 'Vui lòng nhập Email', variant: 'destructive' })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail)) {
      toast({ title: 'Cảnh báo', description: 'Email không hợp lệ', variant: 'destructive' })
      return false
    }

    if (!reservationDate || reservationDate.trim() === '') {
      toast({ title: 'Cảnh báo', description: 'Vui lòng chọn Ngày đặt bàn', variant: 'destructive' })
      return false
    }

    if (!reservationTime || reservationTime.trim() === '') {
      toast({ title: 'Cảnh báo', description: 'Vui lòng chọn Thời gian đặt bàn', variant: 'destructive' })
      return false
    }

    if (!guestNumber || guestNumber < 1) {
      toast({ title: 'Cảnh báo', description: 'Vui lòng chọn Số lượng khách', variant: 'destructive' })
      return false
    }

    return true
  }

  const handleReservationSubmit = async () => {
    if (!selectedBranch || !selectedTable) {
      toast({
        title: 'Error',
        description: 'Please select branch and table',
        variant: 'destructive',
        duration: 4000
      })
      return
    }

    if (!validateReservationDetails()) return

    try {
      const startTime = `${reservationData.reservationDate}T${reservationData.reservationTime}:00`

      await reservationApi.create({
        branchId: selectedBranch.branchId || '',
        areaTableId: selectedTable.areaTableId,
        startTime,
        customerName: reservationData.customerName,
        customerPhone: reservationData.customerPhone,
        customerEmail: reservationData.customerEmail,
        guestNumber: reservationData.guestNumber,
        note: `${reservationData.specialOccasion} - ${reservationData.notes}`
      })

      toast({
        title: 'Success',
        description: 'Reservation confirmed! Please check your email to confirm information.',
        variant: 'default'
      })
      navigateTo('/menu')
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create reservation. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const navigateTo = (path: string) => {
    if (slug) {
      navigate(`/${slug}${path}`)
    } else {
      navigate(path)
    }
  }

  // Helper cho Progress Bar
  const stepOrder =['branch', 'details', 'area', 'table']
  const currentStepIndex = stepOrder.indexOf(step)

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 text-gray-800 font-sans">
      <CustomerHeader
        restaurant={restaurant}
        slug={slug}
        currentPage="reservations"
      />

      <main className="flex-1 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to={slug ? `/${slug}/reservations` : '/reservations'} className="hover:text-orange-500 transition-colors">Reservation</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-gray-500">Booking Flow</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-orange-500">Table Selection</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Book a Table</h1>
            <p className="text-gray-600">Experience the warmth of our hearth. Complete the steps to secure your dining experience.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LỖI CŨ Ở ĐÂY: Thẻ div col-span-2 đã đóng sớm. Bây giờ nó sẽ ôm trọn các bước */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className={`flex items-center gap-3 ${currentStepIndex >= 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStepIndex > 0 ? 'bg-orange-500 text-white' : currentStepIndex === 0 ? 'bg-orange-100 border-2 border-orange-500 text-orange-500' : 'bg-gray-200 text-gray-500'}`}>
                    {currentStepIndex > 0 ? <span className="material-symbols-outlined text-[16px]">check</span> : '01'}
                  </div>
                  <span className="font-medium text-sm hidden sm:block">BRANCH</span>
                </div>

                <div className="h-px bg-gray-200 flex-1 mx-4"></div>

                <div className={`flex items-center gap-3 ${currentStepIndex >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStepIndex > 1 ? 'bg-orange-500 text-white' : currentStepIndex === 1 ? 'bg-orange-100 border-2 border-orange-500 text-orange-500' : 'bg-gray-200 text-gray-500'}`}>
                    {currentStepIndex > 1 ? <span className="material-symbols-outlined text-[16px]">check</span> : '02'}
                  </div>
                  <span className="font-medium text-sm hidden sm:block">DETAILS</span>
                </div>

                <div className="h-px bg-gray-200 flex-1 mx-4"></div>

                <div className={`flex items-center gap-3 ${currentStepIndex >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStepIndex > 2 ? 'bg-orange-500 text-white' : currentStepIndex === 2 ? 'bg-orange-100 border-2 border-orange-500 text-orange-500' : 'bg-gray-200 text-gray-500'}`}>
                    {currentStepIndex > 2 ? <span className="material-symbols-outlined text-[16px]">check</span> : '03'}
                  </div>
                  <span className="font-medium text-sm hidden sm:block">AREA</span>
                </div>

                <div className="h-px bg-gray-200 flex-1 mx-4"></div>

                <div className={`flex items-center gap-3 ${currentStepIndex >= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStepIndex === 3 ? 'bg-orange-100 border-2 border-orange-500 text-orange-500' : 'bg-gray-200 text-gray-500'}`}>
                    04
                  </div>
                  <span className="font-medium text-sm hidden sm:block">TABLE</span>
                </div>
              </div>

              {/* Step 1: Branch Selection */}
              {step === 'branch' && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Branch</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {branches.map(branch => (
                      <div
                        key={branch.branchId}
                        onClick={() => {
                          setSelectedBranch(branch)
                          setStep('details')
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedBranch?.branchId === branch.branchId ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-500 bg-white hover:bg-orange-50'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-2xl text-orange-500">location_on</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{branch.address}</h3>
                            <p className="text-sm text-gray-600">{branch.branchPhone}</p>
                            <p className="text-xs text-gray-500 mt-1">{branch.openingTime} - {branch.closingTime}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Reservation Details */}
              {step === 'details' && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Reservation Details</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={reservationData.customerName}
                          onChange={(e) => setReservationData({ ...reservationData, customerName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          value={reservationData.customerPhone}
                          onChange={(e) => setReservationData({ ...reservationData, customerPhone: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                          placeholder="Ex. 0818860559"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={reservationData.customerEmail}
                          onChange={(e) => setReservationData({ ...reservationData, customerEmail: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                          placeholder="you@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const newGuestNumber = Math.max(1, reservationData.guestNumber - 1)
                              setReservationData({ ...reservationData, guestNumber: newGuestNumber })
                              if (selectedTable && selectedTable.capacity < newGuestNumber) {
                                setSelectedTable(null)
                              }
                            }}
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 text-gray-700 hover:text-orange-500 font-bold text-xl transition-all flex items-center justify-center"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={reservationData.guestNumber}
                            onChange={(e) => {
                              const newGuestNumber = Math.max(1, parseInt(e.target.value) || 1)
                              setReservationData({ ...reservationData, guestNumber: newGuestNumber })
                              if (selectedTable && selectedTable.capacity < newGuestNumber) {
                                setSelectedTable(null)
                              }
                            }}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 text-center text-lg font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newGuestNumber = reservationData.guestNumber + 1
                              setReservationData({ ...reservationData, guestNumber: newGuestNumber })
                              if (selectedTable && selectedTable.capacity < newGuestNumber) {
                                setSelectedTable(null)
                              }
                            }}
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 text-gray-700 hover:text-orange-500 font-bold text-xl transition-all flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Use buttons or type directly</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Date *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            calendar_today
                          </span>
                          <input
                            type="date"
                            value={reservationData.reservationDate}
                            onChange={(e) => setReservationData({ ...reservationData, reservationDate: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer hover:border-orange-400"
                            min={new Date().toLocaleDateString('en-CA')}
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Time *</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                            schedule
                          </span>
                          <DatePicker
                            selected={
                              reservationData.reservationTime
                                ? new Date(`1970-01-01T${reservationData.reservationTime}`)
                                : null
                            }
                            onChange={(date) => {
                              if (!date) return
                              const time = date.toTimeString().slice(0, 5)
                              setReservationData({
                                ...reservationData,
                                reservationTime: time,
                              })
                            }}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            minTime={minTime}
                            maxTime={maxTime}
                            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all cursor-pointer hover:border-orange-400"
                            placeholderText="Choose time"
                            wrapperClassName="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Occasion</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                          celebration
                        </span>
                        <Select
                          value={reservationData.specialOccasion}
                          onValueChange={(value) => setReservationData({ ...reservationData, specialOccasion: value })}
                        >
                          <SelectTrigger className="w-full h-12 pl-11 pr-4 rounded-lg border border-gray-300 text-gray-900 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                            <SelectValue placeholder="Select an occasion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Just Dining">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-gray-500">restaurant</span>
                                <span>Just Dining</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Anniversary">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-pink-500">favorite</span>
                                <span>Anniversary</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Birthday">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-yellow-500">cake</span>
                                <span>Birthday</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Business Dinner">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-blue-500">business_center</span>
                                <span>Business Dinner</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Proposal">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-red-500">diamond</span>
                                <span>Proposal</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Other">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-gray-500">more_horiz</span>
                                <span>Other</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                      <textarea
                        value={reservationData.notes}
                        onChange={(e) => setReservationData({ ...reservationData, notes: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all h-24 resize-none"
                        placeholder="Any special requests or dietary requirements?"
                      />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setStep('branch')}
                        className="flex-1 px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (validateReservationDetails()) {
                            setStep('area')
                          }
                        }}
                        className="flex-1 px-6 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                      >
                        Continue <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Area Selection */}
              {step === 'area' && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Choose Your Atmosphere</h2>
                    <button 
                      onClick={() => setStep('branch')}
                      className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                    >
                      Change Branch
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    {areas.map((area) => (
                      <div
                        key={area.areaId}
                        onClick={() => {
                          setSelectedArea(area)
                          setStep('table')
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedArea?.areaId === area.areaId
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedArea?.areaId === area.areaId
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                              }`}>
                              {selectedArea?.areaId === area.areaId && (
                                <span className="material-symbols-outlined text-white text-[12px]">radio_button_checked</span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900">{area.name}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setStep('details')}
                      className="px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300 w-full md:w-auto"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Table Selection */}
              {step === 'table' && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Your Table</h2>

                  {/* UX Cải tiến: Vẫn hiện bàn nhưng bôi mờ những bàn không đủ người, thay vì ẩn đi hoàn toàn làm hỏng layout bàn */}
                  <>
                    <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                        <span className="text-gray-600">AVAILABLE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-100 border border-orange-500 rounded"></div>
                        <span className="text-gray-600">SELECTED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                        <span className="text-gray-600">RESERVED / UNAVAILABLE</span>
                      </div>
                    </div>

                    {/* Table Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {tables.map(table => {
                        const availability = tableAvailability.get(table.areaTableId || '');
                        const isEnoughCapacity = table.capacity >= reservationData.guestNumber;
                        
                        // Determine availability based on backend response
                        let isAvailable = false;
                        let statusLabel = '';
                        let statusColor = '';
                        
                        if (availability) {
                          // Backend has checked reservation conflicts
                          isAvailable = availability.status === 'AVAILABLE' && isEnoughCapacity;
                          
                          if (availability.status === 'UNAVAILABLE') {
                            statusLabel = availability.reason || 'Reserved';
                            statusColor = 'text-red-500';
                          } else if (availability.status === 'RISKY') {
                            statusLabel = availability.reason || 'Tight schedule';
                            statusColor = 'text-orange-500';
                          } else if (!isEnoughCapacity) {
                            statusLabel = 'Too small';
                            statusColor = 'text-red-500';
                          }
                        } else {
                          // Fallback: check basic capacity and table status
                          isAvailable = table.status === 'FREE' && isEnoughCapacity;
                          if (!isEnoughCapacity && table.status === 'FREE') {
                            statusLabel = 'Too small';
                            statusColor = 'text-red-500';
                          } else if (table.status !== 'FREE') {
                            statusLabel = 'Occupied';
                            statusColor = 'text-gray-500';
                          }
                        }
                        
                        const isSelected = selectedTable?.areaTableId === table.areaTableId;

                        return (
                          <div
                            key={table.areaTableId}
                            onClick={() => {
                              if (isAvailable) setSelectedTable(table)
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-center flex flex-col justify-center min-h-[100px] ${
                              isSelected
                                ? 'border-orange-500 bg-orange-100 shadow-md'
                                : isAvailable
                                  ? 'border-green-300 bg-green-50 hover:border-green-400 cursor-pointer'
                                  : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                              }`}
                          >
                            <div className={`text-lg font-bold mb-1 ${isSelected ? 'text-orange-700' : isAvailable ? 'text-gray-900' : 'text-gray-500'}`}>
                              {table.tag}
                            </div>
                            <div className="text-sm font-medium text-gray-500">{table.capacity} SEATS</div>
                            {statusLabel && (
                              <div className={`text-[10px] ${statusColor} mt-1 mt-auto`}>{statusLabel}</div>
                            )}
                            {loadingAvailability && !availability && (
                              <div className="text-[10px] text-gray-400 mt-1">Checking...</div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 border-t border-gray-100 pt-6">
                      <button
                        onClick={() => setStep('area')}
                        className="flex-1 px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
                      >
                        Back to Area
                      </button>
                      <button
                        onClick={handleReservationSubmit}
                        disabled={!selectedTable}
                        className="flex-1 px-6 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Confirm Reservation
                      </button>
                    </div>
                  </>
                </div>
              )}
            </div>
            {/* KẾT THÚC CỘT CHÍNH (col-span-2) Ở ĐÂY */}

            {/* Sidebar - Reservation Summary (col-span-1) */}
            <div className="lg:col-span-1 h-fit sticky top-24">
              <div className="bg-orange-500 text-white rounded-t-lg p-6">
                <h3 className="text-lg font-semibold mb-1">Reservation Summary</h3>
                <p className="text-orange-100 text-sm">Almost there! Review your booking.</p>
              </div>

              <div className="bg-white rounded-b-lg p-6 shadow-sm border border-t-0 border-gray-200 space-y-5">
                {selectedBranch ? (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-orange-500 mt-0.5">location_on</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">Restaurant Branch</p>
                      <p className="font-medium text-gray-900 leading-tight mb-1">{restaurant?.name || 'Restaurant'}</p>
                      <p className="text-sm text-gray-600">{selectedBranch.address}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">Please select a branch</div>
                )}

                {reservationData.reservationDate && reservationData.reservationTime && (
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                    <span className="material-symbols-outlined text-orange-500 mt-0.5">event</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">Date & Time</p>
                      <p className="font-medium text-gray-900">{new Date(reservationData.reservationDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-sm text-gray-600">{reservationData.reservationTime}</p>
                    </div>
                  </div>
                )}

                {reservationData.guestNumber && (
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                    <span className="material-symbols-outlined text-orange-500 mt-0.5">group</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">Guests</p>
                      <p className="font-medium text-gray-900">{reservationData.guestNumber} People</p>
                    </div>
                  </div>
                )}

                {selectedArea && (
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                    <span className="material-symbols-outlined text-orange-500 mt-0.5">deck</span>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">Area</p>
                      <p className="font-medium text-gray-900">{selectedArea.name}</p>
                    </div>
                  </div>
                )}

                {selectedTable && (
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                    <span className="material-symbols-outlined text-orange-500 mt-0.5">grid_view</span>
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1 tracking-wide">Selected Table</p>
                        <p className="font-medium text-gray-900">Table {selectedTable.tag}</p>
                      </div>
                      {step === 'table' && (
                        <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-orange-500 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    <span className="text-red-400">*</span> Cancellations made within 24 hours of the reservation may incur a $25 no-show fee.
                  </p>

                  {step === 'table' && (
                    <button
                      onClick={handleReservationSubmit}
                      disabled={!selectedTable}
                      className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {selectedTable ? 'BOOK NOW' : 'SELECT A TABLE'}
                    </button>
                  )}
                  
                  <div className="text-center mt-4">
                    <p className="text-xs text-gray-400 font-medium tracking-wide flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Secured with BistroPay
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 text-xl">🍽️</span>
              <span className="text-gray-900 font-semibold">{restaurant?.name || 'Warm Hearth Bistro'}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a>
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {restaurant?.name || 'Warm Hearth Bistro'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}