import React, { useState } from 'react';
import { SyncState, Task, Project } from '../types/todo';
import { BackupSnapshot, saveSnapshot } from '../services/storage';
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  HardDrive,
  Download,
  Upload,
  Copy,
  Check,
  ShieldCheck,
  Activity,
  History,
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  tasks: Task[];
  projects: Project[];
  snapshots: BackupSnapshot[];
  onTriggerSync: () => void;
  onToggleOffline: () => void;
  onChangeSyncRoom: (roomId: string) => void;
  onRestoreSnapshot: (snapshot: BackupSnapshot) => void;
  onImportData: (data: { tasks: Task[]; projects: Project[] }) => void;
  onNewSnapshotCreated: (snap: BackupSnapshot) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  tasks,
  projects,
  snapshots,
  onTriggerSync,
  onToggleOffline,
  onChangeSyncRoom,
  onRestoreSnapshot,
  onImportData,
  onNewSnapshotCreated,
}) => {
  if (!isOpen) return null;

  const [roomIdInput, setRoomIdInput] = useState(syncState.syncRoomId);
  const [snapshotName, setSnapshotName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleCopySyncKey = () => {
    navigator.clipboard.writeText(syncState.syncRoomId);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateSnapshot = () => {
    const name = snapshotName.trim() || `Backup ${new Date().toLocaleTimeString()}`;
    const snap = saveSnapshot(name, tasks, projects);
    onNewSnapshotCreated(snap);
    setSnapshotName('');
  };

  const handleExportJSON = () => {
    const exportPayload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      syncRoomId: syncState.syncRoomId,
      tasks,
      projects,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-todo-backup-${syncState.syncRoomId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.tasks)) {
          onImportData({
            tasks: parsed.tasks,
            projects: Array.isArray(parsed.projects) ? parsed.projects : projects,
          });
          onClose();
        } else {
          setImportError('Invalid backup file format: missing tasks array.');
        }
      } catch (err) {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-black/[0.08] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] bg-[#f6f5f4]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6f3fe] text-[#0075de] flex items-center justify-center border border-[#0075de]/20">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">Cloud Synchronization & Vault</h3>
              <p className="text-xs text-black/50 font-editorial">
                Local-first architecture with cloud replication
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-black/40 hover:text-black hover:bg-black/[0.05] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Status Box */}
          <div className="bg-[#f6f5f4] rounded-xl p-4 border border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {syncState.isOfflineMode ? (
                  <CloudOff className="w-4 h-4 text-[#ffb110]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-xs font-semibold text-black">
                  {syncState.isOfflineMode
                    ? 'Offline Mode (Local Cache Active)'
                    : syncState.status === 'syncing'
                    ? 'Synchronizing with Vault...'
                    : 'Real-time Cloud Vault Connected'}
                </span>
              </div>

              <span className="font-mono text-[11px] text-black/40 tabular-nums">
                {syncState.serverPingMs}ms latency
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-black/[0.04]">
                <div className="text-black/40 text-[11px]">Last Sync Timestamp</div>
                <div className="font-mono text-black font-medium mt-0.5">
                  {syncState.lastSyncedAt
                    ? new Date(syncState.lastSyncedAt).toLocaleTimeString()
                    : 'Not synced yet'}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-black/[0.04]">
                <div className="text-black/40 text-[11px]">Pending Delta Queue</div>
                <div className="font-mono text-black font-medium mt-0.5 tabular-nums">
                  {syncState.pendingChanges} mutations queued
                </div>
              </div>
            </div>

            {/* Actions: Sync Now & Toggle Offline */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onTriggerSync}
                disabled={syncState.isOfflineMode || syncState.status === 'syncing'}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  syncState.isOfflineMode
                    ? 'bg-black/[0.04] text-black/30 cursor-not-allowed'
                    : 'bg-[#0075de] text-white hover:bg-[#097fe8]'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`}
                />
                <span>Sync Now</span>
              </button>

              <button
                onClick={onToggleOffline}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors border ${
                  syncState.isOfflineMode
                    ? 'bg-[#ffb110]/15 border-[#ffb110]/40 text-[#e89d01]'
                    : 'bg-white border-black/[0.08] text-black/70 hover:bg-black/[0.04]'
                }`}
              >
                {syncState.isOfflineMode ? 'Reconnect Online' : 'Simulate Offline'}
              </button>
            </div>
          </div>

          {/* Sync Room / Workspace Code */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-black flex items-center justify-between">
              <span>Cloud Vault ID / Room Key</span>
              <span className="font-normal text-black/40 font-editorial text-[11px]">
                Sync tasks across browser windows or devices
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="e.g. workspace-team-focus-01"
                className="flex-1 bg-black/[0.03] border border-black/[0.08] rounded-lg px-3 py-2 text-xs font-mono text-black outline-none"
              />
              <button
                onClick={() => onChangeSyncRoom(roomIdInput)}
                className="px-3 py-2 bg-black/[0.05] hover:bg-black/[0.09] text-xs font-medium text-black rounded-lg transition-colors"
              >
                Switch
              </button>
              <button
                onClick={handleCopySyncKey}
                className="p-2 bg-black/[0.05] hover:bg-black/[0.09] text-black/70 hover:text-black rounded-lg transition-colors"
                title="Copy Room Key"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Snapshots & Backup */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-black">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#0075de]" />
                Versioned Snapshots & Rollback
              </span>
              <span className="font-mono text-black/40 text-[11px] tabular-nums">
                {snapshots.length} stored
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Snapshot label (e.g. Before Sprint Retro)..."
                className="flex-1 bg-black/[0.03] border border-black/[0.08] rounded-lg px-3 py-1.5 text-xs text-black outline-none"
              />
              <button
                onClick={handleCreateSnapshot}
                className="px-3 py-1.5 bg-black/[0.06] hover:bg-black/[0.1] text-xs font-medium text-black rounded-lg transition-colors whitespace-nowrap"
              >
                Save Snapshot
              </button>
            </div>

            {/* Snapshot list */}
            {snapshots.length > 0 && (
              <div className="max-h-36 overflow-y-auto divide-y divide-black/[0.04] rounded-lg border border-black/[0.06] bg-black/[0.015]">
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-2 flex items-center justify-between text-xs hover:bg-black/[0.02]"
                  >
                    <div>
                      <div className="font-medium text-black">{snap.name}</div>
                      <div className="text-[10px] text-black/40 font-mono">
                        {snap.timestamp} · {snap.taskCount} tasks
                      </div>
                    </div>
                    <button
                      onClick={() => onRestoreSnapshot(snap)}
                      className="px-2 py-1 text-[11px] font-medium text-[#0075de] hover:bg-[#e6f3fe] rounded transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Export & Import JSON */}
          <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between gap-3 text-xs">
            <button
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-black font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] text-black font-medium transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          {importError && (
            <div className="text-xs text-[#f64932] bg-[#f64932]/10 p-2 rounded-lg">
              {importError}
            </div>
          )}

          {/* Sync History Logs */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-black flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-black/40" />
              <span>Vault Audit Log</span>
            </div>
            <div className="bg-[#f6f5f4] p-2.5 rounded-lg border border-black/[0.06] text-[11px] font-mono space-y-1 max-h-28 overflow-y-auto">
              {syncState.logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-black/60">
                  <span className="truncate">{log.action}</span>
                  <span className="text-black/35 shrink-0 ml-2">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-black/[0.06] bg-[#f6f5f4]/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[#0075de] hover:bg-[#097fe8] rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
