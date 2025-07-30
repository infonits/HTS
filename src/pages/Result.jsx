import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/guestContext';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export default function Result() {
    const [reservationDetails, setReservationDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [position, setPosition] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);

    const { reservationId, restDetails } = useGuest();
    const navigate = useNavigate();

    /** ----------------------
     * Fetch reservation + subscribe to realtime updates
     ----------------------- */
    useEffect(() => {
        if (!reservationId) return;

        const fetchReservation = async () => {
            const { data, error } = await supabase
                .from('queues')
                .select('*, tables(*)')
                .eq('id', reservationId)
                .single();

            if (error || !data) {
                setErrorMsg("No reservation found for this ID.");
            } else {
                setReservationDetails(data);
                await fetchQueuePosition();
            }
            setLoading(false);
        };

        fetchReservation();

        const subscription = supabase
            .channel('reservation-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'queues',
                    filter: `id=eq.${reservationId}`,
                },
                async () => {
                    const { data, error } = await supabase
                        .from('queues')
                        .select('*, tables(*)')
                        .eq('id', reservationId)
                        .single();

                    if (!error) setReservationDetails(data);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'queues' },
                async () => {
                    await fetchQueuePosition();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [reservationId]);

    /** ----------------------
     * Warn user before leaving if still waiting
     ----------------------- */
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (reservationDetails?.status === 'waiting') {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        if (reservationDetails?.status === 'waiting') {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [reservationDetails?.status]);

    /** ----------------------
     * Handle cancel/back home
     ----------------------- */
    const handleBackHome = async () => {
        if (reservationDetails?.status === 'waiting') {
            const confirmed = window.confirm(
                "You're already in queue. Are you sure you want to cancel this?"
            );
            if (!confirmed) return;

            await supabase
                .from('queues')
                .update({ status: 'cancelled' })
                .eq('id', reservationId);
        }

        localStorage.removeItem('reservationId');
        navigate(`/rest/${restDetails.slug}`);
    };

    /** ----------------------
     * Helpers
     ----------------------- */
    const formatTime = (timeStr) => dayjs(timeStr).format('hh:mm A');

    const isTodayOrLateNight = (createdAt) => {
        const created = dayjs.utc(createdAt).tz('Asia/Colombo');
        const now = dayjs().tz('Asia/Colombo');

        // Allow until 3 AM next day for 11:59 PM bookings
        if (created.isSame(now, 'day')) return true;
        if (
            created.isSame(now.subtract(1, 'day'), 'day') &&
            created.hour() === 23 &&
            now.hour() <= 3
        )
            return true;

        return false;
    };

    const fetchQueuePosition = async () => {
        if (!reservationId) return;

        const today = dayjs().startOf('day').toISOString();
        const { data, error } = await supabase
            .from('queues')
            .select('*')
            .eq('status', 'waiting')
            .gte('created_at', today)
            .order('created_at', { ascending: true });

        if (error) return;

        const index = data.findIndex((q) => q.id === reservationId);
        if (index === -1) {
            setPosition(null);
            setEstimatedTime(null);
        } else {
            setPosition(index + 1);
            setEstimatedTime((index + 1) * 10);
        }
    };

    /** ----------------------
     * Render States
     ----------------------- */
    if (loading)
        return <div className="text-center mt-10 text-gray-500">Loading reservation...</div>;
    if (errorMsg)
        return <div className="text-center mt-10 text-red-500">{errorMsg}</div>;
    if (!reservationDetails)
        return <div className="text-center mt-10 text-red-500">Something went wrong.</div>;

    const { id, created_at, guests_count, name, phone, status } = reservationDetails;
    const expired = !isTodayOrLateNight(created_at);

    /** ----------------------
     * UI Rendering
     ----------------------- */
    return (
        <div className="w-full">
            {/* Status Card */}
            <div className="flex items-center justify-center mt-4">
                <div className="shadow-black/5 border border-white/20 max-w-md w-full">
                    <div className="flex flex-col items-center gap-6 justify-center">
                        {/* Status Icon */}
                        {status === 'waiting' && !expired && (
                            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-green-100 animate-pulse">
                                <Icon icon="mdi:check" className="text-white w-10 h-10" />
                                <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 blur-xl animate-ping"></div>
                            </div>
                        )}
                        {status === 'cancelled' && (
                            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-red-100">
                                <Icon icon="mdi:close" className="text-white w-10 h-10" />
                            </div>
                        )}
                        {status === 'assigned' && (
                            <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl px-8 py-6 shadow-xl shadow-green-500/20 w-fit mx-auto ring-4 ring-green-100">
                                <div className="flex items-center justify-center gap-3">
                                    <Icon icon="mdi:coffee" className="text-white w-5 h-5" />
                                    <span className="text-white text-2xl font-bold">
                                        {reservationDetails?.tables?.name}
                                    </span>
                                </div>
                            </div>
                        )}
                        {status === 'completed' && (
                            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-orange-100">
                                <Icon icon="mdi:coffee" className="text-white w-10 h-10" />
                            </div>
                        )}

                        {/* Status Text */}
                        <div className="text-center space-y-3">
                            {status === 'waiting' && !expired && (
                                <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    You're Added to the Queue
                                </p>
                            )}
                            {status === 'cancelled' && (
                                <p className="text-xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                    Your reservation has been cancelled
                                </p>
                            )}
                            {status === 'assigned' && (
                                <div>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                        Your table is ready!
                                    </p>
                                    <p className="text-slate-600 text-lg font-medium mt-2">
                                        Kindly take your seat.
                                    </p>
                                </div>
                            )}
                            {status === 'completed' && (
                                <p className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                    Thank you for visiting us.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Queue Reference & Details Card */}
            <div className="p-3 text-center bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-inner border border-slate-100 mt-6">
                {status !== 'cancelled' && status !== 'completed' && (
                    <div className="mb-6">
                        <p className="text-orange-500 text-sm font-semibold mb-3 uppercase tracking-wide flex items-center justify-center gap-2">
                            <Icon icon="mdi:tag" className="text-orange-600 text-xs" />
                            Queue Reference
                        </p>
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl px-6 py-4 shadow-lg shadow-orange-500/20">
                            <p className="text-4xl font-bold tracking-wider">#Q{id}</p>
                        </div>
                    </div>
                )}

                {!expired && status === 'waiting' && estimatedTime && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 mb-6 border border-orange-100 shadow-sm">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Icon icon="mdi:clock-outline" className="w-4 h-4 text-orange-600 animate-spin" />
                            <p className="text-lg font-bold text-orange-800">You are in the queue</p>
                        </div>
                        <p className="text-orange-600 font-medium">
                            Estimated wait time: {estimatedTime} minutes
                        </p>
                    </div>
                )}

                {/* Details */}
                <div className="space-y-3">
                    {[
                        { label: 'Name', value: name || 'N/A', icon: 'mdi:account' },
                        { label: 'Phone', value: phone || 'N/A', icon: 'mdi:phone' },
                        { label: 'Requested Time', value: formatTime(created_at), icon: 'mdi:clock-outline' },
                        { label: 'Guest Count', value: `${guests_count} People`, icon: 'mdi:account-group' },
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Icon icon={item.icon} className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <p className="font-semibold text-slate-600">{item.label}</p>
                                </div>
                                <p className="font-bold text-slate-800">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-4">
                <button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 rounded-xl font-medium text-lg transition-colors"
                    onClick={handleBackHome}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
