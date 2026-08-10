'use client';

import React, { useState, useEffect } from 'react';
import api from '../../../../lib/api';
import { Can, PERMISSIONS } from '../../../../lib/permissions';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import {
  Lock,
  Plus,
  CheckCircle2,
  ShieldAlert,
  Save,
  Sparkles,
  Layers,
  X,
  GripVertical,
  ArrowRight,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

// Draggable Permission Card Component (Draggable Anywhere)
function DraggablePermissionCard({ perm, isAssigned, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `perm-${perm.id}`,
    data: { perm, isAssigned },
  });

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 999,
      opacity: 0.85,
    }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`p-3 rounded-xl border flex items-center justify-between transition-all select-none cursor-grab active:cursor-grabbing hover:shadow-md ${isDragging ? 'shadow-2xl ring-2 ring-[#AA336A] bg-white scale-105 opacity-90' : ''
        } ${isAssigned
          ? 'bg-[#FDF2F7] border-[#AA336A]/40 text-[#111827]'
          : 'bg-white border-[#E5E7EB] text-gray-700 hover:border-[#AA336A]/40'
        }`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="text-gray-400 p-0.5 flex-shrink-0">
          <GripVertical className="w-4 h-4 text-[#AA336A]" />
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-mono font-bold text-[#111827] truncate">{perm.name}</div>
          <div className="text-[11px] text-gray-500 truncate">{perm.description}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(perm.id);
        }}
        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex-shrink-0 ml-2 ${isAssigned
            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            : 'bg-[#AA336A]/10 text-[#AA336A] hover:bg-[#AA336A]/20 border border-[#AA336A]/25'
          }`}
      >
        {isAssigned ? (
          <span className="flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> Remove
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <Plus className="w-3 h-3" /> Assign
          </span>
        )}
      </button>
    </div>
  );
}

// Droppable Drop Zone Component
function DroppableTargetZone({ children, id, title, isOverClass }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[360px] p-4 rounded-2xl border-2 transition-all duration-200 ${isOver
          ? 'border-[#AA336A] bg-[#FDF2F7] ring-4 ring-[#AA336A]/15 scale-[1.01]'
          : 'border-dashed border-[#E5E7EB] bg-white'
        }`}
    >
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>{title}</span>
        {isOver && (
          <span className="text-[#AA336A] font-bold text-[10px] animate-pulse">
            Drop here to assign!
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AccessControlDndPage() {
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
      console.error('Failed to fetch Access Control data:', err);
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

  // Drag & Drop Handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const perm = active.data.current?.perm;
    if (!perm) return;

    if (over.id === 'assigned-zone' && !selectedPermissions.includes(perm.id)) {
      setSelectedPermissions((prev) => [...prev, perm.id]);
    } else if (over.id === 'available-zone' && selectedPermissions.includes(perm.id)) {
      setSelectedPermissions((prev) => prev.filter((id) => id !== perm.id));
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
        setFeedback('Access Control permissions updated successfully! Re-login to apply new JWT capabilities.');
        setGroups(
          groups.map((g) =>
            g.id === selectedGroupId ? { ...g, permissions: selectedPermissions } : g
          )
        );
      }
    } catch (err) {
      setFeedback('Failed to update group access permissions.');
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
      alert('Failed to create custom security group');
    }
  };

  const currentGroup = groups.find((g) => g.id === selectedGroupId);
  const unassignedPermissions = permissions.filter((p) => !selectedPermissions.includes(p.id));
  const assignedPermissionsList = permissions.filter((p) => selectedPermissions.includes(p.id));

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
              Interactive Drag & Drop Access Control Engine (@dnd-kit)
            </div>
            <h1 className="text-2xl font-extrabold font-serif-title text-[#111827]">
              Access Control & Permissions Matrix
            </h1>
            <p className="text-gray-500 text-xs mt-1 font-medium">
              Drag permissions from the available pool into the right-side drop zone to assign security access.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-lg glow-brand"
          >
            <Plus className="w-4 h-4" />
            Create Security Group
          </button>
        </div>

        {feedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm font-semibold">
            Loading Access Control matrix...
          </div>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column: Security Groups Roster */}
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm space-y-3 lg:col-span-1">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-[#AA336A]" />
                  Security Groups ({groups.length})
                </h2>

                <div className="space-y-2">
                  {groups.map((group) => {
                    const isSelected = group.id === selectedGroupId;
                    return (
                      <button
                        key={group.id}
                        onClick={() => handleSelectGroup(group)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between ${isSelected
                            ? 'bg-[#FDF2F7] border-[#AA336A] text-[#111827] font-bold ring-1 ring-[#AA336A]/30 shadow-sm'
                            : 'bg-gray-50 border-[#E5E7EB] text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-[#111827]">{group.name}</div>
                          <div className="text-[11px] text-gray-500 truncate max-w-[130px] font-medium">
                            {group.description || 'No description'}
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-white text-[#AA336A] border border-[#E5E7EB]">
                          {(group.permissions || []).length} perms
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drag and Drop Workspace (Columns 2, 3, 4) */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Permissions Pool (Left Source) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      Available Permissions Pool ({unassignedPermissions.length})
                    </h3>
                  </div>

                  <DroppableTargetZone id="available-zone" title="Drag source area">
                    {unassignedPermissions.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400 text-center p-8">
                        All system permissions are currently assigned to this group!
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {unassignedPermissions.map((perm) => (
                          <DraggablePermissionCard
                            key={perm.id}
                            perm={perm}
                            isAssigned={false}
                            onToggle={togglePermission}
                          />
                        ))}
                      </div>
                    )}
                  </DroppableTargetZone>
                </div>

                {/* Assigned Permissions Drop Zone (Right Target) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#AA336A]" />
                      Assigned Group Permissions ({assignedPermissionsList.length})
                    </h3>

                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl bg-[#AA336A] hover:bg-[#8E2656] active:bg-[#77234A] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Access Control
                        </>
                      )}
                    </button>
                  </div>

                  <DroppableTargetZone id="assigned-zone" title={`Active Group: ${currentGroup?.name || 'Selected Group'}`}>
                    {assignedPermissionsList.length === 0 ? (
                      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-xs text-gray-400 text-center p-8 border-2 border-dashed border-[#AA336A]/20 rounded-xl bg-[#FDF2F7]/50">
                        <ArrowRight className="w-8 h-8 text-[#AA336A] mb-2 animate-bounce" />
                        <span className="font-bold text-gray-700">Drop Zone Ready</span>
                        <span className="mt-1 text-gray-500">Drag permissions from the left pool and drop here to assign.</span>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {assignedPermissionsList.map((perm) => (
                          <DraggablePermissionCard
                            key={perm.id}
                            perm={perm}
                            isAssigned={true}
                            onToggle={togglePermission}
                          />
                        ))}
                      </div>
                    )}
                  </DroppableTargetZone>
                </div>
              </div>
            </div>
          </DndContext>
        )}

        {/* Modal: Create Security Group */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-md">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xl space-y-4 text-[#111827]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#AA336A]" />
                  Create New Security Group
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-[#111827]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Photography Coordinator"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Brief description of duties and permissions"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-[#E5E7EB] text-sm text-[#111827] focus:outline-none focus:border-[#AA336A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#AA336A] text-white font-bold text-xs hover:bg-[#8E2656] shadow-md"
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
