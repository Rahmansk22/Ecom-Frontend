import React, { useEffect, useState } from 'react';
import { Shield, Users, DollarSign, ShoppingBag, Download, RefreshCw, CheckCircle, Ban, AlertCircle } from 'lucide-react';
import API from '../../config/api';
import type { User } from '../../types/auth';
import { useDialog } from '../../components/Dialog';

interface AnalyticsData {
  totalRevenue: number;
  ordersCount: number;
  usersCount: number;
  activeUsersCount: number;
}

export const AdminDashboard: React.FC = () => {
  const { showAlert } = useDialog();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'reports'>('analytics');
  
  // Analytics State
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users State
  const [userList, setUserList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // General States
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const res = await API.get<AnalyticsData>('/admin/analytics');
      setStats(res.data);
    } catch (err: any) {
      setError('Failed to fetch platform metrics');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setError(null);
    try {
      const res = await API.get<User[]>('/admin/users');
      setUserList(res.data);
    } catch (err: any) {
      setError('Failed to fetch platform users list');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setError(null);
    try {
      await API.put(`/admin/users/${userId}/status?active=${!currentStatus}`);
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, active: !currentStatus } : u))
      );
    } catch (err: any) {
      showAlert('Failed to update user active status', 'error');
    }
  };

  const handleTriggerBatchReport = async () => {
    setBatchRunning(true);
    setBatchSuccess(null);
    setError(null);
    try {
      const res = await API.post<{ message: string }>('/admin/reports/sales');
      setBatchSuccess(res.data.message || 'CSV Sales Report successfully generated.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to trigger sales export report');
    } finally {
      setBatchRunning(false);
    }
  };

  const handleDownloadReport = () => {
    // Navigate directly to download endpoint
    window.open(`${API.defaults.baseURL}/admin/reports/sales/download`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-indigo-600" />
            Admin Operations Panel
          </h1>
          <p className="text-sm text-slate-500">Monitor system statistics, run scheduled batch processes, and moderate users.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 rounded-2xl flex items-start gap-2">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {([
          { id: 'analytics', label: 'Platform Stats' },
          { id: 'users', label: 'User Accounts' },
          { id: 'reports', label: 'Batch Reports' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold border-b-50 transition-all ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="flex justify-center items-center h-[30vh]">
              <div className="animate-spin rounded-full h-10 w-10 border-t-50 border-b-50 border-indigo-600"></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Revenue */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
              </div>

              {/* Total Orders */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.ordersCount}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
              </div>

              {/* Total Accounts */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.usersCount}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              {/* Active Accounts */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Accounts</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.activeUsersCount}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">Failed to render dashboard statistics.</div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {usersLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-50 border-b-50 border-indigo-600"></div>
            </div>
          ) : userList.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {u.firstName} {u.lastName || ''}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.active
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {u.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.active)}
                          className={`flex items-center gap-1.5 mx-auto text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border ${
                            u.active
                              ? 'border-rose-100 text-rose-600 hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/40'
                              : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {u.active ? (
                            <>
                              <Ban size={12} /> Suspend Account
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} /> Activate Account
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Spring Batch configuration panel */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className={batchRunning ? 'animate-spin text-indigo-600' : 'text-indigo-600'} size={20} />
              Spring Batch Control
            </h3>
            <p className="text-xs text-slate-500">
              Trigger a high-throughput, transactional Spring Batch job to read all platform orders, compile financial stats, and write an aggregated CSV file.
            </p>

            <button
              onClick={handleTriggerBatchReport}
              disabled={batchRunning}
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
            >
              <RefreshCw size={16} className={batchRunning ? 'animate-spin' : ''} />
              {batchRunning ? 'Executing Batch Job...' : 'Generate New CSV Sales Report'}
            </button>

            {batchSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span>{batchSuccess}</span>
              </div>
            )}
          </div>

          {/* Download CSV Report panel */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border border-slate-800 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="text-indigo-400" size={20} />
                Download Directory
              </h3>
              <p className="text-xs text-slate-400">
                Retrieve the latest generated platform sales summary CSV. Standard layout includes Order ID, Customer name, Price, HSN tax data, and shipping parameters.
              </p>
            </div>

            <button
              onClick={handleDownloadReport}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-md hover:shadow-indigo-500/10 transition-all text-sm border border-indigo-500/20"
            >
              <Download size={16} />
              <span>Download latest_sales_report.csv</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
