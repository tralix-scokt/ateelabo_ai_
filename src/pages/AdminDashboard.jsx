
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

const Icon = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

function StatCard({ title, value, description, icon, accent }) {
  return (
    <div className="group rounded-2xl border border-white/[0.08] bg-[#0b1730] p-5 transition hover:-translate-y-1 hover:border-cyan-400/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-4 break-words text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${accent}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [adminName] = useState(() => {
  try {
    const user = JSON.parse(
      localStorage.getItem("ateelabo_user") || "{}"
    );

    return user.name?.trim().split(/\s+/)[0] || "Admin";
  } catch {
    return "Admin";
  }
});

const hour = new Date().getHours();

const greeting =
  hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";

  const loadStats = useCallback(async () => {
    if (!stats) {
  setLoading(true);
}

setError("");

    const token = localStorage.getItem("ateelabo_token");

    if (!token) {
      setError("Please log in to access the owner dashboard.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
const updateUserRole = async (userId, newRole) => {
  const token = localStorage.getItem("ateelabo_token");

  if (!token) {
    setError("Please log in again to manage users.");
    return;
  }

  setUpdatingUserId(userId);
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/api/admin/users/${userId}/role`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      }
    );
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update user role.");
    }

    // Reload statistics so the Users table shows the saved role.
    await loadStats();
  } catch (error) {
    setError(error.message || "Could not update user role.");
  } finally {
    setUpdatingUserId(null);
  }
};

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to load statistics."
        );
      }

      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  loadStats();

  const refreshInterval = setInterval(() => {
    loadStats();
  }, 60 * 60 * 1000);

  return () => {
    clearInterval(refreshInterval);
  };
}, [loadStats]);

  const number = (value) =>
    Number(value ?? 0).toLocaleString();
  const [userSearch, setUserSearch] = useState("");

const userActivity = stats?.userActivity ?? [];

const filteredUsers = userActivity.filter((user) => {
  const search = userSearch.toLowerCase().trim();

  return (
    (user.name ?? "").toLowerCase().includes(search) ||
    (user.email ?? "").toLowerCase().includes(search) ||
    (user.role ?? "").toLowerCase().includes(search)
  );
});

const deleteUser = async (user) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${
      user.name || user.email
    }? This action cannot be undone.`
  );

  if (!confirmed) return;

  const token = localStorage.getItem("ateelabo_token");

  if (!token) {
    setError("Please log in again to manage users.");
    return;
  }

  setUpdatingUserId(user.id);
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/api/admin/users/${user.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Could not delete user."
      );
    }

    await loadStats();
  } catch (error) {
    setError(
      error.message || "Could not delete user."
    );
  } finally {
    setUpdatingUserId(null);
  }
};


  const tokenUsage = stats?.aiTokenUsage ?? {};
  const promptTokens = Number(tokenUsage.promptTokens ?? 0);
  const completionTokens = Number(tokenUsage.completionTokens ?? 0);
  const totalTokens =
    Number(tokenUsage.totalTokens ?? promptTokens + completionTokens);

  const promptPercentage = totalTokens
    ? Math.round((promptTokens / totalTokens) * 100)
    : 0;

  const completionPercentage = totalTokens
    ? Math.round((completionTokens / totalTokens) * 100)
    : 0;

  const registrationCards = [
    {
      title: "Total users",
      value: stats?.totalUsers,
      description: "All registered accounts",
      icon: "♙",
      accent: "bg-blue-500/15 text-blue-300",
    },
    {
      title: "Joined today",
      value: stats?.newUsersToday,
      description: "New registrations today",
      icon: "✦",
      accent: "bg-cyan-500/15 text-cyan-300",
    },
    {
      title: "This month",
      value: stats?.newUsersThisMonth,
      description: "Monthly registrations",
      icon: "↗",
      accent: "bg-indigo-500/15 text-indigo-300",
    },
  ];

  const aiCards = [
    {
      title: "Total AI requests",
      value: stats?.totalAIRequests,
      description: "Successful AI responses recorded",
      icon: "◈",
      accent: "bg-violet-500/15 text-violet-300",
    },
    {
      title: "Requests today",
      value: stats?.aiRequestsToday,
      description: "Successful requests since midnight",
      icon: "ϟ",
      accent: "bg-purple-500/15 text-purple-300",
    },
    {
      title: "Total tokens",
      value: tokenUsage.totalTokens,
      description: "Recorded input and output tokens",
      icon: "▤",
      accent: "bg-emerald-500/15 text-emerald-300",
    },
  ];

  const navigation = [
    { label: "Overview", icon: "▦", href: "#overview", active: true },
    { label: "Users", icon: "♙", href: "#user-activity" },
    { label: "AI Analytics", icon: "◈", href: "#analytics" },
    { label: "Token Usage", icon: "▤", href: "#tokens" },
  ];

  const renderCards = (items) =>
    items.map((item) => (
      <StatCard
        key={item.title}
        {...item}
        value={
          loading
            ? "—"
            : item.value === undefined || item.value === null
              ? "—"
              : number(item.value)
        }
      />
    ));

  return (
    <div className="min-h-screen bg-[#050b18] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#071124] p-5 lg:flex">
          <Link to="/" className="mb-12 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-black text-white shadow-lg shadow-cyan-500/20">
              A
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide">
                ATEELABO <span className="text-cyan-400">AI</span>
              </p>
              <p className="text-[10px] tracking-wider text-slate-500">
                OWNER CONSOLE
              </p>
            </div>
          </Link>

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  item.active
                    ? "border border-cyan-400/20 bg-cyan-400/10 font-semibold text-cyan-300"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              ✧
            </div>
            <p className="text-sm font-semibold">Build something great</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Your command center for growing Ateelabo AI.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-xs font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Open AI assistant →
            </Link>
          </div>

          <div className="mt-5 border-t border-white/[0.08] pt-4 text-xs leading-6 text-slate-500">
            <p>ATEELABO AI</p>
            <p>Owner workspace</p>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 lg:ml-64">
          
<header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#071124]/95 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
  <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">

    {/* LEFT: Dashboard identity */}
    <div className="flex min-w-0 items-center gap-3">
      <Link
        to="/"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] font-bold text-cyan-300 lg:hidden"
      >
        A
      </Link>

      <div>
        <p className="text-sm font-semibold text-white sm:text-base">
          Owner Console
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Ateelabo AI / Dashboard
        </p>
      </div>
    </div>

    {/* RIGHT: All controls stay grouped together */}
    <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">

      {/* System status */}
      <div
        className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium sm:flex ${
          loading
            ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
            : error
              ? "border-red-400/20 bg-red-400/10 text-red-300"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            loading
              ? "bg-amber-400"
              : error
                ? "bg-red-400"
                : "bg-emerald-400"
          }`}
        />
        {loading
          ? "Checking system..."
          : error
            ? "Connection issue"
            : "System Online"}
      </div>

      {lastUpdated && (
  <span className="text-xs text-slate-400">
    Updated {lastUpdated.toLocaleTimeString()}
  </span>
)}

      {/* Refresh */}
      <button
        type="button"
        onClick={loadStats}
        disabled={loading}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium transition hover:border-cyan-400/30 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
      >
        <span aria-hidden="true">↻</span>
        <span className="hidden sm:inline">
          {loading ? "Loading..." : "Refresh"}
        </span>
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowNotifications((current) => !current);
            setShowSettings(false);
          }}
          aria-label="Notifications"
          aria-expanded={showNotifications}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
        >
          <span aria-hidden="true">🔔</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-14 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#0b1730] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">
                Notifications
              </h3>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {error ? (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-3">
                  <p className="text-sm font-medium text-red-300">
                    Dashboard connection issue
                  </p>
                  <p className="mt-1 break-words text-xs text-slate-400">
                    {error}
                  </p>
                </div>
              ) : loading ? (
                <p className="text-sm text-slate-400">
                  Checking system activity...
                </p>
              ) : (
                <>
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
                    <p className="text-sm font-medium text-emerald-300">
                      Dashboard connected
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Dashboard statistics loaded successfully.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm font-medium text-white">
                      AI activity
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {number(stats?.aiRequestsToday)} AI requests recorded today.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm font-medium text-white">
                      Registered users
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {number(stats?.totalUsers)} users registered.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowSettings((current) => !current);
            setShowNotifications(false);
          }}
          aria-label="Settings"
          aria-expanded={showSettings}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
        >
          <span aria-hidden="true">⚙</span>
        </button>

        {showSettings && (
          <div className="absolute right-0 top-14 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#0b1730] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">
                Dashboard Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Manage your dashboard and refresh your statistics.
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setShowSettings(false);
                loadStats();
              }}
              className="mt-4 w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-50"
            >
              ↻ Refresh statistics
            </button>

            <Link
              to="/"
              className="mt-3 block rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Return to Ateelabo AI
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
</header>


          <main className="mx-auto max-w-[1600px] space-y-9 p-5 sm:p-8">
            {/* Welcome */}
            
{/* Professional welcome section */}
<section className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#101f3d] via-[#0b1730] to-[#071124] p-6 shadow-xl sm:p-8">
  {/* Decorative background glow */}
  <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/[0.08] blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/[0.08] blur-3xl" />

  <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Ateelabo AI · Administration
        </span>
      </div>

      <p className="text-sm font-medium text-slate-400">
        {greeting}, {adminName}
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Welcome back.🥰
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
        Your command center is ready. Monitor your users, track AI activity,
        and manage your platform from one place.
      </p>
    </div>

    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xl text-cyan-200">
        ✦
      </div>

      <div>
        <p className="text-xs text-slate-500">Platform status</p>
        <p className={`mt-1 text-sm font-semibold ${
          loading
            ? "text-amber-300"
            : error
              ? "text-red-300"
              : "text-emerald-300"
        }`}>
          {loading
            ? "Checking connection"
            : error
              ? "Connection issue"
              : "Operational"}
        </p>
      </div>
    </div>
  </div>
</section>


            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-5 text-sm text-red-200"
              >
                <p className="font-semibold">Dashboard could not load</p>
                <p className="mt-2">{error}</p>
                <p className="mt-2 text-red-200/70">
                  Check the backend, your login token, and administrator
                  permissions.
                </p>
              </div>
            )}

            {/* Registration metrics */}
            <section id="users">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Platform growth</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Registration performance
                  </p>
                </div>
                <span className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-400">
                  Users
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {renderCards(registrationCards)}
              </div>
            </section>

            
{/* Individual User Activity */}
<section id="user-activity" className="space-y-4">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold">User Activity</h2>
      <p className="mt-1 text-sm text-slate-500">
        Registered accounts and their recorded AI usage
      </p>
    </div>

    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-2">
      <p className="text-xs text-slate-400">Users who used AI</p>
      <p className="mt-1 text-lg font-bold text-cyan-300">
        {loading ? "—" : number(stats?.usersWhoUsedAI)}
      </p>
    </div>
  </div>

  <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1730]">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] p-4">
      <div>
        <p className="font-semibold">Registered users</p>
        <p className="mt-1 text-xs text-slate-500">
          {loading
            ? "Loading users..."
            : `${number(filteredUsers.length)} users shown`}
        </p>
      </div>

      <input
        type="search"
        value={userSearch}
        onChange={(event) => setUserSearch(event.target.value)}
        placeholder="Search name, email, or role..."
        aria-label="Search users"
        className="w-full rounded-xl border border-white/10 bg-[#071124] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 sm:max-w-xs"
      />
    </div>

    {loading ? (
      <p className="p-8 text-center text-sm text-slate-400">
        Loading user activity...
      </p>
    ) : error ? (
      <p className="p-8 text-center text-sm text-red-300">
        User activity could not be loaded.
      </p>
    ) : filteredUsers.length === 0 ? (
      <p className="p-8 text-center text-sm text-slate-400">
        {userActivity.length === 0
          ? "No user activity data returned by the API."
          : "No users match your search."}
      </p>
    ) : (
      <div className="max-h-96 overflow-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4 font-medium">User</th>
              <th className="px-5 py-4 font-medium">Role</th>
              <th className="px-5 py-4 text-right font-medium">Requests</th>
              <th className="px-5 py-4 text-right font-medium">Tokens</th>
              <th className="px-5 py-4 font-medium">Last AI activity</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.06]">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="transition hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-white">
                    {user.name || "Unnamed user"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {user.email}
                  </p>
                </td>

                
<td className="px-5 py-4">
  <div className="flex min-w-32 flex-col items-start gap-2">
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        user.role === "admin"
          ? "bg-violet-400/10 text-violet-300"
          : "bg-cyan-400/10 text-cyan-300"
      }`}
    >
      {user.role || "user"}
    </span>

    
