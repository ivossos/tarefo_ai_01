import { useState } from "react";
import { useLocation } from "wouter";
import MobileSidebar from "./MobileSidebar";

type NavBarProps = {
  title: string;
  subtitle?: string;
};

export default function NavBar({ title, subtitle }: NavBarProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 md:hidden">
        <div className="flex items-center justify-between p-4">
          <button onClick={openSidebar} className="p-1">
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="flex items-center max-w-[70%]">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
              <i className="ri-robot-fill text-lg"></i>
            </div>
            <h1 className="ml-2 text-lg font-bold text-neutral-800 font-heading truncate">TarefoAI</h1>
          </div>
          <button className="p-1">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
        </div>
      </div>
      
      {/* Desktop Top Bar */}
      <div className="bg-white p-4 border-b border-neutral-200 hidden md:flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold font-heading">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <div className="flex items-center">
          <button className="mr-2 p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full">
            <i className="ri-search-line text-xl"></i>
          </button>
          <button className="mr-2 p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-full">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
          <button className="flex items-center ml-2">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
              <i className="ri-user-line text-neutral-600"></i>
            </div>
          </button>
        </div>
      </div>

      <MobileSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Mobile Section Title */}
      <div className="bg-white p-4 border-b border-neutral-200 flex justify-between items-center md:hidden">
        <div>
          <h1 className="text-lg font-bold font-heading">{title}</h1>
        </div>
      </div>
    </>
  );
}
