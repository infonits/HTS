import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);       // profile info
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    /* --------- Helper: Save/Load from LocalStorage --------- */
    const saveAdminToStorage = (adminData) => {
        localStorage.setItem("admin_profile", JSON.stringify(adminData));
    };

    const loadAdminFromStorage = () => {
        const saved = localStorage.getItem("admin_profile");
        return saved ? JSON.parse(saved) : null;
    };

    const clearAdminStorage = () => {
        localStorage.removeItem("admin_profile");
    };

    /* --------- Login Function --------- */
    const login = async (email, password) => {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        const user = signInData.user;
        if (!user) throw new Error("No user found after login");

        // Fetch profile from Supabase
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*,restaurant(*)")
            .eq("id", user.id)
            .single();

        if (profileError) throw profileError;

        // Save to state + localStorage
        setAdmin(profile);
        saveAdminToStorage(profile);

        return profile;
    };

    /* --------- Logout Function --------- */
    const logout = async () => {
        await supabase.auth.signOut();
        clearAdminStorage();
        setAdmin(null);
        navigate("/login");
    };

    /* --------- Validate Session on App Load --------- */
    useEffect(() => {
        const checkSession = async () => {
            setLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            const localAdmin = loadAdminFromStorage();

            if (!user || !localAdmin || user.id !== localAdmin.id) {
                // invalid session → force logout
                await logout();
                setLoading(false);
                return;
            }

            // Refresh profile from Supabase to make sure it's updated
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("*,restaurant(*)")
                .eq("id", user.id)
                .single();

            if (error || !profile) {
                await logout();
                setLoading(false);
                return;
            }

            setAdmin(profile);
            saveAdminToStorage(profile);
            setLoading(false);
        };

        checkSession();
    }, []);

    return (
        <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
