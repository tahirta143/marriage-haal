'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Can, PERMISSIONS } from '../../../lib/permissions';
import {
  Users as UsersIcon,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  UserPlus,
  Mail,
  Phone,
  ShieldAlert,
  Edit,
  KeyRound,
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal State: Create User
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [groupId, setGroupId] = useState('5'); // Default Customer Group

  // Modal State: Edit User & Change Password
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editPassword, setEditPassword] = useState('');
  const [editGroupId, setEditGroupId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, gRes] = await Promise.all([
        api.get('/users'),
        api.get('/rbac/groups'),
      ]);

      if (uRes.data.success) setUsers(uRes.data.users);
      if (gRes.data.success) setGroups(gRes.data.groups);
    } catch (err) {
      console.error('Failed to load users data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setErrorMessage('');
      setFeedback('');

      const res = await api.post('/users', {
        name,
        email,
        phone,
        password,
        group_id: parseInt(groupId),
      });

      if (res.data.success) {
        setFeedback(`User '${name}' registered successfully.`);
        setShowModal(false);
        setName('');
        setEmail('');
        setPhone('');
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create user account';
      setErrorMessage(msg);
    }
  };

  const handleOpenEditModal = (u) => {
    setEditUserId(u.id);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditStatus(u.status || 'active');
    setEditGroupId(u.group_id ? u.group_id.toString() : '');
    setEditPassword('');
    setErrorMessage('');
    setShowEditModal(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUserId) return;

    try {
      setErrorMessage('');
      setFeedback('');

      const res = await api.put(`/users/${editUserId}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        status: editStatus,
        password: editPassword,
        group_id: editGroupId ? parseInt(editGroupId) : undefined,
      });

      if (res.data.success) {
        setFeedback(`User account #${editUserId} ('${editName}') & security password updated successfully.`);
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update user details';
      setErrorMessage(msg);
    }
  };

  const handleUpdateGroup = async (userId, newGroupId) => {
    try {
      const res = await api.put(`/users/${userId}/group`, { group_id: parseInt(newGroupId) });
      if (res.data.success) {
        setFeedback('User security group updated successfully.');
        fetchData();
      }
    } catch (err) {
      alert('Failed to update user security group');
    }
  };

  return (
    <Can
      permission={PERMISSIONS.RBAC_MANAGE}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'rbac.manage' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#AA336A] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              RBAC User Administration
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#111827]">
              User Accounts & Security Roles
            </h1>
            <p className="text-gray-500 text-xs mt-1 font-medium">
              Manage system users, register accounts, change passwords, and assign RBAC security groups.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
          >
            <UserPlus className="w-4 h-4" />
            Create User Account
          </button>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Users Roster Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm font-semibold">
            Loading user accounts...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E5E7EB] font-bold text-sm flex items-center gap-2 text-[#111827]">
              <UsersIcon className="w-4 h-4 text-[#AA336A]" />
              System User Roster ({users.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-b border-[#E5E7EB]">
                  <tr>
                    <th className="p-3.5">User ID</th>
                    <th className="p-3.5">Full Name</th>
                    <th className="p-3.5">Email & Phone</th>
                    <th className="p-3.5">Security Group</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions / Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[#111827]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3.5 font-mono text-[#AA336A] font-bold">#{u.id}</td>
                      <td className="p-3.5 font-bold text-[#111827]">{u.name}</td>
                      <td className="p-3.5">
                        <div className="font-mono text-[#111827] font-semibold">{u.email}</div>
                        <div className="text-[10px] text-gray-500 font-medium">{u.phone || 'N/A'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#AA336A]/10 text-[#AA336A] border border-[#AA336A]/30">
                          {u.group_name || 'No Group'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        {/* RBAC Protected Edit Button */}
                        <Can permission={PERMISSIONS.RBAC_MANAGE}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-[#FDF2F7] border border-[#E5E7EB] hover:border-[#AA336A]/40 text-[#AA336A] text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit & Password
                          </button>
                        </Can>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create User Account */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xl space-y-4 text-[#111827]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#AA336A]" />
                  Create System User Account
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-[#111827]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Zaid Ali"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zaid@shaadipro.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Assigned Security Group
                  </label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} — {g.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
                  >
                    Create User Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit User & Change Password (RBAC Guarded) */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xl space-y-4 text-[#111827]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#AA336A]" />
                  Edit User & Change Password
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-[#111827]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#FDF2F7] border border-[#AA336A]/30 space-y-2">
                  <label className="block text-xs font-bold text-[#AA336A] uppercase flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" /> Change User Password
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                  <p className="text-[10px] text-gray-500">
                    Enter new password only if you wish to overwrite user password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Assigned Security Group
                  </label>
                  <select
                    value={editGroupId}
                    onChange={(e) => setEditGroupId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} — {g.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
                  >
                    Save Changes & Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Can>
  );
}