<select
  value={user.role || "user"}
  disabled={
    updatingUserId === user.id ||
    user.email?.trim().toLowerCase() ===
      JSON.parse(
        localStorage.getItem("ateelabo_user") || "{}"
      ).email?.trim().toLowerCase() ||
    (
      JSON.parse(
        localStorage.getItem("ateelabo_user") || "{}"
      ).role !== "owner" &&
      user.role === "admin"
    )
  }
  onChange={(event) =>
    updateUserRole(user.id, event.target.value)
  }
  aria-label={`Change role for ${user.name || user.email}`}
  className="w-32 rounded-lg border border-white/10 bg-[#071124] px-2 py-2 text-xs text-slate-300 outline-none focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
>
  <option value="user">Regular user</option>
  <option value="admin">Administrator</option>
</select>


    {updatingUserId === user.id && (
      <span className="text-xs text-cyan-300">
        Updating...
      </span>
    )}
  </div>
</td>


                <td className="px-5 py-4 text-right font-semibold tabular-nums">
                  {number(user.totalRequests)}
                </td>

                <td className="px-5 py-4 text-right tabular-nums text-slate-300">
                  {number(user.totalTokens)}
                </td>

                <td className="px-5 py-4 text-slate-400">
                  {user.lastUsedAt
                    ? new Date(user.lastUsedAt).toLocaleString()
                    : "Never"}
                </td>

                <td className="px-5 py-4 text-right">
  <button
    type="button"
    disabled={updatingUserId === user.id}
    onClick={() => deleteUser(user)}
    className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {updatingUserId === user.id ? "Processing..." : "Delete"}
  </button>
