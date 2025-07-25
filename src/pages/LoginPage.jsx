// src/pages/Login.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";      // adjust path as needed
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate()

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });

        if (error) {
            setError(error.message);
        } else {
            // e.g. navigate("/dashboard") or close modal
            navigate('/admin')
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border border-slate-200 p-8">
                <h1 className="text-2xl font-semibold text-center text-orange-500 mb-6">
                    Sign In
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* --- Email / Username --- */}
                    <label className="block">
                        <span className="text-gray-700 text-sm font-medium">Email</span>
                        <div className="mt-1 relative">
                            <Icon
                                icon="mdi:account"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                value={form.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>
                    </label>

                    {/* --- Password --- */}
                    <label className="block">
                        <span className="text-gray-700 text-sm font-medium">Password</span>
                        <div className="mt-1 relative">
                            <Icon
                                icon="mdi:lock"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                value={form.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                            />
                        </div>
                    </label>

                    {error && (
                        <p className="text-sm text-red-600 mt-1">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition"
                    >
                        {loading ? "Signing in…" : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
