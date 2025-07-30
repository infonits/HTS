import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient';
import { Icon } from '@iconify/react';
import { useQueue } from '../context/queueContext';

const COLOR_OPTIONS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-purple-500'
];

export default function QueueManage() {


    const [newTable, setNewTable] = useState({ name: '', capacity: 2, color: COLOR_OPTIONS[0] });

    const {
        queues,
        tables,
        assigned,
        currentTime,
        setQueues,
        setAssigned
    } = useQueue();

    const grouped = useMemo(() => {
        const g = {};
        tables.forEach(t => {
            g[t.capacity] ??= [];
            g[t.capacity].push(t);
        });
        return g;
    }, [tables]);



    const formatTime = (iso) => {
        const d = new Date(iso);
        let h = d.getHours() % 12 || 12;
        const m = String(d.getMinutes()).padStart(2, '0');
        const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
        return `${h}.${m}${ampm}`;
    };

    const formatDuration = (startTime) => {
        const created = new Date(startTime);
        const diff = Math.floor((currentTime - created) / 1000); // in seconds
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
    };
    const handleDragStart = (e, queue) => {
        e.dataTransfer.setData('application/json', JSON.stringify(queue));
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };


    const handleDrop = async (e, tableId) => {
        e.preventDefault();
        // const queue = JSON.parse(e.dataTransfer.getData('text/plain'));
        const queue = JSON.parse(e.dataTransfer.getData('application/json'));

        // Remove from UI
        setQueues(prev => prev.filter(q => q.id !== queue.id));

        // Add to assigned (optimistic UI)
        const updatedQueue = { ...queue, table_id: tableId };
        setAssigned(prev => [...prev, updatedQueue]);

        // Update in Supabase
        const { error } = await supabase
            .from('queues')
            .update({ table_id: tableId, status: 'assigned' })
            .eq('id', queue.id);

        if (error) {
            console.error('Failed to update queue table_id:', error);
            // Optional: Revert UI changes if needed
        }
    };
    const declineQueue = async (id) => {
        // Optimistic update: remove from UI
        setQueues(prev => prev.filter(q => q.id !== id));

        // Update status in Supabase
        const { error } = await supabase
            .from('queues')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (error) {
            console.error('Failed to cancel queue:', error);
            // Optional: restore in UI
        }
    };
    const completeQueue = async (id) => {
        setAssigned(prev => prev.filter(q => q.id !== id));

        const { error } = await supabase
            .from('queues')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) {
            console.error('Failed to complete queue:', error);
            // Optional: restore in UI
        }
    };
    return (
        <main className="min-h-full p-6 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">


            <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-y-auto max-h-[75vh]">
                <style jsx>{`
        @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }
        .animate-marquee {
            animation: marquee 4s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
    `}</style>
                {/* Clean Header */}
                <header className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                            <h2 className="text-lg font-semibold text-gray-900">Pending Queues</h2>
                        </div>
                        <span className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                            {queues.filter(q => q.table_id === null).length} waiting
                        </span>
                    </div>
                </header>

                {/* Queue List */}
                <div className="p-3 sm:p-4">
                    {queues
                        .filter(q => q.table_id === null)
                        .map(q => (
                            <div
                                key={q.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, q)}
                                className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg p-4 mb-3 cursor-move hover:from-orange-500 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                            >
                                {/* Top row - ID, Name, Decline */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                        <span className="text-orange-200 text-sm font-medium whitespace-nowrap">#{q.id}</span>
                                        <div className="flex-1 min-w-0">
                                            {q.name.length > 10 ? (
                                                <div className="overflow-hidden whitespace-nowrap">
                                                    <span className="text-white font-semibold text-base sm:text-lg inline-block animate-marquee">
                                                        {q.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-white font-semibold text-base sm:text-lg">{q.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => declineQueue(q.id)}
                                        className="text-white hover:text-red-200 transition-colors p-1 flex-shrink-0 ml-2"
                                        title="Decline"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Bottom row - Details */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="flex items-center gap-1 text-orange-100">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="whitespace-nowrap">{q.guests_count} people</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-100">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="whitespace-nowrap">{formatDuration(q.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="text-orange-200 text-xs whitespace-nowrap">
                                        {formatTime(q.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}

                    {/* Empty state */}
                    {queues.filter(q => q.table_id === null).length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                            <p className="text-gray-600">No pending queues for today 🎉</p>
                        </div>
                    )}
                </div>
            </section>

            {/* capacity sections */}
            <section className="md:col-span-2 xl:col-span-3 overflow-y-auto max-h-[75vh] pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(grouped).sort((a, b) => a - b).map(cap => (
                        <div key={cap} className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                            {/* Modern header */}
                            <header className="p-5 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300/50">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-800">{cap}-Seater Tables</h3>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-slate-600 shadow-sm border border-slate-200">
                                            {grouped[cap].length} tables
                                        </span>
                                    </div>
                                </div>
                            </header>

                            {/* Table grid */}
                            <div className="p-6 grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {grouped[cap].map(tbl => {
                                    const occupied = assigned.find(a => a.table_id === tbl.id);
                                    return (
                                        <div
                                            key={tbl.id}
                                            onDrop={e => !occupied && handleDrop(e, tbl.id)}
                                            onDragOver={handleDragOver}
                                            className={`relative rounded-2xl h-24 flex items-center justify-center
                                          border-2 transition-all duration-300 group cursor-pointer
                                          ${occupied
                                                    ? `${tbl.color} border-transparent shadow-lg transform hover:scale-105`
                                                    : `bg-gradient-to-br from-slate-50 to-slate-100 border-dashed ${tbl.color.replace('500', '300')} hover:from-slate-100 hover:to-slate-200 hover:border-solid hover:shadow-md`
                                                }`}
                                        >
                                            {/* Empty slot */}
                                            {!occupied && (
                                                <div className="text-center space-y-1">
                                                    <div className="w-8 h-8 bg-slate-300 rounded-xl mx-auto flex items-center justify-center group-hover:bg-slate-400 transition-colors">
                                                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-slate-500 text-sm font-medium select-none">
                                                        Table {tbl.name}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Occupied slot */}
                                            {occupied && (
                                                <>
                                                    <div className="text-white text-center space-y-2 px-2">
                                                        <div className="w-10 h-10 bg-white/20 rounded-xl mx-auto flex items-center justify-center backdrop-blur-sm">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold truncate">#Q{occupied.id}</p>
                                                            <div className="flex items-center justify-center gap-1 text-xs opacity-90">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {formatTime(occupied.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Complete button */}
                                                    <button
                                                        onClick={() => completeQueue(occupied.id)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg 
                                                     flex items-center justify-center text-green-600 hover:text-green-700 
                                                     hover:shadow-xl transition-all duration-200 border-2 border-green-100
                                                     hover:scale-110 group/btn"
                                                        title="Complete reservation"
                                                    >
                                                        <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>

                                                    {/* Status indicator */}
                                                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-400 rounded-full 
                                                      border-2 border-white shadow-md animate-pulse"></div>
                                                </>
                                            )}

                                            {/* Drop zone indicator */}
                                            {!occupied && (
                                                <div className="absolute inset-0 rounded-2xl border-2 border-transparent 
                                                  group-hover:border-blue-400 group-hover:bg-blue-50/20 
                                                  transition-all duration-200 pointer-events-none"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>


        </main>
    )
}
