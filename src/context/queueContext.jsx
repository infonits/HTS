import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const QueueContext = createContext();

export const QueueProvider = ({ children }) => {
    const [queues, setQueues] = useState([]);
    const [tables, setTables] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchData = async () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const [{ data: qData }, { data: tData }] = await Promise.all([
            supabase.from('queues').select('*')
                .in('status', ['waiting', 'assigned'])
                .gte('created_at', start)
                .lt('created_at', end)
                .order('created_at'),
            supabase.from('tables').select('*').order('created_at')
        ]);

        setQueues(qData || []);
        setTables(tData || []);
        setAssigned((qData || []).filter(q => q.table_id));
    };

    useEffect(() => {
        fetchData();

        const subscription = supabase.channel('queues-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'queues'
            }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const value = {
        queues, setQueues,
        tables, setTables,
        assigned, setAssigned,
        currentTime,
        fetchData
    };

    return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
};

export const useQueue = () => useContext(QueueContext);
