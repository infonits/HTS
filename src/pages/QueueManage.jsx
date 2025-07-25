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


            <section className="bg-white rounded-lg shadow-sm overflow-y-auto max-h-[75vh]">
                <header className="p-6 border-b border-gray-200">
                    <h2 className="font-semibold flex items-center space-x-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full" /> <span>Pending Queues</span>
                    </h2>
                </header>
                <div className="p-6 space-y-4">
                    {queues
                        .filter(q => q.table_id === null)
                        .map(q => (
                            <div
                                key={q.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, q)}

                                className="bg-gradient-to-br from-orange-400 to-red-500  text-white p-4 rounded-lg cursor-move hover:bg-orange-800 transition relative"
                            >
                                <button className="absolute top-2 right-2" onClick={() => declineQueue(q.id)} title="Decline">
                                    <Icon icon="material-symbols:close-rounded" className='h-4 w-4' />
                                </button>
                                <div className="flex lg:flex-row flex-col  justify-between items-center text-base font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-lg text-white/60">#Q{q.id}</span> {/* Short ID */}
                                        <span className="text-white font-semibold">{q.name}</span>
                                    </div>
                                    <span className="text-sm text-white/70 flex items-center gap-1">
                                        <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                                        {formatTime(q.created_at)}
                                    </span>

                                </div>

                                <div className='flex lg:flex-row flex-col  gap-3'>
                                    <div className="flex items-center mt-1 text-base">
                                        <Icon icon="mdi:account-group" className="w-4 h-4 mr-1" />
                                        {q.guests_count} People
                                    </div>

                                    <div className="text-base mt-1 italic flex justify-left items-center">
                                        <Icon icon="gg:sand-clock" className='h-4 w-4' />
                                        {formatDuration(q.created_at)}
                                    </div>

                                </div>

                            </div>
                        ))}
                    {queues.length === 0 && <p className="text-gray-400 text-base">No queues for today 🎉</p>}
                </div>
            </section>

            {/* capacity sections */}
            <section className="md:col-span-2 xl:col-span-3 overflow-y-auto max-h-[75vh]">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {Object.keys(grouped).sort((a, b) => a - b).map(cap => (
                        <div key={cap} className="bg-white rounded-lg shadow-sm">
                            {/* ── header row ── */}
                            <header className="p-3 bg-slate-200 flex justify-between items-center">
                                <h3 className="font-semibold text-lg">{cap}-Seater Tables</h3>
                                <span className="text-sm text-gray-500">
                                    {grouped[cap].length} tables
                                </span>
                            </header>

                            {/* ── table boxes ── */}
                            <div className="p-4 grid md:grid-cols-1 lg:grid-cols-2  xl:grid-cols-3 gap-4">
                                {grouped[cap].map(tbl => {
                                    const occupied = assigned.find(a => a.table_id === tbl.id);
                                    return (
                                        <div
                                            key={tbl.id}
                                            onDrop={e => !occupied && handleDrop(e, tbl.id)}
                                            onDragOver={handleDragOver}

                                            className={`relative rounded-lg text-center h-20 flex items-center justify-center
                         border-2 border-dashed ${tbl.color.replace('500', '300')}
                         ${occupied ? tbl.color : 'bg-gray-50'} transition`}
                                        >
                                            {/* empty slot */}
                                            {!occupied && (
                                                <span className=" text-gray-400 text-sm select-none text-center">
                                                    Table {tbl.name}
                                                </span>
                                            )}

                                            {/* occupied slot */}
                                            {occupied && (
                                                <>
                                                    <div className="text-white text-center space-y-1">
                                                        <p className="text-base font-medium truncate">{occupied.name}</p>
                                                        <p className="text-xs opacity-80 flex items-center justify-center gap-1">
                                                            <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                                                            {formatTime(occupied.created_at)}
                                                        </p>
                                                    </div>

                                                    {/* clear button */}
                                                    <button
                                                        onClick={() => completeQueue(occupied.id)}
                                                        className="absolute top-1 right-1 text-white hover:text-green-200"
                                                        title="Clear / complete"
                                                    >
                                                        <Icon icon="mdi:check-circle-outline" className="w-6 h-6" />
                                                    </button>
                                                </>
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
