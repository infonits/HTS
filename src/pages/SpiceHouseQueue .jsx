import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';

// Iconify icons as SVG components
const UsersIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2s-.89 2-2 2s-2-.89-2-2M21 14v4h-3l-2-2v-3h-1V9c0-1.11-.89-2-2-2H7c-1.11 0-2 .89-2 2v4H4v3l-2 2H0v-4c0-1.11.89-2 2-2h1V9c0-2.21 1.79-4 4-4h10c2.21 0 4 1.79 4 4v4h1c1.11 0 2 .89 2 2zM12.5 11.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5M6 13c.55 0 1-.45 1-1s-.45-1-1-1s-1 .45-1 1s.45 1 1 1z" />
    </svg>
);

const ClockIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m4.2 14.2L11 13V7h1.5v5.2l4.5 2.7l-.8 1.3z" />
    </svg>
);

const XIcon = () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z" />
    </svg>
);

const SpiceHouseQueue = () => {
    const [reservations, setReservations] = useState([
        { id: 'R002', people: 2, time: '2:35 PM' },
        { id: 'R003', people: 6, time: '2:42 PM' },
        { id: 'R004', people: 8, time: '2:45 PM' }
    ]);

    const [assignedTables, setAssignedTables] = useState([
        { id: 'R001', people: 4, assignedTo: '2-person table' }
    ]);

    const tableTypes = [
        { name: '2-Person Tables', available: 3, color: 'bg-blue-50 border-blue-200', icon: 'bg-blue-500' },
        { name: '4-Person Tables', available: 4, color: 'bg-green-50 border-green-200', icon: 'bg-green-500' },
        { name: '6-Person Tables', available: 2, color: 'bg-purple-50 border-purple-200', icon: 'bg-purple-500' },
        { name: '8-Person Tables', available: 1, color: 'bg-red-50 border-red-200', icon: 'bg-red-500' }
    ];

    const handleDragStart = (e, reservation) => {
        e.dataTransfer.setData('text/plain', JSON.stringify(reservation));
    };

    const handleDrop = (e, tableType) => {
        e.preventDefault();
        const reservation = JSON.parse(e.dataTransfer.getData('text/plain'));

        // Move from pending to assigned
        setReservations(prev => prev.filter(r => r.id !== reservation.id));
        setAssignedTables(prev => [...prev, {
            ...reservation,
            assignedTo: tableType.name.toLowerCase()
        }]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeAssignment = (reservationId) => {
        const assigned = assignedTables.find(t => t.id === reservationId);
        if (assigned) {
            setAssignedTables(prev => prev.filter(t => t.id !== reservationId));
            setReservations(prev => [...prev, {
                id: assigned.id,
                people: assigned.people,
                time: assigned.time
            }]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 ">

            {/* Header */}
            <div className=" bg-white">
                <div className="  mx-auto flex justify-between items-center p-3">

                    <div className="flex items-center space-x-4">


                        <h1 className="text-3xl font-bold text-gray-900">Spice House</h1>

                    </div>
                    <div className="text-right text-gray-600">
                        <div className="text-lg font-bold">11:59 AM</div>
                        <div className="text-sm">Friday, June 27, 2025</div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5">
                <div className='bg-white flex flex-col gap-3 px-4'>
                    <div className='min-h-40 flex-col justify-center align-center'>
                        <div className="flex justify-center items-center space-x-4">

                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white">
                                <Icon icon="noto:fork-and-knife" className="w-8 h-8 text-white" />

                            </div>
                        </div>

                        <div className="flex items-center justify-center space-x-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Spice House</h1>
                                <p className="text-gray-600 text-center">Queue Management</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 flex justify-between align-center">
                        <div className="text-gray-600">Active Reservations</div>
                        <div className="text-2xl font-bold text-orange-500">12</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 flex justify-between align-center">
                        <div className="text-gray-600">Available Tables</div>
                        <div className="text-2xl font-bold text-green-500">8</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 flex justify-between align-center">
                        <div className="text-gray-600">Avg Wait Time</div>
                        <div className="text-2xl font-bold text-blue-500 flex items-center">
                            15m
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 col-span-4">
                    {/* Pending Reservations */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <h2 className="text-lg font-semibold text-gray-900">Pending Reservations</h2>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Drag to assign tables</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {reservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, reservation)}
                                    className="bg-orange-500 text-white p-4 rounded-lg cursor-move hover:bg-orange-600 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium">{reservation.id}</div>
                                        <div className="text-sm">{reservation.time}</div>
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <UsersIcon className="w-4 h-4 mr-2" />
                                        <span className="font-semibold">{reservation.people} People</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Table Grid */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tableTypes.map((tableType, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm">
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 ${tableType.icon} rounded-full`}></div>
                                            <h3 className="font-semibold text-gray-900">{tableType.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">Available: {tableType.available} tables</p>
                                    </div>
                                    <div
                                        className={`p-6 min-h-48 border-2 border-dashed ${tableType.color} rounded-b-lg`}
                                        onDrop={(e) => handleDrop(e, tableType)}
                                        onDragOver={handleDragOver}
                                    >
                                        {/* Show assigned tables for this type */}
                                        {assignedTables
                                            .filter(table => table.assignedTo === tableType.name.toLowerCase())
                                            .map((table) => (
                                                <div
                                                    key={table.id}
                                                    className="bg-green-500 text-white p-3 rounded-lg mb-3 relative"
                                                >
                                                    <button
                                                        onClick={() => removeAssignment(table.id)}
                                                        className="absolute top-2 right-2 text-white hover:text-red-200"
                                                    >
                                                        <XIcon className="w-4 h-4" />
                                                    </button>
                                                    <div className="text-sm font-medium">{table.id}</div>
                                                    <div className="flex items-center mt-1">
                                                        <UsersIcon className="w-3 h-3 mr-1" />
                                                        <span className="text-sm font-semibold">{table.people} People</span>
                                                    </div>
                                                    <div className="text-xs mt-1 opacity-90">
                                                        Assigned to {table.assignedTo}
                                                    </div>
                                                </div>
                                            ))}

                                        {/* Drop zone message */}
                                        {assignedTables.filter(table => table.assignedTo === tableType.name.toLowerCase()).length === 0 && (
                                            <div className="flex items-center justify-center h-32 text-gray-400">
                                                <div className="text-center">
                                                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">Drop reservations here</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>

    );
};

export default SpiceHouseQueue;