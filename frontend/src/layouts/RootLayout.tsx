import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

export const RootLayout: React.FC = () => {
  const { fetchCurrentUser, initialCheckDone } = useAuthStore();
  const { notification } = useAppStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (!initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9FC]" role="status">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F45CAB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FC] text-[#252126] font-sans antialiased selection:bg-[#F45CAB]/20 selection:text-[#E13288]">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />

      {/* Slide-over Cart Drawer from prototype */}
      <CartDrawer />

      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 bg-[#252126] border border-[#F45CAB]/30 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-[#F45CAB]" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
