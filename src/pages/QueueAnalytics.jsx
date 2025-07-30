import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
    Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
    Area
} from 'recharts'
import { useAdminAuth } from '../context/adminAuthContext'

export default function QueueAnalytics() {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [allQueues, setAllQueues] = useState([])

    const [summary, setSummary] = useState({
        totalQueues: 0,
        totalGuests: 0,
        cancelled: 0,
        peakHour: '',
        mostTable: ''
    })
    const [queuesOverTime, setQueuesOverTime] = useState([])
    const [guestsOverTime, setGuestsOverTime] = useState([])
    const [statusDistribution, setStatusDistribution] = useState([])
    const { admin } = useAdminAuth();
    const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b']

    useEffect(() => {
        if (!admin?.restaurant?.slug) return;
        fetchAnalytics()
    }, [startDate, endDate, admin])

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-700 rounded-full text-sm font-medium';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium';
            case 'cancelled':
                return 'bg-red-100 text-red-700 rounded-full text-sm font-medium';
            default:
                return 'bg-gray-100 text-gray-700 rounded-full text-sm font-medium';
        }
    };
    const fetchAnalytics = async () => {
        setLoading(true)
        setError(null)

        try {
            // Fixed: Use proper timezone handling and date range query
            const startDateTime = dayjs(startDate).startOf('day').toISOString()
            const endDateTime = dayjs(endDate).endOf('day').toISOString()

            console.log('Fetching data from:', startDateTime, 'to:', endDateTime)

            const { data: queues, error: fetchError } = await supabase
                .from('queues')
                .select('*')
                .eq('restaurant_slug', admin.restaurant.slug)
                .gte('created_at', startDateTime)
                .lte('created_at', endDateTime)
                .order('created_at', { ascending: true })

            if (fetchError) {
                throw fetchError
            }
            console.log('Fetched queues:', queues?.length || 0)
            setAllQueues(queues || [])

            if (!queues || queues.length === 0) {
                // Reset to empty state
                setSummary({
                    totalQueues: 0,
                    totalGuests: 0,
                    cancelled: 0,
                    peakHour: 'N/A',
                    mostTable: 'N/A'
                })
                setQueuesOverTime([])
                setGuestsOverTime([])
                setStatusDistribution([])

                return
            }

            // Process data
            const groupedQueues = {}
            const groupedGuests = {}
            const statusMap = {}
            const hourMap = {}
            const tableMap = {}
            let totalGuests = 0
            let totalCancelled = 0

            queues.forEach(q => {
                // Fixed: Better date parsing and validation
                if (!q.created_at) return

                const createdAt = dayjs(q.created_at)
                const date = createdAt.format('YYYY-MM-DD')
                const hour = createdAt.hour()

                // Fixed: Better guest count handling
                const guests = parseInt(q.guests_count) || 0

                // Group by date
                groupedQueues[date] = (groupedQueues[date] || 0) + 1
                groupedGuests[date] = (groupedGuests[date] || 0) + guests

                // Status distribution
                const status = q.status || 'unknown'
                statusMap[status] = (statusMap[status] || 0) + 1

                // Hour distribution for peak calculation
                hourMap[hour] = (hourMap[hour] || 0) + 1

                // Fixed: Count total guests from all statuses, not just seated
                totalGuests += guests

                // Count cancelled queues
                if (status === 'cancelled') {
                    totalCancelled += 1
                }

                // Table usage tracking
                if (q.table_id) {
                    const tableId = q.table_id.toString()
                    tableMap[tableId] = (tableMap[tableId] || 0) + 1
                }
            })

            // Fixed: Create complete date range data (fill missing dates with 0)
            const dateRange = []
            let currentDate = dayjs(startDate)
            const endDateObj = dayjs(endDate)

            while (currentDate.isSame(endDateObj) || currentDate.isBefore(endDateObj)) {
                const dateStr = currentDate.format('YYYY-MM-DD')
                dateRange.push({
                    date: dateStr,
                    queues: groupedQueues[dateStr] || 0,
                    guests: groupedGuests[dateStr] || 0
                })
                currentDate = currentDate.add(1, 'day')
            }

            // Fixed: Better peak hour calculation and formatting
            let peakHour = 'N/A'
            if (Object.keys(hourMap).length > 0) {
                const peakHourNum = Object.entries(hourMap)
                    .reduce((a, b) => b[1] > a[1] ? b : a, [0, 0])[0]

                const hour = parseInt(peakHourNum)
                const nextHour = (hour + 1) % 24
                const formatHour = (h) => {
                    if (h === 0) return '12 AM'
                    if (h === 12) return '12 PM'
                    if (h < 12) return `${h} AM`
                    return `${h - 12} PM`
                }
                peakHour = `${formatHour(hour)} - ${formatHour(nextHour)}`
            }

            // Fixed: Better table ID handling
            let mostTable = 'N/A'
            if (Object.keys(tableMap).length > 0) {
                mostTable = Object.entries(tableMap)
                    .reduce((a, b) => b[1] > a[1] ? b : a, [null, 0])[0] || 'N/A'
            }

            // Create status distribution data
            const statusPieData = Object.entries(statusMap)
                .map(([name, value]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    value
                }))
                .sort((a, b) => b.value - a.value)

            // Update state
            setSummary({
                totalQueues: queues.length,
                totalGuests,
                cancelled: totalCancelled,
                peakHour,
                mostTable
            })

            setQueuesOverTime(dateRange.map(d => ({ date: d.date, queues: d.queues })))
            setGuestsOverTime(dateRange.map(d => ({ date: d.date, guests: d.guests })))
            setStatusDistribution(statusPieData)


        } catch (error) {
            console.error('Error fetching analytics:', error)
            setError(error.message || 'Failed to fetch analytics data')
        } finally {
            setLoading(false)
        }
    }
    const handleDownloadCSV = () => {
        if (!allQueues.length) return

        const headers = Object.keys(allQueues[0])
        const csvRows = [
            headers.join(","), // header row
            ...allQueues.map(row =>
                headers.map(field => `"${row[field] ?? ''}"`).join(",")
            )
        ]
        const csvContent = `data:text/csv;charset=utf-8,${csvRows.join("\n")}`
        const link = document.createElement("a")
        link.href = encodeURI(csvContent)
        link.download = `queues_${startDate}_to_${endDate}.csv`
        link.click()
    }


    // Fixed: Better date input validation
    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value
        if (dayjs(newStartDate).isAfter(dayjs(endDate))) {
            setEndDate(newStartDate)
        }
        setStartDate(newStartDate)
    }

    const handleEndDateChange = (e) => {
        const newEndDate = e.target.value
        if (dayjs(newEndDate).isBefore(dayjs(startDate))) {
            setStartDate(newEndDate)
        }
        setEndDate(newEndDate)
    }

    const COLOR_OPTIONS = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500',
        'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
        'bg-teal-500', 'bg-blue-500', 'bg-indigo-500',
        'bg-purple-500'
    ];

    return (
        <main className="col-span-4 p-6 grid grid-cols-1 gap-8 overflow-y-auto max-h-[85vh]">
            <section className="bg-white rounded-lg shadow-sm">
                <header className="p-6 border-b border-gray-200 flex justify-between items-center">
                    {/* Left side - Title with modern styling */}
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md"></div>
                            <div className="absolute inset-0 w-4 h-4 bg-orange-500 rounded-full animate-pulse opacity-50"></div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            Queue Analytics
                        </h2>
                        <div className="hidden sm:block w-px h-6 bg-slate-300"></div>
                        <span className="hidden sm:inline-block text-sm text-slate-500 font-medium">
                            Real-time insights
                        </span>
                    </div>

                    {/* Right side - Date controls and loading */}
                    <div className="flex items-center space-x-4">
                        {/* Date range container */}
                        <div className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm border border-slate-200/70">
                            <div className="flex items-center space-x-2 text-sm">
                                <label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    max={endDate}
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 
                             focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 
                             transition-all duration-200 bg-slate-50 hover:bg-white"
                                />
                            </div>

                            <div className="w-px h-6 bg-slate-300"></div>

                            <div className="flex items-center space-x-2 text-sm">
                                <label className="text-slate-600 font-medium text-xs uppercase tracking-wide">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    min={startDate}
                                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 
                             focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 
                             transition-all duration-200 bg-slate-50 hover:bg-white"
                                />
                            </div>
                        </div>

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex items-center space-x-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200/70">
                                <div className="relative">
                                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                                <span className="text-blue-600 font-medium text-sm">
                                    Loading...
                                </span>
                            </div>
                        )}


                    </div>

                </header>

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                        <p className="font-medium">Error loading data:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Total Queues Card */}
                    <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 shadow-lg border border-orange-200/50 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-400/20 to-orange-500/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-orange-700 font-semibold text-sm mb-1">Total Queues</h3>
                            <p className="text-2xl font-bold text-orange-800">{summary.totalQueues}</p>
                        </div>
                    </div>

                    {/* Total Guests Card */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-lg border border-blue-200/50 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-400/20 to-blue-500/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-blue-700 font-semibold text-sm mb-1">Total Guests</h3>
                            <p className="text-2xl font-bold text-blue-800">{summary.totalGuests}</p>
                        </div>
                    </div>

                    {/* Cancelled Card */}
                    <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 shadow-lg border border-red-200/50 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-400/20 to-red-500/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-red-700 font-semibold text-sm mb-1">Cancelled</h3>
                            <p className="text-2xl font-bold text-red-800">{summary.cancelled}</p>
                        </div>
                    </div>

                    {/* Peak Hour Card */}
                    <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-lg border border-green-200/50 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-400/20 to-green-500/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-green-700 font-semibold text-sm mb-1">Peak Hour</h3>
                            <p className="text-lg font-bold text-green-800 leading-tight">{summary.peakHour}</p>
                        </div>
                    </div>

                    {/* Top Table Card */}
                    <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 shadow-lg border border-purple-200/50 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-400/20 to-purple-500/10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-purple-700 font-semibold text-sm mb-1">Top Table</h3>
                            <p className="text-2xl font-bold text-purple-800">{summary.mostTable}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-sm">📄 All Queues</h3>
                    <button
                        onClick={handleDownloadCSV}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                        Download CSV
                    </button>
                </div>

                {allQueues.length > 0 ? (
                    <div className="p-4 overflow-y-auto max-h-[70vh]">
                        {/* Table Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="grid grid-cols-5 gap-4">
                                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                                        👤 Name
                                    </div>
                                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                                        📞 Phone
                                    </div>
                                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                                        📧 Email
                                    </div>
                                    <div className="font-semibold text-gray-700 flex items-center gap-2">
                                        👥 Guests
                                    </div>
                                    <div className="font-semibold text-gray-700 text-center">Status</div>
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-100">
                                {allQueues.map((q, index) => (
                                    <div
                                        key={q.id}
                                        className={`px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                            }`}
                                    >
                                        <div className="grid grid-cols-5 gap-4 items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                    👤
                                                </div>
                                                <span className="font-medium text-gray-800">{q.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">{q.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 break-words max-w-full overflow-hidden">{q.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                    {q.guests_count} guests
                                                </div>
                                            </div>
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 ${getStatusColor(q.status)}`}>
                                                    {q.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {allQueues.length === 0 && (
                                    <div className="px-6 py-16 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            📋
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No queues found</h3>
                                        <p className="text-gray-500">Start by adding your first queue to the system</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No queues available for the selected range
                    </div>
                )}
            </section>


            <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-sm mb-2">📅 Queues Created Over Time</h3>
                <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-xl border border-slate-200/50 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-orange-500/5 to-red-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart
                                data={queuesOverTime}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                                <defs>
                                    {/* Gradient for the line */}
                                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="50%" stopColor="#ea580c" />
                                        <stop offset="100%" stopColor="#dc2626" />
                                    </linearGradient>

                                    {/* Gradient for the area under the line */}
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="50%" stopColor="#f97316" stopOpacity={0.1} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>

                                    {/* Glow effect for line */}
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>

                                    {/* Drop shadow for dots */}
                                    <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
                                    </filter>
                                </defs>

                                {/* Modern grid with subtle styling */}
                                <CartesianGrid
                                    strokeDasharray="2 4"
                                    stroke="rgba(148, 163, 184, 0.2)"
                                    strokeWidth={1}
                                />

                                {/* Enhanced X-axis */}
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => dayjs(value).format('MMM DD')}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: '#64748b',
                                        fontSize: 12,
                                        fontWeight: '500'
                                    }}
                                    dy={10}
                                />

                                {/* Enhanced Y-axis */}
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: '#64748b',
                                        fontSize: 12,
                                        fontWeight: '500'
                                    }}
                                    dx={-10}
                                />

                                {/* Modern tooltip */}
                                <Tooltip
                                    labelFormatter={(value) => dayjs(value).format('MMMM DD, YYYY')}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        backdropFilter: 'blur(16px)',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        padding: '12px 16px'
                                    }}
                                    labelStyle={{
                                        color: '#374151',
                                        fontWeight: '600',
                                        marginBottom: '4px'
                                    }}
                                    itemStyle={{
                                        color: '#f97316',
                                        fontWeight: '600'
                                    }}
                                    cursor={{
                                        stroke: '#f97316',
                                        strokeWidth: 2,
                                        strokeOpacity: 0.3,
                                        strokeDasharray: '4 4'
                                    }}
                                />

                                {/* Area fill under the line */}
                                <defs>
                                    <clipPath id="areaClip">
                                        <rect x="0" y="0" width="100%" height="100%" />
                                    </clipPath>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="queues"
                                    stroke="none"
                                    fill="url(#areaGradient)"
                                    fillOpacity={1}
                                    clipPath="url(#areaClip)"
                                />

                                {/* Main line with modern styling */}
                                <Line
                                    type="monotone"
                                    dataKey="queues"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={3}
                                    filter="url(#glow)"
                                    dot={{
                                        fill: '#f97316',
                                        stroke: '#fff',
                                        strokeWidth: 3,
                                        r: 5,
                                        filter: 'url(#dotShadow)'
                                    }}
                                    activeDot={{
                                        r: 8,
                                        fill: '#f97316',
                                        stroke: '#fff',
                                        strokeWidth: 4,
                                        filter: 'url(#dotShadow)',
                                        style: {
                                            filter: 'drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4))'
                                        }
                                    }}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Modern legend/info bar */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-md"></div>
                                    <span className="text-sm font-medium text-slate-700">Queue Activity</span>
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Real-time data</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-sm mb-2">🧑‍🤝‍🧑 Guest Volume Over Time</h3>
                <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-xl border border-slate-200/50 overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={guestsOverTime}
                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                barCategoryGap="20%"
                            >
                                <defs>
                                    {/* Gradient for the bars */}
                                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#2563eb" />
                                        <stop offset="100%" stopColor="#1d4ed8" />
                                    </linearGradient>

                                    {/* Hover gradient */}
                                    <linearGradient id="barHoverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#60a5fa" />
                                        <stop offset="50%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#2563eb" />
                                    </linearGradient>

                                    {/* Drop shadow for bars */}
                                    <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
                                    </filter>

                                    {/* Glow effect for bars */}
                                    <filter id="barGlow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Modern grid with subtle styling */}
                                <CartesianGrid
                                    strokeDasharray="2 4"
                                    stroke="rgba(148, 163, 184, 0.2)"
                                    strokeWidth={1}
                                    horizontal={true}
                                    vertical={false}
                                />

                                {/* Enhanced X-axis */}
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => dayjs(value).format('MMM DD')}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: '#64748b',
                                        fontSize: 12,
                                        fontWeight: '500'
                                    }}
                                    dy={10}
                                />

                                {/* Enhanced Y-axis */}
                                <YAxis
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: '#64748b',
                                        fontSize: 12,
                                        fontWeight: '500'
                                    }}
                                    dx={-10}
                                />

                                {/* Modern tooltip */}
                                <Tooltip
                                    labelFormatter={(value) => dayjs(value).format('MMMM DD, YYYY')}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        backdropFilter: 'blur(16px)',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        padding: '12px 16px'
                                    }}
                                    labelStyle={{
                                        color: '#374151',
                                        fontWeight: '600',
                                        marginBottom: '4px'
                                    }}
                                    itemStyle={{
                                        color: '#3b82f6',
                                        fontWeight: '600'
                                    }}
                                    cursor={{
                                        fill: 'rgba(59, 130, 246, 0.1)',
                                        stroke: '#3b82f6',
                                        strokeWidth: 2,
                                        strokeOpacity: 0.3,
                                        strokeDasharray: '4 4'
                                    }}
                                />

                                {/* Modern bar with gradients and effects */}
                                <Bar
                                    dataKey="guests"
                                    fill="url(#barGradient)"
                                    radius={[6, 6, 0, 0]}
                                    filter="url(#barShadow)"
                                    animationDuration={1200}
                                    animationEasing="ease-out"
                                >
                                    {guestsOverTime.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill="url(#barGradient)"
                                            stroke="rgba(255, 255, 255, 0.8)"
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        {/* Modern legend/info bar */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-blue-500 to-blue-600 shadow-md"></div>
                                    <span className="text-sm font-medium text-slate-700">Guest Activity</span>
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Real-time data</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-sm mb-2">📊 Queue Status Breakdown</h3>
                {statusDistribution.length > 0 ? (
                    <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 shadow-xl border border-slate-200/50">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-cyan-500/10 rounded-full blur-xl"></div>

                        <div className="relative z-10">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <defs>
                                        {/* Gradient definitions for modern look */}
                                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#1d4ed8" />
                                        </linearGradient>
                                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="#059669" />
                                        </linearGradient>
                                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#d97706" />
                                        </linearGradient>
                                        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ef4444" />
                                            <stop offset="100%" stopColor="#dc2626" />
                                        </linearGradient>
                                        <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#7c3aed" />
                                        </linearGradient>
                                        <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#06b6d4" />
                                            <stop offset="100%" stopColor="#0891b2" />
                                        </linearGradient>

                                        {/* Drop shadow filter */}
                                        <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15" />
                                        </filter>
                                    </defs>

                                    <Pie
                                        data={statusDistribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        innerRadius={60}
                                        paddingAngle={2}
                                        animationDuration={1200}
                                        animationBegin={0}
                                        label={({ name, percent }) =>
                                            percent > 0.05 ? `${(percent * 100).toFixed(1)}%` : ''
                                        }
                                        labelLine={false}
                                        filter="url(#dropshadow)"
                                    >
                                        {statusDistribution.map((entry, index) => {
                                            const gradients = ['url(#gradient1)', 'url(#gradient2)', 'url(#gradient3)', 'url(#gradient4)', 'url(#gradient5)', 'url(#gradient6)'];
                                            return (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={gradients[index % gradients.length]}
                                                    stroke="rgba(255,255,255,0.8)"
                                                    strokeWidth={2}
                                                />
                                            );
                                        })}
                                    </Pie>

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            backdropFilter: 'blur(10px)',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Custom Legend */}
                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                {statusDistribution.map((entry, index) => {
                                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                                    return (
                                        <div key={entry.name} className="flex items-center gap-2 group cursor-pointer">
                                            <div
                                                className="w-4 h-4 rounded-full shadow-md group-hover:scale-110 transition-transform duration-200"
                                                style={{
                                                    background: `linear-gradient(135deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)`
                                                }}
                                            ></div>
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                                {entry.name}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                ({entry.value})
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="relative">
                            {/* Animated background circles */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 border-4 border-slate-200 rounded-full animate-pulse"></div>
                                <div className="absolute w-20 h-20 border-2 border-slate-300 rounded-full animate-ping"></div>
                            </div>

                            {/* Empty state icon */}
                            <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                            No Data Available
                        </h3>
                        <p className="text-slate-500 text-center max-w-sm leading-relaxed">
                            No status data available for the selected date range. Try adjusting your filters or date selection.
                        </p>
                    </div>
                )}
            </section>
        </main>
    )
}