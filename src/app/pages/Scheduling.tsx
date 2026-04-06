import { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Calendar, Clock, Globe, Link as LinkIcon, Repeat, CalendarRange, MapPin, Package, AlertCircle, Star, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import contentBgImage from '../../assets/8ae19cca138daf368a96bb8fbe23a98c7d881c2f.png';
import { useMessagePacks } from '../../hooks/queries';
import { Tutorial, useTutorial } from '../components/Tutorial';
import { tutorialMetadata } from '../data/tutorials';

interface ScheduledAnnouncement {
  id: string;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  callbackUrl: string;
  playbackSchedule: {
    type: 'specific-times' | 'interval';
    times?: string[];
    intervalMinutes?: number;
  };
  daysSelection: {
    type: 'week' | 'month';
    weekDays?: number[];
    monthDays?: number[];
  };
  playbackAreas: string[];
  messagePacks: string[];
  canBeInterrupted: boolean;
  priority: number;
  status: 'active' | 'scheduled' | 'paused';
}

interface MessagePack {
  id: string;
  name: string;
  userId: string;
  tenantId: string;
  messages: Array<{
    messageName: string;
    presetId: string;
    messageText: string;
  }>;
  createdAt: string;
}

export function Scheduling() {
  const { isOpen: isTutorialOpen, openTutorial, handleClose: closeTutorial } = useTutorial('scheduling');
  const [announcements, setAnnouncements] = useState<ScheduledAnnouncement[]>([
    {
      id: '1',
      name: 'Morning Promotion',
      startDate: '2026-04-01',
      startTime: '08:00',
      endDate: '2026-12-31',
      endTime: '18:00',
      timezone: 'America/New_York',
      callbackUrl: 'https://api.example.com/callback',
      playbackSchedule: {
        type: 'specific-times',
        times: ['08:00', '12:00', '17:00'],
      },
      daysSelection: {
        type: 'week',
        weekDays: [1, 2, 3, 4, 5],
      },
      playbackAreas: ['Area A', 'Area B'],
      messagePacks: [],
      canBeInterrupted: false,
      priority: 5,
      status: 'active',
    },
  ]);

  const { data: availableMessagePacks = [], isLoading: loadingMessagePacks } = useMessagePacks();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduledAnnouncement>>({
    name: '',
    startDate: '',
    startTime: '',
    timezone: 'America/New_York',
    callbackUrl: '',
    playbackSchedule: { type: 'specific-times', times: [] },
    daysSelection: { type: 'week', weekDays: [] },
    endDate: '',
    endTime: '',
    playbackAreas: [],
    messagePacks: [],
    canBeInterrupted: false,
    priority: 3,
  });

  const [newArea, setNewArea] = useState('');
  const [newTime, setNewTime] = useState('');
  const [monthDaysInput, setMonthDaysInput] = useState('');

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDayIndices = [1, 2, 3, 4, 5, 6, 0]; // Monday = 1, ..., Sunday = 0

  // Parse month days from string format like "1-5, 9, 10-20"
  const parseMonthDays = (input: string): number[] => {
    const days = new Set<number>();
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= 31 && start <= end) {
          for (let i = start; i <= end; i++) {
            days.add(i);
          }
        }
      } else {
        const day = parseInt(part);
        if (!isNaN(day) && day >= 1 && day <= 31) {
          days.add(day);
        }
      }
    }
    
    return Array.from(days).sort((a, b) => a - b);
  };

  // Format month days back to compact string
  const formatMonthDays = (days: number[]): string => {
    if (days.length === 0) return '';
    
    const sorted = [...days].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        if (start === end) {
          ranges.push(`${start}`);
        } else if (end === start + 1) {
          ranges.push(`${start}, ${end}`);
        } else {
          ranges.push(`${start}-${end}`);
        }
        if (i < sorted.length) {
          start = sorted[i];
          end = sorted[i];
        }
      }
    }
    
    return ranges.join(', ');
  };

  const handleCreateAnnouncement = () => {
    if (!formData.name || !formData.startDate || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newAnnouncement: ScheduledAnnouncement = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name!,
      startDate: formData.startDate!,
      startTime: formData.startTime!,
      timezone: formData.timezone!,
      callbackUrl: formData.callbackUrl || '',
      playbackSchedule: formData.playbackSchedule!,
      daysSelection: formData.daysSelection!,
      endDate: formData.endDate || '',
      endTime: formData.endTime || '',
      playbackAreas: formData.playbackAreas || [],
      messagePacks: formData.messagePacks || [],
      canBeInterrupted: formData.canBeInterrupted || false,
      priority: formData.priority || 3,
      status: 'scheduled',
    };

    setAnnouncements([...announcements, newAnnouncement]);
    toast.success('Announcement scheduled successfully');
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      startTime: '',
      timezone: 'America/New_York',
      callbackUrl: '',
      playbackSchedule: { type: 'specific-times', times: [] },
      daysSelection: { type: 'week', weekDays: [] },
      endDate: '',
      endTime: '',
      playbackAreas: [],
      messagePacks: [],
      canBeInterrupted: false,
      priority: 3,
    });
    setNewArea('');
    setNewTime('');
    setMonthDaysInput('');
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  const addPlaybackArea = () => {
    if (newArea && !formData.playbackAreas?.includes(newArea)) {
      setFormData({
        ...formData,
        playbackAreas: [...(formData.playbackAreas || []), newArea],
      });
      setNewArea('');
    }
  };

  const removePlaybackArea = (area: string) => {
    setFormData({
      ...formData,
      playbackAreas: formData.playbackAreas?.filter(a => a !== area),
    });
  };

  const toggleMessagePack = (packId: string) => {
    const current = formData.messagePacks || [];
    if (current.includes(packId)) {
      setFormData({
        ...formData,
        messagePacks: current.filter(p => p !== packId),
      });
    } else {
      setFormData({
        ...formData,
        messagePacks: [...current, packId],
      });
    }
  };

  const addTime = () => {
    if (newTime && !formData.playbackSchedule?.times?.includes(newTime)) {
      setFormData({
        ...formData,
        playbackSchedule: {
          ...formData.playbackSchedule!,
          times: [...(formData.playbackSchedule?.times || []), newTime],
        },
      });
      setNewTime('');
    }
  };

  const removeTime = (time: string) => {
    setFormData({
      ...formData,
      playbackSchedule: {
        ...formData.playbackSchedule!,
        times: formData.playbackSchedule?.times?.filter(t => t !== time),
      },
    });
  };

  const addWeekDay = () => {
    const day = parseInt(newTime);
    if (!isNaN(day) && day >= 0 && day <= 6 && !formData.daysSelection?.weekDays?.includes(day)) {
      setFormData({
        ...formData,
        daysSelection: {
          ...formData.daysSelection!,
          weekDays: [...(formData.daysSelection?.weekDays || []), day],
        },
      });
      setNewTime('');
    }
  };

  const removeWeekDay = (day: number) => {
    setFormData({
      ...formData,
      daysSelection: {
        ...formData.daysSelection!,
        weekDays: formData.daysSelection?.weekDays?.filter(d => d !== day),
      },
    });
  };

  const addMonthDay = () => {
    const days = parseMonthDays(monthDaysInput);
    if (days.length > 0) {
      setFormData({
        ...formData,
        daysSelection: {
          ...formData.daysSelection!,
          monthDays: days,
        },
      });
      setMonthDaysInput(formatMonthDays(days));
    }
  };

  const removeMonthDay = (day: number) => {
    setFormData({
      ...formData,
      daysSelection: {
        ...formData.daysSelection!,
        monthDays: formData.daysSelection?.monthDays?.filter(d => d !== day),
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Scheduling"
        onTutorialClick={openTutorial}
        showFavorite
        showMenu
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] rounded transition-colors"
          >
            {showForm ? 'Cancel' : 'New Schedule'}
          </button>
        }
      />

      <div
        className="flex-1 overflow-auto p-8"
        style={{
          backgroundImage: `url(${contentBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-screen-2xl mx-auto space-y-10">
          {/* Create Form */}
          {showForm && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-foreground">Create New Schedule</h2>

              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide">
                    Schedule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Morning Announcements"
                    className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                      <CalendarRange className="w-4 h-4" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-auto"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                {/* Callback URL */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Callback URL
                  </label>
                  <input
                    type="url"
                    value={formData.callbackUrl}
                    onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                    placeholder="https://api.example.com/callback"
                    className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Playback Schedule */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Playback Schedule
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.playbackSchedule?.type === 'specific-times'}
                        onChange={() => setFormData({ ...formData, playbackSchedule: { type: 'specific-times', times: [] } })}
                        className="w-4 h-4 text-primary focus:ring-primary bg-[#1a1a1a] border-[#242526]"
                      />
                      <span className="text-base text-foreground">Specific Times</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.playbackSchedule?.type === 'interval'}
                        onChange={() => setFormData({ ...formData, playbackSchedule: { type: 'interval', intervalMinutes: 30 } })}
                        className="w-4 h-4 text-primary focus:ring-primary bg-[#1a1a1a] border-[#242526]"
                      />
                      <span className="text-base text-foreground">Interval</span>
                    </label>
                  </div>

                  {formData.playbackSchedule?.type === 'specific-times' && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTime())}
                          className="flex-1 bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={addTime}
                          className="px-4 py-3 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] rounded transition-colors"
                        >
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.playbackSchedule?.times?.map((time) => (
                          <span
                            key={time}
                            className="px-3 py-1.5 bg-[#1a1a1a] border border-[#242526] rounded text-sm text-foreground flex items-center gap-2"
                          >
                            {time}
                            <button onClick={() => removeTime(time)} className="text-muted-foreground hover:text-foreground">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.playbackSchedule?.type === 'interval' && (
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Interval (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.playbackSchedule?.intervalMinutes || 30}
                        onChange={(e) => setFormData({
                          ...formData,
                          playbackSchedule: { ...formData.playbackSchedule!, intervalMinutes: parseInt(e.target.value) || 30 }
                        })}
                        className="w-full bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Days Selection */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <CalendarRange className="w-4 h-4" />
                    Days Selection
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.daysSelection?.type === 'week'}
                        onChange={() => setFormData({ ...formData, daysSelection: { type: 'week', weekDays: [] } })}
                        className="w-4 h-4 text-primary focus:ring-primary bg-[#1a1a1a] border-[#242526]"
                      />
                      <span className="text-base text-foreground">Days of Week</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.daysSelection?.type === 'month'}
                        onChange={() => setFormData({ ...formData, daysSelection: { type: 'month', monthDays: [] } })}
                        className="w-4 h-4 text-primary focus:ring-primary bg-[#1a1a1a] border-[#242526]"
                      />
                      <span className="text-base text-foreground">Days of Month</span>
                    </label>
                  </div>

                  {formData.daysSelection?.type === 'week' && (
                    <div className="space-y-3">
                      <label className="text-sm text-muted-foreground mb-2 block">Select Days</label>
                      <div className="flex gap-2">
                        {weekDayNames.map((name, index) => {
                          const dayValue = weekDayIndices[index];
                          const isSelected = formData.daysSelection?.weekDays?.includes(dayValue);
                          
                          return (
                            <button
                              key={dayValue}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  removeWeekDay(dayValue);
                                } else {
                                  setFormData({
                                    ...formData,
                                    daysSelection: {
                                      ...formData.daysSelection!,
                                      weekDays: [...(formData.daysSelection?.weekDays || []), dayValue],
                                    },
                                  });
                                }
                              }}
                              className={`px-4 py-2 border rounded text-sm transition-colors ${
                                isSelected
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'bg-[#1a1a1a] border-[#242526] text-muted-foreground hover:border-primary'
                              }`}
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formData.daysSelection?.type === 'month' && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={monthDaysInput}
                          onChange={(e) => setMonthDaysInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMonthDay())}
                          placeholder="Day(s) (e.g., 1-5, 9, 10-20)"
                          className="flex-1 bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={addMonthDay}
                          className="px-4 py-3 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] rounded transition-colors"
                        >
                          <Plus className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.daysSelection?.monthDays?.sort((a, b) => a - b).map((day) => (
                          <span
                            key={day}
                            className="px-3 py-1.5 bg-[#1a1a1a] border border-[#242526] rounded text-sm text-foreground flex items-center gap-2"
                          >
                            Day {day}
                            <button onClick={() => removeMonthDay(day)} className="text-muted-foreground hover:text-foreground">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Playback Areas */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Playback Areas
                  </label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPlaybackArea())}
                      placeholder="Enter area name"
                      className="flex-1 bg-[#1a1a1a] border border-[#242526] rounded px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={addPlaybackArea}
                      className="px-4 py-3 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] rounded transition-colors"
                    >
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.playbackAreas?.map((area) => (
                      <span
                        key={area}
                        className="px-3 py-1.5 bg-[#1a1a1a] border border-[#242526] rounded text-sm text-foreground flex items-center gap-2"
                      >
                        {area}
                        <button onClick={() => removePlaybackArea(area)} className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Message Packs */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Message Packs {loadingMessagePacks && <span className="text-xs">(loading...)</span>}
                  </label>
                  {availableMessagePacks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No message packs available. Create one in the Message Packs page.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableMessagePacks.map((pack) => {
                        const packId = pack.id || pack.packId;
                        return (
                          <button
                            key={packId}
                            onClick={() => toggleMessagePack(packId)}
                            className={`px-4 py-2 border rounded text-sm transition-colors ${
                              formData.messagePacks?.includes(packId)
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-[#1a1a1a] border-[#242526] text-foreground hover:border-primary'
                            }`}
                          >
                            {pack.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Can Be Interrupted */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.canBeInterrupted}
                      onChange={(e) => setFormData({ ...formData, canBeInterrupted: e.target.checked })}
                      className="w-4 h-4 rounded border-[#242526] text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Can Be Interrupted
                    </span>
                  </label>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Priority Level (1-5)
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFormData({ ...formData, priority: level })}
                        className={`w-12 h-12 rounded border transition-colors text-base ${
                          formData.priority === level
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-[#1a1a1a] border-[#242526] text-muted-foreground hover:border-primary'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t border-[#242526]">
                <button
                  onClick={handleCreateAnnouncement}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium rounded transition-colors"
                >
                  Create Schedule
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-[#1a1a1a] hover:bg-[#242526] border border-[#242526] text-foreground text-base rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Scheduled Announcements List */}
          {!showForm && (
            <div className="space-y-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Scheduled Announcements ({announcements.length})
              </h2>

              {announcements.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-base">No scheduled announcements</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-primary hover:text-primary/80 text-base font-medium"
                  >
                    Create your first schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="py-5 hover:bg-[#1a1a1a] px-6 -mx-6 rounded transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-base font-medium text-foreground mb-2">{announcement.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded text-xs ${getStatusColor(announcement.status)}`}>
                              {announcement.status}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                              <Star className="w-4 h-4" />
                              Priority {announcement.priority}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#242526] rounded transition-all"
                        >
                          <Trash2 className="w-5 h-5 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div key="start-date" className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Start: {announcement.startDate} at {announcement.startTime}</span>
                        </div>
                        {announcement.endDate && (
                          <div key="end-date" className="flex items-center gap-2 text-muted-foreground">
                            <CalendarRange className="w-4 h-4" />
                            <span>End: {announcement.endDate} {announcement.endTime && `at ${announcement.endTime}`}</span>
                          </div>
                        )}
                        <div key="timezone" className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <span>{announcement.timezone}</span>
                        </div>
                        {announcement.playbackSchedule.type === 'specific-times' && announcement.playbackSchedule.times && (
                          <div key="specific-times" className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Times: {announcement.playbackSchedule.times.join(', ')}</span>
                          </div>
                        )}
                        {announcement.playbackSchedule.type === 'interval' && (
                          <div key="interval" className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Every {announcement.playbackSchedule.intervalMinutes} min</span>
                          </div>
                        )}
                        {announcement.daysSelection.type === 'week' && announcement.daysSelection.weekDays && announcement.daysSelection.weekDays.length > 0 && (
                          <div key="week-days" className="flex items-center gap-2 text-muted-foreground">
                            <CalendarRange className="w-4 h-4" />
                            <span>Days: {announcement.daysSelection.weekDays.map(d => weekDayNames[d]).join(', ')}</span>
                          </div>
                        )}
                        {announcement.daysSelection.type === 'month' && announcement.daysSelection.monthDays && announcement.daysSelection.monthDays.length > 0 && (
                          <div key="month-days" className="flex items-center gap-2 text-muted-foreground">
                            <CalendarRange className="w-4 h-4" />
                            <span>Days: {announcement.daysSelection.monthDays.join(', ')}</span>
                          </div>
                        )}
                        {announcement.playbackAreas.length > 0 && (
                          <div key="playback-areas" className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{announcement.playbackAreas.join(', ')}</span>
                          </div>
                        )}
                        {announcement.messagePacks.length > 0 && (
                          <div key="message-packs" className="flex items-center gap-2 text-muted-foreground">
                            <Package className="w-4 h-4" />
                            <span>{announcement.messagePacks.length} pack(s)</span>
                          </div>
                        )}
                        {announcement.canBeInterrupted && (
                          <div key="can-interrupt" className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <span>Can be interrupted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}