import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Icon } from '@iconify/react';
const COLOR_OPTIONS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-purple-500'
];



export default function TableManagement() {
    const [tables, setTables] = useState([]);
    const [form, setForm] = useState({ name: '', capacity: '', color: 'bg-red-500' });
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTables();
    }, [page]);

    const fetchTables = async () => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        const { data, count } = await supabase
            .from('tables')
            .select('*', { count: 'exact' })      // 👈 get the total row-count
            .order('created_at', { ascending: false })
            .range(from, to);

        setTables(data);
        setTotalPages(Math.max(1, Math.ceil(count / limit))); // 👈 calc pages
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.capacity || !form.color) return;
        if (editingId) {
            await supabase.from('tables').update(form).eq('id', editingId);
        } else {
            await supabase.from('tables').insert({ ...form });
        }
        resetForm();
        fetchTables();
    };

    const handleEdit = (table) => {
        setForm({ name: table.name, capacity: table.capacity, color: table.color });
        setEditingId(table.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        await supabase.from('tables').delete().eq('id', id);
        fetchTables();
    };

    const resetForm = () => {
        setForm({ name: '', capacity: '', color: '' });
        setEditingId(null);
        setShowModal(false);
    };

    return (
        <main className="col-span-4 p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 rounded-xl">
                                <Icon icon="mdi:table-chair" className="text-orange-600 text-2xl" />
                            </div>
                            Manage Tables
                        </h2>
                        <p className="text-gray-600">Organize and manage your restaurant tables</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                        <Icon icon="mdi:plus" className="text-lg" /> Add New Table
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="font-semibold text-gray-700 flex items-center gap-2">
                                <Icon icon="mdi:tag" className="text-gray-500" />
                                Table Name
                            </div>
                            <div className="font-semibold text-gray-700 flex items-center gap-2">
                                <Icon icon="mdi:account-group" className="text-gray-500" />
                                Capacity
                            </div>
                            <div className="font-semibold text-gray-700 flex items-center gap-2">
                                <Icon icon="mdi:palette" className="text-gray-500" />
                                Color
                            </div>
                            <div className="font-semibold text-gray-700 text-center">Actions</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100">
                        {tables.map((t, index) => (
                            <div
                                key={t.id}
                                className={`px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    }`}
                            >
                                <div className="grid grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                            <Icon icon="mdi:table-furniture" className="text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-800">{t.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                            {t.capacity} seats
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${t.color}`}

                                        ></div>
                                        <span className="text-gray-600 capitalize">{t.color}</span>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(t)}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
                                        >
                                            <Icon icon="mdi:pencil" className="text-gray-500 group-hover:text-blue-600 text-lg" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-200 group"
                                        >
                                            <Icon icon="mdi:trash-can" className="text-gray-500 group-hover:text-red-600 text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {tables.length === 0 && (
                            <div className="px-6 py-16 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="mdi:table-chair" className="text-gray-400 text-3xl" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">No tables found</h3>
                                <p className="text-gray-500">Start by adding your first table to the system</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Pagination */}
                <div className="flex justify-between items-center mt-8 bg-white rounded-xl px-6 py-4 shadow-md">
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
      ${page === 1 ? 'text-gray-400 cursor-not-allowed' :
                                'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                    >
                        <Icon icon="mdi:chevron-left" /> Previous
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-semibold">
                            Page {page} / {totalPages}
                        </span>
                    </div>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
      ${page >= totalPages ? 'text-gray-400 cursor-not-allowed' :
                                'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
                    >
                        Next <Icon icon="mdi:chevron-right" />
                    </button>
                </div>

                {/* Enhanced Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl transform animate-in fade-in-0 zoom-in-95">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-100 rounded-xl">
                                        <Icon icon="mdi:table-plus" className="text-orange-600" />
                                    </div>
                                    {editingId ? 'Edit Table' : 'Add New Table'}
                                </h3>
                                <p className="text-gray-600">
                                    {editingId ? 'Update table information' : 'Enter details for the new table'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Icon icon="mdi:tag" className="text-gray-500" />
                                        Table Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter table name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Icon icon="mdi:account-group" className="text-gray-500" />
                                        Seating Capacity
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Number of seats"
                                        value={form.capacity}
                                        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Icon icon="mdi:palette" className="text-gray-500" />
                                        Table Colour
                                    </label>

                                    <div className="grid grid-cols-5 gap-2">
                                        {COLOR_OPTIONS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setForm({ ...form, color: c })}
                                                className={`h-8 rounded ${c}
          ${form.color === c ? 'ring-2 ring-black' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        {editingId ? 'Update Table' : 'Add Table'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
