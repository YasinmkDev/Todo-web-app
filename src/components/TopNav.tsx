import React from 'react';
import { ViewMode, SyncState } from '../types/todo';
import { CharacterMark } from './CharacterMark';
import { List, Kanban, Calendar, BarChart3, Cloud, CloudOff, RefreshCw, Plus } from 'lucide-react';

interface TopNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  syncState: SyncState;
  onOpenSyncModal: () => void;
  onOpenNewTaskModal: () => void;
  unreadCount?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  syncState,
  onOpenSyncModal,
  onOpenNewTaskModal,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-[#f6f5f4]/90 backdrop-blur-md border-b border-black/[0.08]">
      {/* Zone 1: Brand title, single line */}
      <div className="flex items-center gap-2.5">
        <CharacterMark type="thinker" color="blue" size="sm" />
        <span className="text-base font-semibold tracking-tight text-black flex items-center gap-1.5">
          Notion Todo
          <span className="hidden sm:inline-block font-editorial text-xs italic font-normal text-black/40">
            notebook
          </span>
        </span>
      </div>

      {/* Zone 2: 4 nav links / view selectors */}
      <nav className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-lg border border-black/[0.04]">
        <button
          onClick={() => onViewChange('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            currentView === 'list'
              ? 'bg-white text-black shadow-xs'
              : 'text-black/60 hover:text-black hover:bg-black/[0.02]'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>List</span>
        </button>

        <button
          onClick={() => onViewChange('board')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            currentView === 'board'
              ? 'bg-white text-black shadow-xs'
              : 'text-black/60 hover:text-black hover:bg-black/[0.02]'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Board</span>
        </button>

        <button
          onClick={() => onViewChange('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            currentView === 'calendar'
              ? 'bg-white text-black shadow-xs'
              : 'text-black/60 hover:text-black hover:bg-black/[0.02]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => onViewChange('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            currentView === 'analytics'
              ? 'bg-white text-black shadow-xs'
              : 'text-black/60 hover:text-black hover:bg-black/[0.02]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Zone 3: Primary actions & cloud status */}
      <div className="flex items-center gap-2.5">
        {/* Cloud Sync Status Indicator Button */}
        <button
          onClick={onOpenSyncModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-black/70 hover:text-black hover:bg-black/[0.04] transition-colors border border-black/[0.06] whitespace-nowrap"
          title="Open Cloud Synchronization settings"
        >
          {syncState.isOfflineMode ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-[#ffb110]" />
              <span className="hidden md:inline text-black/60">Offline</span>
            </>
          ) : syncState.status === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-[#0075de] animate-spin" />
              <span className="hidden md:inline text-[#0075de]">Syncing</span>
            </>
          ) : (
            <>
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline text-black/75">Cloud Synced</span>
            </>
          )}
          {syncState.pendingChanges > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-mono bg-[#ffb110]/20 text-[#e89d01] rounded-full">
              {syncState.pendingChanges}
            </span>
          )}
        </button>

        {/* Primary CTA: Notion Blue button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#0075de] hover:bg-[#097fe8] active:bg-[#0060b8] rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>
    </header>
  );
};
