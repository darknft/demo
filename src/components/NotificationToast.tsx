import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Coffee, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { AppNotification } from '../types';

export const NotificationToast: React.FC = () => {
  const { notifications, markNotificationAsRead } = useStore();
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    // Show newest unread notification
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      const latest = unread[0];
      setActiveToast(latest);
      const timer = setTimeout(() => {
        markNotificationAsRead(latest.id);
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setActiveToast(null);
    }
  }, [notifications, markNotificationAsRead]);

  if (!activeToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.95 }}
        className="bg-[#1E3932] text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-600/50 flex items-center justify-center shrink-0 text-emerald-300 mt-0.5">
          {activeToast.type === 'loyalty' ? (
            <Sparkles className="w-4 h-4 text-amber-300" />
          ) : activeToast.type === 'order' ? (
            <Coffee className="w-4 h-4 text-emerald-200" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
            {activeToast.title}
          </h4>
          <p className="text-xs text-emerald-100/80 mt-0.5 leading-snug">
            {activeToast.message}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            {new Date(activeToast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <button
          onClick={() => {
            markNotificationAsRead(activeToast.id);
            setActiveToast(null);
          }}
          className="text-stone-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
