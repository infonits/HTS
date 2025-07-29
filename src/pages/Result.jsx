import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/guestContext';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs'; // npm install dayjs
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export default function Result() {
    const [show, setShow] = useState(false);
    const { reservationId } = useGuest();
    const [reservationDetails, setReservationDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [position, setPosition] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!reservationId) return;

        const fetchReservation = async () => {
            const { data, error } = await supabase
                .from('queues')
                .select('*,tables(*)')
                .eq('id', reservationId)
                .single();

            if (error || !data) {
                console.error("Error fetching reservation:", error);
                setErrorMsg("No reservation found for this ID.");
                setLoading(false);
            } else {
                setReservationDetails(data);
                await fetchQueuePosition();

                setLoading(false);
            }
        };

        fetchReservation();

        // Realtime subscription
        const subscription = supabase
            .channel('reservation-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'queues',
                    filter: `id=eq.${reservationId}`
                },
                async () => {
                    console.log("🔁 Realtime update received");
                    const { data, error } = await supabase
                        .from('queues')
                        .select('*, tables(*)')
                        .eq('id', reservationId)
                        .single();

                    if (error) {
                        console.error("Error refetching after update:", error);
                        return;
                    }

                    setReservationDetails(data);
                }
            ).on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'queues',
                },
                async () => {
                    console.log("📦 Another reservation changed");
                    await fetchQueuePosition(); // recalculate even if others change
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [reservationId]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // 👇 Only trigger if still waiting
            if (reservationDetails?.status === 'waiting') {
                e.preventDefault();
                e.returnValue = ''; // Required for Chrome/Edge
            }
        };

        // Add only if 'waiting'
        if (reservationDetails?.status === 'waiting') {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        // Cleanup
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [reservationDetails?.status]);



    const handleBackHome = async () => {
        // Only show confirm if still in waiting status
        if (reservationDetails?.status === 'waiting') {
            const confirmed = window.confirm("You're already in queue. Are you sure you want to cancel this?");

            if (!confirmed) return;

            const { error } = await supabase
                .from('queues')
                .update({ status: 'cancelled' })
                .eq('id', reservationId);

            if (error) {
                console.error("Failed to cancel reservation:", error.message);
            }
        }

        localStorage.removeItem("reservationId");
        navigate('/user');
    };



    const formatTime = (timeStr) => {
        return dayjs(timeStr).format('hh:mm A');
    };

    const isTodayOrLateNight = (createdAt) => {
        const created = dayjs.utc(createdAt).tz('Asia/Colombo');
        const now = dayjs().tz('Asia/Colombo');



        // Allow until 3 AM next day for 11:59 PM bookings
        if (created.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
            console.log('checked ');

            return true;
        }
        if (
            created.format('YYYY-MM-DD') === now.subtract(1, 'day').format('YYYY-MM-DD') &&
            created.hour() === 23 &&
            now.hour() <= 3
        ) {
            return true;
        }
        return false;
    };
    const fetchQueuePosition = async () => {
        if (!reservationId) return;
        // console.log("Queue list:", data, "Your ID:", reservationId);

        const today = dayjs().startOf('day').toISOString();

        const { data, error } = await supabase
            .from('queues')
            .select('*')
            .eq('status', 'waiting')
            .gte('created_at', today)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching waiting queues:', error);
            return;
        }

        const index = data.findIndex(q => q.id === reservationId);

        if (index === -1) {
            setEstimatedTime(null); // Or maybe "Already served" or "Table assigned"
            setPosition(null);
            return;
        }

        setPosition(index + 1);
        setEstimatedTime((index + 1) * 10);

    };
    if (loading) {
        return <div className="text-center mt-10 text-gray-500">Loading your reservation details...</div>;
    }

    if (errorMsg) {
        return <div className="text-center mt-10 text-red-500">{errorMsg}</div>;
    }

    if (!reservationDetails) {
        return <div className="text-center mt-10 text-red-500">Something went wrong.</div>;
    }

    const {
        id,
        created_at,
        guests_count,
        name,
        phone,
        status
    } = reservationDetails;

    const expired = !isTodayOrLateNight(created_at);

    return (
        <div className='w-full'>
            {/* Success Icon */}




            {expired ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm mb-2">
                    <Icon
                        icon="heroicons-solid:exclamation"
                        className="h-6 w-6 shrink-0 text-red-600"
                    />
                    <p className="text-sm font-medium text-red-700">
                        This reservation has expired
                    </p>
                </div>
            ) : (
                <div>
                    <div className="flex flex-col items-center gap-2 justify-center mb-4">
                        {status === 'waiting' && !expired && <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center"><Icon
                            icon="qlementine-icons:check-tick-16"
                            className="text-white w-10 h-10"
                        /></div>}
                        {status === 'cancelled' && <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center"><Icon
                            icon="mdi:cancel-circle-outline"
                            className="text-white w-10 h-10"
                        /></div>}
                        {status === 'assigned' && <div className="flex flex-col items-center gap-2 bg-green-700 rounded-2xl px-4 py-3 shadow-md w-fit mx-auto">
                            <div className="flex items-center justify-center gap-2">
                                <Icon
                                    icon="ic:round-table-bar"
                                    className="text-white w-6 h-6"
                                />
                                <span className="text-white text-xl font-semibold">
                                    {reservationDetails?.tables?.name}
                                </span>
                            </div>
                        </div>
                        }
                        {status === 'completed' && <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center"><Icon
                            icon="arcticons:fossify-thankyou"
                            className="text-white w-10 h-10"
                        /></div>}
                        <p className="text-gray-500 text-lg font-semibold">
                            {status === 'waiting' && !expired && "You’re Added to the Queue"}
                            {status === 'cancelled' && "Your reservation has been cancelled"}
                            {status === 'assigned' && <span><span className='text-2xl'>Thank you!</span> <br /> You can now have a seat <br />at the <span className='font-bold'>Table {reservationDetails?.tables?.name}</span>.</span>}
                            {status === 'completed' && <span>Thank you for visiting us.</span>}

                        </p>
                    </div>
                </div>
            )}


            {/* Reservation Details Card */}

            <div className="shadow-lg rounded-2xl p-3 text-center border border-gray-100">
                <div className="mb-4">
                    <p className="text-orange-600 text-md font-medium mb-1">Queue Reference</p>
                    <p className="text-4xl font-bold text-orange-600">#Q{id}</p>
                </div>

                {!expired && status == 'waiting' && (
                    <div className='bg-orange-100 rounded-2xl p-2'>
                        <p className="text-md font-semibold text-gray-800">You are in the queue</p>
                        {status === 'waiting' && estimatedTime !== null
                            ? `Estimated wait time: ${estimatedTime} minutes`
                            : null}




                    </div>
                )}
                <div className='p-1'>
                    <hr className='border-gray-100 mt-2' />

                    <div className="flex justify-between">
                        <p className='font-medium text-gray-600'>Name</p>
                        <p className='font-medium'>{name || 'N/A'}</p>
                    </div>
                    <hr className='border-gray-100 mt-2' />

                </div>

                <div className='p-1'>
                    <div className="flex justify-between">
                        <p className='font-medium text-gray-600'>Phone</p>
                        <p className='font-medium'>{phone || 'N/A'}</p>
                    </div>
                    <hr className='border-gray-100 mt-2' />
                </div>
                <div className='p-1'>

                    <div className="flex justify-between">
                        <p className='font-medium text-gray-600'>Requested Time</p>
                        <p className='font-medium'>{formatTime(created_at)}</p>
                    </div>
                    <hr className='border-gray-100 mt-2' />
                </div>

                <div className='p-1'>
                    <div className="flex justify-between">
                        <p className='font-medium text-gray-600'>Guest Count</p>
                        <p className='font-medium'>{guests_count} People</p>

                    </div>

                </div>


            </div>


            {/* Action Button */}
            <div className="mt-3 space-y-3">
                <button
                    className="w-full bg-orange-500 text-white py-2 rounded-xl font-normal text-lg hover:bg-orange-600 transition-colors"
                    onClick={handleBackHome}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
