'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import { Can, PERMISSIONS } from '../../../../lib/permissions';
import {
  Lock,
  Plus,
  CheckCircle2,
  ShieldAlert,
  Save,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

export default function GroupsManagementPage() {
  const [groups, setGroups] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Fetch groups & permissions on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, permsRes] = await Promise.all([
        api.get('/rbac/groups'),
        api.get('/rbac/permissions'),
      ]);

      if (groupsRes.data.success && permsRes.data.success) {
        setGroups(groupsRes.data.groups);
        setPermissions(permsRes.data.permissions);

        if (groupsRes.data.groups.length > 0 && !selectedGroupId) {
          const firstGroup = groupsRes.data.groups[0];
          setSelectedGroupId(firstGroup.id);
          setSelectedPermissions(firstGroup.permissions || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch RBAC data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroupId(group.id);
    setSelectedPermissions(group.permissions || []);
    setFeedback('');
  };

  const togglePermission = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedGroupId) return;
    try {
      setSaving(true);
      setFeedback('');
      const res = await api.put(`/rbac/groups/${selectedGroupId}/permissions`, {
        permissionIds: selectedPermissions,
      });

      if (res.data.success) {
        setFeedback('Group permissions saved successfully! Re-login or refresh to update active JWT permissions.');
        // Update local group state
        setGroups(
          groups.map((g) =>
            g.id === selectedGroupId ? { ...g, permissions: selectedPermissions } : g
          )
        );
      }
    } catch (err) {
      setFeedback('Failed to update group permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    try {
      const res = await api.post('/rbac/groups', {
        name: newGroupName,
        description: newGroupDesc,
        permissionIds: [],
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setNewGroupName('');
        setNewGroupDesc('');
        fetchData();
      }
    } catch (err) {
      alert('Failed to create group');
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    const mod = perm.module || 'other';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(perm);
    return acc;
  }, {});

  const currentGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <Can
      permission={PERMISSIONS.RBAC_MANAGE}
      fallback={
        <div className="p-8 text-center text-red-400 font-bold flex items-center justify-center gap-2 glass-card rounded-2xl">
          <ShieldAlert className="w-6 h-6" />
          Access Denied: Missing 'rbac.manage' permission.
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              Dynamic RBAC Engine (Permissions → Groups → Users)
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-white">
              Group & Permission Settings
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Tick or untick granular permission checkboxes for any security group in real time.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Custom Group
          </button>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Loading permissions matrix...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Security Groups List */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-amber-400" />
                Security Groups ({groups.length})
              </h2>

              <div className="space-y-2">
                {groups.map((group) => {
                  const isSelected = group.id === selectedGroupId;
                  return (
                    <button
                      key={group.id}
                      onClick={() => handleSelectGroup(group)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 text-white font-semibold shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium">{group.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {group.description || 'No description'}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                        {(group.permissions || []).length} perms
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Permission Checkbox Matrix */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Permissions Matrix for: <span className="text-amber-400">{currentGroup?.name}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select permissions granted to all members belonging to this group.
                  </p>
                </div>

                <button
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Permissions
                    </>
                  )}
                </button>
              </div>

              {/* Module Checkbox Grid */}
              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([moduleName, modulePerms]) => (
                  <div key={moduleName} className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400/90 border-b border-slate-800/80 pb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {moduleName} Module ({modulePerms.length} actions)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {modulePerms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePermission(perm.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 flex items-start gap-3 ${
                              isChecked
                                ? 'bg-slate-900 border-amber-500/40 text-slate-100'
                                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-mono font-bold text-slate-200">{perm.name}</div>
                              <div className="text-[11px] text-slate-400">{perm.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Group */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Create New Security Group
              </h3>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Photography Coordinator"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Brief description of duties and permissions"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-600"
                  >
                    Create Group
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
