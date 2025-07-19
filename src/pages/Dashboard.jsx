import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Icon } from '@iconify/react/dist/iconify.js';


const COLOR_OPTIONS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-purple-500'
];

/* -------- util -------- */
const formatTime = (iso) => {
    const d = new Date(iso);
    let h = d.getHours() % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    return `${h}.${m}${ampm}`;            // 11.00AM
};

/* ===== COMPONENT ===== */
const Dashboard = () => {
    const [queues, setQueues] = useState([]);
    const [tables, setTables] = useState([]);          // from Supabase
    const [assigned, setAssigned] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newTable, setNewTable] = useState({ name: '', capacity: 2, color: COLOR_OPTIONS[0] });

    /* ------ fetch today’s queues & tables ------ */
    useEffect(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const fetchData = async () => {
            const [{ data: qData }, { data: tData }] = await Promise.all([
                supabase
                    .from('queues')
                    .select('*')
                    .in('status', ['waiting', 'assigned'])
                    .gte('created_at', start)
                    .lt('created_at', end)
                    .order('created_at'),
                supabase
                    .from('tables')
                    .select('*')
                    .order('created_at')
            ]);

            setQueues(qData || []);
            setTables(tData || []);

            // Assign those with table_id
            setAssigned((qData || []).filter(q => q.table_id));
        };

        fetchData();

        const subscription = supabase
            .channel('queues-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'queues'
                },
                (payload) => {
                    fetchData(); // Just reload queues on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);


    /* ------ drag helpers ------ */
    const handleDragStart = (e, queue) => e.dataTransfer.setData('text/plain', JSON.stringify(queue));
    const handleDrop = async (e, tableId) => {
        e.preventDefault();
        const queue = JSON.parse(e.dataTransfer.getData('text/plain'));

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

    const handleDragOver = (e) => e.preventDefault();

    /* ------ decline queue ------ */
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


    /* ------ add table ------ */
    const saveTable = async () => {
        const { data, error } = await supabase.from('tables').insert({
            name: newTable.name,
            capacity: newTable.capacity,
            color: newTable.color
        }).select().single();

        if (!error && data) setTables(prev => [...prev, data]);
        setShowAdd(false);
        setNewTable({ name: '', capacity: 2, color: COLOR_OPTIONS[0] });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-poppins">
            {/* header */}
            <header className="bg-white p-3 flex justify-between">
                <h1 className="text-3xl font-bold">Spice House</h1>
                <div className="text-right text-gray-600">
                    <div className="text-lg font-bold">{formatTime(new Date().toISOString())}</div>
                    <div className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
            </header>

            {/* body */}
            <div className="grid grid-cols-1 md:grid-cols-5">
                {/* stats */}
                <aside className="bg-white flex flex-col gap-4 px-4 py-6">
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                        <span>Active Queues</span><span className="font-bold text-orange-500">{queues.length}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between">
                        <span>Available Tables</span><span className="font-bold text-green-500">{tables.length}</span>
                    </div>
                </aside>

                {/* queues & tables */}
                <main className="col-span-4 p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* pending queues */}
                    <section className="bg-white rounded-lg shadow-sm">
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
                                        className="bg-orange-500 text-white p-4 rounded-lg cursor-move hover:bg-orange-600 transition relative"
                                    >
                                        <button className="absolute top-2 right-2" onClick={() => declineQueue(q.id)} title="Decline">
                                            <Icon icon="material-symbols:close-rounded" className='h-4 w-4' />
                                        </button>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-semibold">{q.name}</span>
                                            <span>{formatTime(q.created_at)}</span>
                                        </div>
                                        <div className="flex items-center mt-1 text-sm">
                                            <Icon icon="mdi:account-group" className="w-4 h-4 mr-1" />
                                            {q.guests_count} People
                                        </div>
                                    </div>
                                ))}
                            {queues.length === 0 && <p className="text-gray-400 text-sm">No queues for today 🎉</p>}
                        </div>
                    </section>

                    {/* table grid */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="flex justify-end">
                            <button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
                                + Add Table
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tables.map(t => (
                                <div key={t.id} className="bg-white rounded-lg shadow-sm">
                                    <header className="p-4 border-b border-gray-200 flex items-center space-x-3">
                                        <div className={`w-3 h-3 ${t.color} rounded-full`} />
                                        <h3 className="font-semibold">{t.name}</h3>
                                    </header>
                                    <div
                                        className={`p-6 min-h-48 border-2 border-dashed rounded-b-lg ${t.color.replace('500', '200')} `}
                                        onDrop={(e) => handleDrop(e, t.id)}
                                        onDragOver={handleDragOver}
                                    >
                                        {assigned.filter(a => a.table_id === t.id).map(a => (
                                            <div key={a.id} className="bg-green-800 text-white p-3 rounded-lg mb-3 relative">
                                                <div className="text-sm font-semibold">{a.name} k</div>
                                                <div className="text-xs">{formatTime(a.created_at)}</div>
                                                <button
                                                    className="absolute top-2 right-2 text-white"
                                                    title="Mark completed"
                                                    onClick={() => completeQueue(a.id)}
                                                >sdf
                                                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-white hover:text-green-300 transition" />
                                                </button>
                                            </div>
                                        ))}
                                        {assigned.filter(a => a.table_id === t.id).length === 0 && (
                                            <div className="flex justify-center items-center h-24 text-gray-400">
                                                Drop queues here
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>

            {/* add-table modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-80 space-y-4">
                        <h3 className="text-lg font-semibold">New Table</h3>
                        <input
                            type="text" placeholder="Name (e.g. 4-person)"
                            className="w-full border p-2 rounded"
                            value={newTable.name}
                            onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                        />
                        <input
                            type="number" min="1" placeholder="Capacity"
                            className="w-full border p-2 rounded"
                            value={newTable.capacity}
                            onChange={e => setNewTable({ ...newTable, capacity: +e.target.value })}
                        />
                        <div className="grid grid-cols-5 gap-2">
                            {COLOR_OPTIONS.map(c => (
                                <button
                                    key={c}
                                    className={`h-8 rounded ${c} ${newTable.color === c ? 'ring-2 ring-black' : ''}`}
                                    onClick={() => setNewTable({ ...newTable, color: c })}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setShowAdd(false)} className="px-3 py-1">Cancel</button>
                            <button onClick={saveTable} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
