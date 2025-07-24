import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { supabase } from '../supabaseClient';


export default function PasswordChangeComponent() {
    const [pwd, setPwd] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState(null);
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const changePassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (pwd !== confirm) {
            setMsg({ type: 'error', text: 'Passwords do not match.' });
            setIsLoading(false);
            return;
        }

        if (pwd.length < 8) {
            setMsg({ type: 'error', text: 'Password must be at least 8 characters long.' });
            setIsLoading(false);
            return;
        }

        // Simulate API call - replace with your Supabase call
        const { error } = await supabase.auth.updateUser({ password: pwd });

        if (error) {
            setMsg({ type: 'error', text: error.message });
            setIsLoading(false);
            return;
        }

        setMsg({
            type: 'success',
            text: 'Password updated successfully!'
        });
        setPwd('');
        setConfirm('');
        setIsLoading(false);
        setTimeout(() => setMsg(null), 5000);
    };

    return (
        <main className="col-span-4 p-6 grid grid-cols-1 ">
            <section className="bg-white rounded-lg shadow-sm ">
                <header className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-semibold flex items-center space-x-2">
                        <span className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span>My Account</span>
                    </h2>
                </header>

                <div className="p-4">

                    {/* Password Change Card */}
                    <div className=" rounded-xl shadow-sm border border-gray-200 ">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-5 border-b">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <Icon icon="lucide:shield" className="w-5 h-5 text-white" />

                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                                    <p className="text-sm text-gray-600">Create a strong, unique password</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                {/* New Password Field */}
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-password"
                                            type={showPwd ? 'text' : 'password'}
                                            value={pwd}
                                            onChange={(e) => setPwd(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-12"
                                            placeholder="Enter your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Icon icon={showPwd ? "lucide:eye-off" : "lucide:eye"} className="w-5 h-5" />

                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirm-password"
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirm}
                                            onChange={(e) => setConfirm(e.target.value)}
                                            required
                                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors pr-12"
                                            placeholder="Confirm your new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirm ? <Icon icon="lucide:eye-off" className="w-5 h-5" /> : <Icon icon="lucide:eye" className="w-5 h-5" />
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Message Display */}
                                {msg && (
                                    <div className={`flex items-center space-x-2 p-4 rounded-lg transition-all duration-300 transform ${msg.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200 scale-100'
                                        : 'bg-red-50 text-red-800 border border-red-200 scale-100'
                                        }`}>
                                        {msg.type === 'success' ? (
                                            <Icon icon="lucide:check" className="w-5 h-5" />
                                        ) : (
                                            <Icon icon="lucide:alert-circle" className="w-5 h-5" />
                                        )}
                                        <span className="text-sm font-medium">{msg.text}</span>
                                    </div>
                                )}

                                {/* Password Strength Indicator */}
                                {pwd && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-700">Password Strength</div>
                                        <div className="flex space-x-1">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-2 flex-1 rounded-full transition-colors ${pwd.length >= (i + 1) * 2
                                                        ? pwd.length >= 12
                                                            ? 'bg-green-500'
                                                            : pwd.length >= 8
                                                                ? 'bg-orange-500'
                                                                : 'bg-red-500'
                                                        : 'bg-gray-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {pwd.length < 8 ? 'Weak' : pwd.length < 12 ? 'Good' : 'Strong'}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        Changes will take effect immediately
                                    </div>
                                    <button
                                        type="button"
                                        onClick={changePassword}
                                        disabled={isLoading || !pwd || !confirm}
                                        className="inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-white text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="lucide:shield" className="w-5 h-5 text-white" />


                                                <span>Update Password</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
        </main>
    );
}