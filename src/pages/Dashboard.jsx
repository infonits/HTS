import React, { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Icon } from '@iconify/react/dist/iconify.js';
import { QRCodeCanvas } from 'qrcode.react';
import { Link, Outlet } from "react-router-dom";
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
        { label: "Manage Queues", icon: "mdi:cog", color: "bg-blue-100 text-blue-600", to: "/admin/queues" },
        { label: "Analytics", icon: "mdi:chart-bar", color: "bg-purple-100 text-purple-600", to: "/admin/analytics" },
        { label: "Tables", icon: "mdi:table-furniture", color: "bg-teal-100 text-teal-600", to: "/admin/tables  " },
    ];
    const { queues, tables, assigned, setQueues, setAssigned, currentTime, } = useQueue();

    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Get current user
        supabase.auth.getUser().then(({ data }) => {
            setUser(data?.user);
        })


        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };



    const grouped = useMemo(() => {
        const g = {};
        tables.forEach(t => {
            g[t.capacity] ??= [];
            g[t.capacity].push(t);
        });
        return g;                // {2: [t1,t2], 4: [t3,t4], ...}
    }, [tables]);

    const formatDuration = (startTime) => {
        const created = new Date(startTime);
        const diff = Math.floor((currentTime - created) / 1000); // in seconds

        const mins = Math.floor(diff / 60);
        const secs = diff % 60;

        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    };




    return (
        <div className="h-screen flex flex-col bg-gray-200 font-poppins overflow-hidden">


            {/* header */}
            <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-3 px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Queuegenix</h1>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-lg font-bold">
                            {formatTime(currentTime.toISOString())}
                        </div>
                        <div className="text-base">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen((prev) => !prev)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full"
                        >
                            <Icon icon="mdi:account-circle" className="text-white text-2xl" />
                            <span className="hidden sm:inline font-medium">
                                {user?.email?.split("@")[0] ?? "User"}
                            </span>
                            <Icon icon="mdi:chevron-down" className="text-white text-xl" />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg z-50 overflow-hidden text-sm text-gray-700 border border-gray-100">
                                {/* User Email Header */}
                                <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-b">
                                    {user?.email || 'No email'}
                                </div>

                                {/* Account Link */}
                                <Link
                                    to="/admin/account"
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-orange-100 transition-colors duration-150"
                                >
                                    <Icon icon="mdi:account-circle" className="w-5 h-5 text-gray-500" />
                                    <span>My Account</span>
                                </Link>

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 w-full px-4 py-3 hover:bg-orange-100 transition-colors duration-150"
                                >
                                    <Icon icon="mdi:logout" className="w-5 h-5 text-gray-500" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </header>
            <div className="flex-1 grid grid-cols-1  md:grid-cols-3 lg:grid-cols-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100 m-2 overflow-hidden">

                {/* stats */}
                <aside className="bg-white flex flex-col justify-between px-6 py-6 border-r border-gray-100 shadow-xl rounded-l-xl text-left max-h-[90vh]">
                    {/* Top Section */}
                    <div className="space-y-4">
                        {/* Brand */}
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-15 h-15 bg-gradient-to-br from-orange-400 to-red-500  rounded-2xl flex justify-center items-center text-white shadow-lg">
                                <Icon icon="material-symbols:dine-in-sharp" className="h-10 w-10" />
                            </div>
                            <div>

                                <p className="text-xl font-extrabold text-gray-800 tracking-wide">Spice House</p>
                                <p className="text-sm text-gray-700">Restaurant Management                                </p>
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="flex flex-col md:flex-row lg:flex-row gap-4">
                            {/* Active Queues */}
                            <div className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Icon icon="mdi:account-group" className="w-5 h-5 text-orange-400" />
                                    <span className="text-sm leading-tight">
                                        Active <br /> Queues
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-orange-600 mt-2">{queues.length}</div>
                            </div>

                            {/* Available Tables */}
                            <div className="flex-1 bg-green-50 border border-green-200 p-3 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Icon icon="mdi:table-chair" className="w-5 h-5 text-green-500" />
                                    <span className="text-sm leading-tight">
                                        Available <br /> Tables
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-green-600 mt-2">{tables.length}</div>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Admin Actions */}
                        <div className="space-y-1">
                            {/* Section Label */}
                            <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-6">
                                Admin Controls
                            </h2>

                            {/* Action Links */}
                            <div className="space-y-4">
                                {adminActions.map((action) => (
                                    <Link
                                        to={action.to}
                                        key={action.label}
                                        className="group flex items-center gap-3 p-1   transition duration-200 bg-white w-full text-sm text-gray-800"
                                    >

                                        <div className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors">
                                            <Icon icon={action.icon} className="w-5 h-5" />
                                            <span className="text-base font-medium">{action.label}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div >



                        </div>

                    </div>
                    {/* QR Section */}
                    <div className="mt-auto">

                        <hr className='mb-5 border-orange-100' />

                        {/* QR Row */}
                        <div className="flex items-center justify-between  p-1 w-full  ">
                            {/* QR Code */}
                            <div className="p-2 bg-gray-50 rounded-md border border-dashed border-orange-300 shadow-inner">
                                <QRCodeCanvas value={appURL} size={80} />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-2 ml-4">
                                <button
                                    title="Copy Link"
                                    onClick={() => navigator.clipboard.writeText(appURL)}
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition"
                                >
                                    <Icon icon="mdi:content-copy" className="w-4 h-4" />
                                    Copy
                                </button>
                                <a
                                    href={document.querySelector("canvas")?.toDataURL()}
                                    download="spice-house-qr.png"
                                    title="Download QR"
                                    className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition"
                                >
                                    <Icon icon="mdi:download" className="w-4 h-4" />
                                    Download
                                </a>
                            </div>
                        </div>
                    </div>



                </aside>


                <div className=' md:col-span-2 lg:col-span-3'>

                    <Outlet />
                </div>



            </div>


        </div>
    );
};

export default Dashboard;
