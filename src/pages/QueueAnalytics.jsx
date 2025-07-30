import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import dayjs from 'dayjs'
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
    Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useAdminAuth } from '../context/adminAuthContext'

export default function QueueAnalytics() {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
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
                    <h2 className="font-semibold flex items-center space-x-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span>Queue Analytics</span>
                    </h2>
                    <div className="space-x-2 text-sm">
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            max={endDate}
                            className="border rounded px-2 py-1"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            min={startDate}
                            className="border rounded px-2 py-1"
                        />
                        {loading && <span className="text-blue-500">Loading...</span>}
                    </div>
                </header>

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                        <p className="font-medium">Error loading data:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm font-semibold">
                    <div className="bg-orange-100 p-4 rounded shadow">
                        📋 Total Queues<br />
                        <span className="text-lg">{summary.totalQueues}</span>
                    </div>
                    <div className="bg-blue-100 p-4 rounded shadow">
                        👥 Total Guests<br />
                        <span className="text-lg">{summary.totalGuests}</span>
                    </div>
                    <div className="bg-red-100 p-4 rounded shadow">
                        ❌ Cancelled<br />
                        <span className="text-lg">{summary.cancelled}</span>
                    </div>
                    <div className="bg-lime-100 p-4 rounded shadow">
                        📈 Peak Hour<br />
                        <span className="text-xs">{summary.peakHour}</span>
                    </div>
                    <div className="bg-purple-100 p-4 rounded shadow">
                        🪑 Top Table<br />
                        <span className="text-lg">{summary.mostTable}</span>
                    </div>
                </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-sm mb-2">📅 Queues Created Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={queuesOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => dayjs(value).format('MMM DD')}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            labelFormatter={(value) => dayjs(value).format('MMMM DD, YYYY')}
                        />
                        <Line type="monotone" dataKey="queues" stroke="#f97316" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-sm mb-2">🧑‍🤝‍🧑 Guest Volume Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={guestsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => dayjs(value).format('MMM DD')}
                        />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                            labelFormatter={(value) => dayjs(value).format('MMMM DD, YYYY')}
                        />
                        <Bar dataKey="guests" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            <section className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-sm mb-2">📊 Queue Status Breakdown</h3>
                {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={100}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No status data available for the selected date range
                    </div>
                )}
            </section>
        </main>
    )
}