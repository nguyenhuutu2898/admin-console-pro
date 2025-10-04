import React, { useState, useEffect } from "react";
import { Menu, RefreshCw, LogOut } from "../Icons";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/DropdownMenu";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date): string => {
    const days = [
      "Chủ nhật",
      "Thứ hai", 
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  const handleRefresh = (): void => {
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      {/* Left side - Portal Admin and time */}
      <div className="flex items-center gap-6">
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <h1 className="text-xl font-bold text-black">Portal Admin</h1>
          <span className="text-sm text-gray-500">
            {formatTime(currentTime)} | {formatDate(currentTime)}
          </span>
        </div>
      </div>

      {/* Right side - User info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">👤</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-black">
              {user?.fullName || "Admin 01"}
            </span>
            <span className="text-xs text-gray-500">
              {user?.username || "admin3"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
