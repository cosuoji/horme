import { Outlet, Link, useLocation } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

const AdminLayout = () => {
  const { logout } = useUserStore();
  const location = useLocation();

  const navLinks = [
    { name: "Overview", path: "/admin" },
    { name: "Users & KYC", path: "/admin/users" },
    { name: "Release Queue", path: "/admin/releases" },
    { name: "Withdrawals", path: "/admin/withdrawals" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-[#EAE4D5]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#050505] border-r border-[#B6B09F]/20 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-xs text-red-500 mt-1 uppercase font-bold tracking-widest">
            God Mode
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== "/admin" &&
                location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#EAE4D5] text-[#0a0a0a] font-bold"
                    : "text-[#B6B09F] hover:bg-[#B6B09F]/10 hover:text-[#EAE4D5]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#B6B09F]/20">
          <button
            onClick={logout}
            className="w-full py-2 px-4 border border-red-500/50 text-red-500 rounded hover:bg-red-500/10 transition-colors"
          >
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
