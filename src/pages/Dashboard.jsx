import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Icon } from '@iconify/react/dist/iconify.js';
import { QRCodeCanvas } from 'qrcode.react';
import { Link, Outlet } from "react-router-dom";
import QueueManage from './QueueManage';
import { useQueue } from '../context/queueContext';



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
    const appURL = "https://hts-ten.vercel.app/user/";
    const adminActions = [
        { label: "Manage Queues", icon: "mdi:queue", color: "bg-blue-100 text-blue-600", to: "/admin/queues" },
        { label: "Analytics", icon: "mdi:chart-line", color: "bg-purple-100 text-purple-600", to: "/admin/analytics" },
        { label: "Tables", icon: "mdi:table-furniture", color: "bg-teal-100 text-teal-600", to: "/admin/tables  " },
    ];
    const { queues, tables, assigned, setQueues, setAssigned, currentTime, } = useQueue();






    const grouped = useMemo(() => {
        const g = {};
        tables.forEach(t => {
            g[t.capacity] ??= [];
            g[t.capacity].push(t);
        });
        return g;                // {2: [t1,t2], 4: [t3,t4], ...}
    }, [tables]);
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
    const formatDuration = (startTime) => {
        const created = new Date(startTime);
        const diff = Math.floor((currentTime - created) / 1000); // in seconds

        const mins = Math.floor(diff / 60);
        const secs = diff % 60;

        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
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
        <div className="h-screen flex flex-col bg-gray-200 font-poppins">

            {/* header */}
            <header className="bg-orange-500 rounded-xl m-2 text-white py-3 px-8 flex justify-between">

                <h1 className="text-3xl font-bold">Queuegenix</h1>
                <div className="text-right ">
                    <div className="text-lg font-bold">{formatTime(currentTime.toISOString())}</div>
                    <div className="text-base">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
            </header>

            {/* body */}<div className="flex-1 grid grid-cols-1 md:grid-cols-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100 m-2 overflow-hidden">

                {/* stats */}
                <aside className="bg-white flex flex-col justify-between px-6 py-6 border-r border-gray-100 shadow-xl rounded-l-xl text-left">
                    {/* Top Section */}
                    <div className="space-y-4">
                        {/* Brand */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-20 h-20 bg-orange-500 rounded-full flex justify-center items-center text-white shadow-lg">
                                <Icon icon="material-symbols:dine-in-sharp" className="h-10 w-10" />
                            </div>
                            <p className="text-xl font-extrabold text-gray-800 tracking-wide">Spice House</p>
                        </div>

                        {/* Stats */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 p-2 rounded-xl shadow-sm">
                                <span className="text-sm text-gray-700 flex items-center gap-2">
                                    <Icon icon="mdi:account-group" className="w-5 h-5 text-orange-400" />
                                    Active Queues
                                </span>
                                <span className="text-xl font-bold text-orange-600">{queues.length}</span>
                            </div>
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2 rounded-xl shadow-sm">
                                <span className="text-sm text-gray-700 flex items-center gap-2">
                                    <Icon icon="mdi:table-chair" className="w-5 h-5 text-green-500" />
                                    Available Tables
                                </span>
                                <span className="text-xl font-bold text-green-600">{tables.length}</span>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="space-y-1">
                            {/* Section Label */}
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-full">
                                    Admin Controls
                                </h4>
                            </div>

                            {/* Action Links */}
                            <div className="space-y-2">
                                {adminActions.map((action) => (
                                    <Link
                                        to={action.to}
                                        key={action.label}
                                        className="group flex items-center gap-3 p-1 rounded-lg border border-gray-200 hover:shadow-md transition duration-200 bg-white w-full text-sm text-gray-800"
                                    >
                                        <div className={`p-2 rounded-full ${action.color} group-hover:scale-105 transform transition`}>
                                            <Icon icon={action.icon} className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{action.label}</span>
                                        <Icon
                                            icon="mdi:chevron-right"
                                            className="ml-auto text-gray-400 group-hover:translate-x-1 transform transition"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* QR Section */}
                    <div className="mt">
                        {/* Label */}
                        <div className="flex items-center gap-2 mb-2">
                            <Icon icon="mdi:qrcode-scan" className="w-4 h-4 text-gray-500" />
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded-full">
                                QR Access
                            </h4>
                        </div>

                        {/* QR Box */}
                        <div className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                            <div className="bg-gray-50 p-2 rounded-md shadow-inner">
                                <QRCodeCanvas value={appURL} size={80} />
                            </div>

                            {/* Icons */}
                            <div className="flex gap-3 mt-2">
                                <button
                                    title="Copy Link"
                                    onClick={() => navigator.clipboard.writeText(appURL)}
                                    className="text-gray-500 hover:text-black transition transform hover:scale-105"
                                >
                                    <Icon icon="mdi:content-copy" className="w-4 h-4" />
                                </button>
                                <a
                                    href={document.querySelector("canvas")?.toDataURL()}
                                    download="spice-house-qr.png"
                                    title="Download QR"
                                    className="text-gray-500 hover:text-black transition transform hover:scale-105"
                                >
                                    <Icon icon="mdi:download" className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>


                </aside>



                <Outlet context={{ handleDrop, handleDragStart, handleDragOver, declineQueue, completeQueue }} />



            </div>


        </div>
    );
};

export default Dashboard;