</td>
              </tr>
        

            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>

  <p className="text-xs leading-5 text-slate-500">
    Usage reflects recorded successful AI requests. Older requests that
    were not linked to a user will not appear in individual user totals.
  </p>
</section>

            {/* AI metrics */}
            <section id="analytics">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">AI performance</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Successful requests and recorded usage
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {renderCards(aiCards)}
              </div>
            </section>


            
{/* Seven-day AI usage chart */}

{/* Seven-day AI usage and cost analytics */}
<section
  id="daily-ai-usage"
  className="space-y-5 rounded-2xl border border-white/[0.08] bg-[#0b1730] p-5 sm:p-6"
>
  {(() => {
    const history = stats?.dailyAIUsage ?? [];

    const totalRequests = history.reduce(
      (sum, day) => sum + Number(day.requests ?? 0),
      0
    );

    const totalTokensForPeriod = history.reduce(
      (sum, day) => sum + Number(day.totalTokens ?? 0),
      0
    );

    const totalCost = history.reduce(
      (sum, day) => sum + Number(day.estimatedCostUSD ?? 0),
      0
    );

    const maxRequests = Math.max(
      1,
      ...history.map((day) => Number(day.requests ?? 0))
    );

    const maxCost = Math.max(
      0,
      ...history.map((day) => Number(day.estimatedCostUSD ?? 0))
    );

    const money = (value) =>
      `$${Number(value ?? 0).toFixed(6)}`;

    if (loading) {
      return (
        <p className="py-12 text-center text-sm text-slate-400">
          Loading AI analytics...
        </p>
      );
    }

    if (history.length === 0) {
      return (
        <p className="py-12 text-center text-sm text-slate-400">
          No daily analytics data is available yet.
        </p>
      );
    }

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              AI intelligence
            </p>
            <h2 className="mt-2 text-xl font-bold">
              Usage & Cost Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Daily requests, token consumption, and estimated API costs
            </p>
          </div>

          <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-2 text-xs text-cyan-300">
            Last 7 days
          </span>
        </div>

        {/* Summary metrics */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <p className="text-xs text-slate-400">
              Successful requests
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {number(totalRequests)}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
            <p className="text-xs text-slate-400">
              Tokens consumed
            </p>
            <p className="mt-2 text-2xl font-bold text-white">
              {number(totalTokensForPeriod)}
            </p>
          </div>

          <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
            <p className="text-xs text-amber-200/80">
              Estimated cost
            </p>
            <p className="mt-2 break-words text-2xl font-bold text-amber-200">
              {money(totalCost)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              USD · estimated
            </p>
          </div>
        </div>

        {/* Daily request chart */}
        <div className="rounded-xl border border-white/[0.06] p-4 sm:p-5">
          <h3 className="font-semibold">Daily AI requests</h3>
          <p className="mt-1 text-xs text-slate-500">
            Successful responses recorded each day
          </p>

          <div className="mt-6 flex h-52 items-end gap-2 sm:gap-4">
            {history.map((day) => {
              const requests = Number(day.requests ?? 0);
              const height = requests
                ? Math.max((requests / maxRequests) * 100, 4)
                : 0;

              const date = new Date(`${day.date}T12:00:00`);
              const label = date.toLocaleDateString(undefined, {
                weekday: "short",
              });

              return (
                <div
                  key={day.date}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  title={`${day.date}: ${number(requests)} requests`}
                >
                  <span className="text-[10px] text-slate-400 sm:text-xs">
                    {number(requests)}
                  </span>

                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-300 transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        minHeight: requests > 0 ? "4px" : "0",
                      }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 sm:text-xs">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily cost chart */}
        <div className="rounded-xl border border-white/[0.06] p-4 sm:p-5">
          <h3 className="font-semibold">Daily estimated cost</h3>
          <p className="mt-1 text-xs text-slate-500">
            Estimated input and output token charges in USD
          </p>

          <div className="mt-5 max-h-80 space-y-4 overflow-y-auto pr-3">
            {history.map((day) => {
              const cost = Number(day.estimatedCostUSD ?? 0);
              const width = maxCost > 0
                ? (cost / maxCost) * 100
                : 0;

              const date = new Date(`${day.date}T12:00:00`);
              const label = date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <div key={day.date}>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-300">
                      {label}
                    </span>
                    <span className="font-semibold tabular-nums text-amber-200">
                      {money(cost)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-200 transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span>
                      Input: {number(day.promptTokens)}
                    </span>
                    <span>
                      Output: {number(day.completionTokens)}
                    </span>
                    <span>
                      Requests: {number(day.requests)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          Cost figures are estimates based on the daily token data returned
          by the backend and the configured GPT-4o mini rates. They are
          not live billing data from OpenAI.
        </p>
      </>
    );
  })()}
</section>


            {/* Token breakdown */}
            <section id="tokens" className="grid gap-5 xl:grid-cols-5">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0b1730] p-6 xl:col-span-3">
                <div className="mb-7">
                  <h2 className="text-lg font-semibold">
                    Token consumption
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Breakdown of recorded OpenAI token usage
                  </p>
                </div>

                <div className="flex flex-col items-center gap-8 sm:flex-row">
                  <div
                    className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#22d3ee 0% ${promptPercentage}%, #8b5cf6 ${promptPercentage}% 100%)`,
                    }}
                  >
                    <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#0b1730]">
                      <span className="text-2xl font-bold">
                        {loading ? "—" : number(totalTokens)}
                      </span>
                      <span className="mt-1 text-xs text-slate-400">
                        Total tokens
                      </span>
                    </div>
                  </div>

                  <div className="w-full flex-1 space-y-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-slate-300">
                          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                          Prompt tokens
                        </span>
                        <span className="font-semibold">
                          {loading ? "—" : number(promptTokens)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all"
                          style={{ width: `${promptPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {loading ? "—" : `${promptPercentage}% of recorded tokens`}
                      </p>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-slate-300">
                          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                          Completion tokens
                        </span>
                        <span className="font-semibold">
                          {loading ? "—" : number(completionTokens)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-violet-400 transition-all"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {loading ? "—" : `${completionPercentage}% of recorded tokens`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0b1730] p-6 xl:col-span-2">
                <h2 className="text-lg font-semibold">Usage insights</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Current recorded totals
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4 rounded-xl bg-white/[0.03] p-4">
                    <Icon className="h-10 w-10 rounded-xl bg-cyan-400/10 text-xl text-cyan-300">
                      ◈
                    </Icon>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-400">
                        Successful AI responses
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {loading ? "—" : number(stats?.totalAIRequests)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl bg-white/[0.03] p-4">
                    <Icon className="h-10 w-10 rounded-xl bg-violet-400/10 text-xl text-violet-300">
                      ϟ
                    </Icon>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-400">
                        Requests today
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {loading ? "—" : number(stats?.aiRequestsToday)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-400/20 bg-[#0b1730] p-5">
  <div className="flex items-center justify-between">
    <p className="text-sm text-slate-400">
      Estimated AI Cost
    </p>

    <span className="rounded-lg bg-amber-400/10 px-2.5 py-2 text-amber-300">
      $
    </span>
  </div>

  <p className="mt-4 text-3xl font-bold tracking-tight text-white">
    $
    {Number(stats?.estimatedAICostUSD ?? 0).toFixed(4)}
  </p>

  <p className="mt-2 text-xs text-slate-500">
    Estimated OpenAI API cost (USD)
  </p>
</div>
                  </div>

                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-6 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} Ateelabo AI · Owner Console</p>
              <Link
                to="/"
                className="text-cyan-300 transition hover:text-cyan-200"
              >
                Return to AI assistant →
              </Link>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
