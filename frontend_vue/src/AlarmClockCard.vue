<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import type {
  Alarm,
  AlarmDialogData,
  AlarmState,
  CardConfig,
  HomeAssistant,
  NextAlarmInfo,
  QuickAlarmOption,
  RepeatPattern,
} from './types';

// Props
const props = defineProps<{
  hass: HomeAssistant | null;
  config: CardConfig;
}>();

// State
const showDialog = ref(false);
const isEditing = ref(false);
const editingAlarmId = ref<string | null>(null);
const dialogData = ref<AlarmDialogData>({
  name: 'Alarm',
  time: '07:00',
  date: '',
  repeat: 'none',
  enabled: true,
});

// Current time state
const currentTime = ref(new Date());
let timeInterval: ReturnType<typeof setInterval> | null = null;

// Section collapse state
const clockCollapsed = ref(props.config.collapse_clock ?? false);
const quickAlarmCollapsed = ref(props.config.collapse_quick_alarm ?? false);
const alarmListCollapsed = ref(props.config.collapse_alarm_list ?? false);
const addSectionCollapsed = ref(props.config.collapse_add_section ?? true);
const showAddSection = ref(false);

// Quick alarm custom time
const quickAlarmCustomMinutes = ref(45);

// Quick alarm presets
const quickAlarmOptions: QuickAlarmOption[] = [
  { label: '30 min', minutes: 30, icon: 'mdi:timer-sand' },
  { label: '1 hour', minutes: 60, icon: 'mdi:clock-outline' },
  { label: '6 hours', minutes: 360, icon: 'mdi:sleep' },
];

// Lifecycle
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});

// Watch config changes
watch(() => props.config, (newConfig) => {
  clockCollapsed.value = newConfig.collapse_clock ?? false;
  quickAlarmCollapsed.value = newConfig.collapse_quick_alarm ?? false;
  alarmListCollapsed.value = newConfig.collapse_alarm_list ?? false;
  addSectionCollapsed.value = newConfig.collapse_add_section ?? true;
}, { deep: true });

// Computed
const cardTitle = computed(() => props.config.title || 'Calendar Alarm Clock');

const clockDisplay = computed(() => props.config.clock_display ?? 'analog');
const showClock = computed(() => props.config.show_clock !== false);
const showQuickAlarm = computed(() => props.config.show_quick_alarm !== false);
const showAlarmList = computed(() => props.config.show_alarm_list !== false);
const addSectionMode = computed(() => props.config.show_add_section ?? 'auto');

const shouldShowAddSection = computed(() => {
  if (addSectionMode.value === 'on') return true;
  if (addSectionMode.value === 'off') return false;
  return showAddSection.value;
});

const isSingleAlarmView = computed(() => !!props.config.entity);

const alarms = computed<Alarm[]>(() => {
  if (!props.hass) return [];

  const result: Alarm[] = [];
  const states = props.hass.states;

  for (const entityId in states) {
    const state = states[entityId];
    if (
      entityId.startsWith('sensor.')
      && state.attributes.alarm_id
      && !entityId.includes('_next_alarm')
      && !entityId.includes('_previous_alarm')
    ) {
      result.push({
        entity_id: entityId,
        alarm_id: state.attributes.alarm_id as string,
        name: (state.attributes.name as string) || 'Alarm',
        time: (state.attributes.time as string) || null,
        enabled: state.attributes.enabled !== false,
        repeat: (state.attributes.repeat as string) || 'none',
        snooze_count: (state.attributes.snooze_count as number) || 0,
        timeout: (state.attributes.timeout as number) || null,
        max_snoozes: (state.attributes.max_snoozes as number) || null,
        snooze_duration: (state.attributes.snooze_duration as number) || null,
        next_snooze_time: (state.attributes.next_snooze_time as string) || null,
        state: state.state as AlarmState,
      });
    }
  }

  return result;
});

const filteredAlarms = computed<Alarm[]>(() => {
  const mode = props.config.alarm_list_mode ?? 'days';
  const sorted = [...alarms.value].sort((a, b) => {
    const timeA = a.time ? new Date(a.time).getTime() : 0;
    const timeB = b.time ? new Date(b.time).getTime() : 0;
    return timeA - timeB;
  });

  if (mode === 'count') {
    const count = props.config.alarm_list_count ?? 10;
    return sorted.slice(0, count);
  }

  // Filter by days
  const days = props.config.alarm_list_days ?? 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  cutoff.setHours(23, 59, 59, 999);

  return sorted.filter((alarm) => {
    if (!alarm.time) return true;
    const alarmDate = new Date(alarm.time);
    return alarmDate <= cutoff;
  });
});

const selectedAlarm = computed<Alarm | null>(() => {
  if (!props.config.entity || !props.hass) return null;

  const state = props.hass.states[props.config.entity];
  if (!state) return null;

  return {
    entity_id: props.config.entity,
    alarm_id: state.attributes.alarm_id as string,
    name: (state.attributes.name as string) || 'Alarm',
    time: (state.attributes.time as string) || null,
    enabled: state.attributes.enabled !== false,
    repeat: (state.attributes.repeat as string) || 'none',
    snooze_count: (state.attributes.snooze_count as number) || 0,
    timeout: (state.attributes.timeout as number) || null,
    max_snoozes: (state.attributes.max_snoozes as number) || null,
    snooze_duration: (state.attributes.snooze_duration as number) || null,
    next_snooze_time: (state.attributes.next_snooze_time as string) || null,
    state: state.state as AlarmState,
  };
});

const nextAlarm = computed<NextAlarmInfo | null>(() => {
  if (!props.hass) return null;

  for (const entityId in props.hass.states) {
    if (entityId.includes('_next_alarm')) {
      const state = props.hass.states[entityId];
      if (state.state && state.state !== 'unknown') {
        return {
          time: (state.attributes.time as string) || null,
          name: (state.attributes.name as string) || 'Alarm',
          state: (state.attributes.state as AlarmState) || 'before',
        };
      }
    }
  }

  return null;
});

const isNextAlarmRinging = computed(() => {
  return (
    nextAlarm.value
    && (nextAlarm.value.state === 'ringing' || nextAlarm.value.state === 'ringing_snooze')
  );
});

const ringingAlarms = computed<Alarm[]>(() => {
  return alarms.value.filter((alarm) => isAlarmRinging(alarm));
});

// Clock computations
const currentHours = computed(() => currentTime.value.getHours());
const currentMinutes = computed(() => currentTime.value.getMinutes());
const currentSeconds = computed(() => currentTime.value.getSeconds());

const hourHandRotation = computed(() => {
  const hours = currentHours.value % 12;
  const minutes = currentMinutes.value;
  return (hours * 30) + (minutes * 0.5);
});

const minuteHandRotation = computed(() => {
  return currentMinutes.value * 6;
});

const secondHandRotation = computed(() => {
  return currentSeconds.value * 6;
});

const isNightTime = computed(() => {
  const hour = currentHours.value;
  return hour < 6 || hour >= 20;
});

const formattedTime24h = computed(() => {
  return currentTime.value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
});

const formattedTime12h = computed(() => {
  return currentTime.value.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
});

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
});

// Next alarm urgency (for indicator color)
const nextAlarmUrgency = computed<'none' | 'urgent' | 'soon'>(() => {
  if (!nextAlarm.value?.time) return 'none';

  const alarmTime = new Date(nextAlarm.value.time);
  const now = new Date();
  const hoursUntil = (alarmTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil <= 0) return 'urgent';
  if (hoursUntil <= 12) return 'urgent';
  return 'soon';
});

// Methods
function formatTime(isoTime: string | null): string {
  if (!isoTime) return '--:--';
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoTime;
  }
}

function formatAlarmDay(isoTime: string | null): string {
  if (!isoTime) return '';
  try {
    const date = new Date(isoTime);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  } catch {
    return '';
  }
}

function formatRepeat(repeat: string): string {
  const labels: Record<string, string> = {
    none: 'Once',
    daily: 'Daily',
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    weekly: 'Weekly',
  };
  return labels[repeat] || repeat;
}

function getAlarmIcon(alarm: Alarm): string {
  if (isAlarmRinging(alarm)) return 'mdi:alarm-note';
  if (alarm.state === 'snoozed') return 'mdi:alarm-snooze';
  if (!alarm.enabled) return 'mdi:alarm-off';
  return 'mdi:alarm';
}

function getStatusText(alarm: Alarm): string {
  const states: Record<AlarmState, string> = {
    before: 'Scheduled',
    ringing: 'Ringing!',
    ringing_snooze: 'Ringing (Snoozed)!',
    snoozed: 'Snoozed',
    dismissed: 'Dismissed',
    timed_out: 'Timed Out',
  };
  return states[alarm.state] || alarm.state;
}

function isAlarmRinging(alarm: Alarm): boolean {
  return alarm.state === 'ringing' || alarm.state === 'ringing_snooze';
}

function isAlarmNightTime(isoTime: string | null): boolean {
  if (!isoTime) return false;
  const date = new Date(isoTime);
  const hour = date.getHours();
  return hour < 6 || hour >= 20;
}

function getAlarmClockHands(isoTime: string | null): { hour: number; minute: number; } {
  if (!isoTime) return { hour: 0, minute: 0 };
  const date = new Date(isoTime);
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  return {
    hour: (hours * 30) + (minutes * 0.5),
    minute: minutes * 6,
  };
}

async function toggleAlarm(alarm: Alarm): Promise<void> {
  if (!props.hass) return;

  const service = alarm.enabled ? 'disable_alarm' : 'enable_alarm';
  await props.hass.callService('plugin_template', service, {
    alarm_id: alarm.alarm_id,
  });
}

async function snoozeAlarm(alarm: Alarm): Promise<void> {
  if (!props.hass) return;

  await props.hass.callService('plugin_template', 'snooze_alarm', {
    alarm_id: alarm.alarm_id,
  });
}

async function dismissAlarm(alarm: Alarm): Promise<void> {
  if (!props.hass) return;

  await props.hass.callService('plugin_template', 'dismiss_alarm', {
    alarm_id: alarm.alarm_id,
  });
}

async function deleteAlarm(alarm: Alarm): Promise<void> {
  if (!props.hass) return;

  if (confirm(`Delete alarm "${alarm.name}"?`)) {
    await props.hass.callService('plugin_template', 'delete_alarm', {
      alarm_id: alarm.alarm_id,
    });
  }
}

async function createQuickAlarm(minutes: number): Promise<void> {
  if (!props.hass) return;

  const alarmTime = new Date();
  alarmTime.setMinutes(alarmTime.getMinutes() + minutes);

  const timeStr = alarmTime.toTimeString().slice(0, 5);
  const dateStr = alarmTime.toISOString().split('T')[0];

  const label = minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ''}`;

  await props.hass.callService('plugin_template', 'create_alarm', {
    name: `Quick Alarm (${label})`,
    time: timeStr,
    date: dateStr,
    repeat: 'none',
    enabled: true,
  });
}

function openAddDialog(): void {
  isEditing.value = false;
  editingAlarmId.value = null;
  dialogData.value = {
    name: 'Alarm',
    time: '07:00',
    date: new Date().toISOString().split('T')[0],
    repeat: 'none',
    enabled: true,
  };
  showDialog.value = true;
}

function openEditDialog(alarm: Alarm): void {
  isEditing.value = true;
  editingAlarmId.value = alarm.alarm_id;

  let time = '07:00';
  let date = new Date().toISOString().split('T')[0];

  if (alarm.time) {
    try {
      const d = new Date(alarm.time);
      time = d.toTimeString().slice(0, 5);
      date = d.toISOString().split('T')[0];
    } catch {
      // Use defaults
    }
  }

  dialogData.value = {
    name: alarm.name,
    time,
    date,
    repeat: alarm.repeat as RepeatPattern,
    enabled: alarm.enabled,
  };
  showDialog.value = true;
}

function closeDialog(): void {
  showDialog.value = false;
}

async function saveAlarm(): Promise<void> {
  if (!props.hass) return;

  if (isEditing.value && editingAlarmId.value) {
    await props.hass.callService('plugin_template', 'edit_alarm', {
      alarm_id: editingAlarmId.value,
      name: dialogData.value.name,
      time: dialogData.value.time,
      repeat: dialogData.value.repeat,
      enabled: dialogData.value.enabled,
    });
  } else {
    await props.hass.callService('plugin_template', 'create_alarm', {
      name: dialogData.value.name,
      time: dialogData.value.time,
      date: dialogData.value.date,
      repeat: dialogData.value.repeat,
      enabled: dialogData.value.enabled,
    });
  }

  closeDialog();
  showAddSection.value = false;
}

function handleSwitchChange(alarm: Alarm, event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.checked !== alarm.enabled) {
    toggleAlarm(alarm);
  }
}

function handleDialogEnabledChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  dialogData.value.enabled = target.checked;
}

function handleRepeatChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  dialogData.value.repeat = target.value as RepeatPattern;
}

function toggleSection(section: 'clock' | 'quickAlarm' | 'alarmList' | 'addSection'): void {
  switch (section) {
    case 'clock':
      clockCollapsed.value = !clockCollapsed.value;
      break;
    case 'quickAlarm':
      quickAlarmCollapsed.value = !quickAlarmCollapsed.value;
      break;
    case 'alarmList':
      alarmListCollapsed.value = !alarmListCollapsed.value;
      break;
    case 'addSection':
      addSectionCollapsed.value = !addSectionCollapsed.value;
      break;
  }
}

function handleAddButtonClick(): void {
  if (addSectionMode.value === 'auto') {
    showAddSection.value = true;
    addSectionCollapsed.value = false;
  } else {
    openAddDialog();
  }
}
</script>

<template>
  <ha-card>
    <h1 class="card-header">
      <ha-icon icon="mdi:calendar-clock" class="header-icon" />
      {{ cardTitle }}
    </h1>

    <div class="card-content">
      <!-- Ringing Alarms Banner (always on top) -->
      <div
        v-for="alarm in ringingAlarms"
        :key="'ringing-' + alarm.alarm_id"
        class="ringing-alarm-banner"
      >
        <div class="ringing-alarm-icon shake">
          <ha-icon icon="mdi:alarm-note" />
        </div>
        <div class="ringing-alarm-info">
          <div class="ringing-alarm-label">ALARM RINGING</div>
          <div class="ringing-alarm-time">{{ formatTime(alarm.time) }}</div>
          <div class="ringing-alarm-name">{{ alarm.name }}</div>
        </div>
        <div class="ringing-alarm-actions">
          <mwc-button
            raised
            class="snooze-button"
            @click="snoozeAlarm(alarm)"
          >
            <ha-icon icon="mdi:alarm-snooze" slot="icon" />
            Snooze
          </mwc-button>
          <mwc-button
            raised
            class="dismiss-button"
            @click="dismissAlarm(alarm)"
          >
            <ha-icon icon="mdi:alarm-off" slot="icon" />
            Dismiss
          </mwc-button>
        </div>
      </div>

      <!-- Single Alarm View (when entity is configured) -->
      <div v-if="isSingleAlarmView && selectedAlarm" class="single-alarm-view">
        <div
          class="single-alarm-icon"
          :class="{
            shake: isAlarmRinging(selectedAlarm),
            disabled: !selectedAlarm.enabled,
          }"
        >
          <ha-icon :icon="getAlarmIcon(selectedAlarm)" />
        </div>
        <div class="single-alarm-time">{{ formatTime(selectedAlarm.time) }}</div>
        <div class="single-alarm-name">{{ selectedAlarm.name }}</div>
        <div class="single-alarm-status" :class="{ ringing: isAlarmRinging(selectedAlarm) }">
          {{ getStatusText(selectedAlarm) }}
        </div>

        <div v-if="isAlarmRinging(selectedAlarm)" class="single-alarm-actions">
          <mwc-button raised class="snooze-button" @click="snoozeAlarm(selectedAlarm)">
            <ha-icon icon="mdi:alarm-snooze" slot="icon" />
            Snooze
          </mwc-button>
          <mwc-button raised class="dismiss-button" @click="dismissAlarm(selectedAlarm)">
            <ha-icon icon="mdi:alarm-off" slot="icon" />
            Dismiss
          </mwc-button>
        </div>

        <div v-else class="single-alarm-toggle">
          <ha-switch
            :checked="selectedAlarm.enabled"
            @change="handleSwitchChange(selectedAlarm, $event)"
          />
          <span class="toggle-label">{{ selectedAlarm.enabled ? 'Enabled' : 'Disabled' }}</span>
        </div>

        <ha-expansion-panel outlined header="Details">
          <div class="details-content">
            <div class="detail-row">
              <span class="detail-label">Repeat</span>
              <span class="detail-value">{{ formatRepeat(selectedAlarm.repeat) }}</span>
            </div>
            <div v-if="selectedAlarm.snooze_count > 0" class="detail-row">
              <span class="detail-label">Snooze Count</span>
              <span class="detail-value">{{ selectedAlarm.snooze_count }}</span>
            </div>
          </div>
        </ha-expansion-panel>

        <div class="single-alarm-buttons">
          <ha-icon-button @click="openEditDialog(selectedAlarm)">
            <ha-icon icon="mdi:pencil" />
          </ha-icon-button>
          <ha-icon-button class="delete-button" @click="deleteAlarm(selectedAlarm)">
            <ha-icon icon="mdi:delete" />
          </ha-icon-button>
        </div>
      </div>

      <!-- Multi-Alarm View -->
      <template v-else>
        <!-- Clock Section -->
        <ha-expansion-panel
          v-if="showClock && clockDisplay !== 'none'"
          :expanded="!clockCollapsed"
          outlined
          @expanded-changed="toggleSection('clock')"
        >
          <div slot="header" class="section-header">
            <ha-icon icon="mdi:clock-outline" />
            <span>Current Time</span>
            <span
              v-if="nextAlarm && nextAlarmUrgency !== 'none'"
              class="alarm-indicator"
              :class="nextAlarmUrgency"
            >
              <ha-icon icon="mdi:alarm" />
            </span>
          </div>

          <div class="clock-section" :class="{ night: isNightTime }">
            <!-- Analog Clock -->
            <div v-if="clockDisplay === 'analog'" class="analog-clock-container">
              <svg class="analog-clock" viewBox="0 0 200 200">
                <!-- Clock face -->
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  class="clock-face"
                  :class="{ night: isNightTime }"
                />

                <!-- Hour markers -->
                <g class="hour-markers">
                  <line
                    v-for="i in 12"
                    :key="i"
                    x1="100"
                    y1="15"
                    x2="100"
                    y2="25"
                    :transform="`rotate(${i * 30}, 100, 100)`"
                  />
                </g>

                <!-- Minute markers -->
                <g class="minute-markers">
                  <line
                    v-for="i in 60"
                    :key="i"
                    x1="100"
                    y1="18"
                    x2="100"
                    y2="22"
                    :transform="`rotate(${i * 6}, 100, 100)`"
                  />
                </g>

                <!-- Next alarm indicator -->
                <g v-if="nextAlarm?.time" class="alarm-hand-group">
                  <line
                    class="alarm-hand"
                    :class="nextAlarmUrgency"
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="35"
                    :transform="`rotate(${getAlarmClockHands(nextAlarm.time).hour}, 100, 100)`"
                  />
                </g>

                <!-- Hour hand -->
                <line
                  class="hour-hand"
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="50"
                  :transform="`rotate(${hourHandRotation}, 100, 100)`"
                />

                <!-- Minute hand -->
                <line
                  class="minute-hand"
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="25"
                  :transform="`rotate(${minuteHandRotation}, 100, 100)`"
                />

                <!-- Second hand -->
                <line
                  class="second-hand"
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="20"
                  :transform="`rotate(${secondHandRotation}, 100, 100)`"
                />

                <!-- Center dot -->
                <circle cx="100" cy="100" r="5" class="center-dot" />
              </svg>

              <div class="clock-date">{{ formattedDate }}</div>
            </div>

            <!-- Digital Clock 24h -->
            <div v-else-if="clockDisplay === '24h'" class="digital-clock-container">
              <div class="digital-time">{{ formattedTime24h }}</div>
              <div class="digital-date">{{ formattedDate }}</div>
              <div
                v-if="nextAlarm"
                class="digital-next-alarm"
                :class="nextAlarmUrgency"
              >
                <ha-icon icon="mdi:alarm" />
                <span>{{ formatTime(nextAlarm.time) }}</span>
              </div>
            </div>

            <!-- Digital Clock 12h -->
            <div v-else-if="clockDisplay === '12h'" class="digital-clock-container">
              <div class="digital-time">{{ formattedTime12h }}</div>
              <div class="digital-date">{{ formattedDate }}</div>
              <div
                v-if="nextAlarm"
                class="digital-next-alarm"
                :class="nextAlarmUrgency"
              >
                <ha-icon icon="mdi:alarm" />
                <span>{{ formatTime(nextAlarm.time) }}</span>
              </div>
            </div>

            <!-- Add alarm button in clock section -->
            <ha-icon-button
              class="clock-add-button"
              @click="handleAddButtonClick"
            >
              <ha-icon icon="mdi:alarm-plus" />
            </ha-icon-button>
          </div>
        </ha-expansion-panel>

        <!-- Quick Alarm Section -->
        <ha-expansion-panel
          v-if="showQuickAlarm"
          :expanded="!quickAlarmCollapsed"
          outlined
          @expanded-changed="toggleSection('quickAlarm')"
        >
          <div slot="header" class="section-header">
            <ha-icon icon="mdi:timer-outline" />
            <span>Quick Alarm</span>
          </div>

          <div class="quick-alarm-section">
            <div class="quick-alarm-presets">
              <mwc-button
                v-for="option in quickAlarmOptions"
                :key="option.minutes"
                outlined
                dense
                @click="createQuickAlarm(option.minutes)"
              >
                <ha-icon :icon="option.icon" slot="icon" />
                {{ option.label }}
              </mwc-button>
            </div>

            <div class="quick-alarm-custom">
              <input
                v-model.number="quickAlarmCustomMinutes"
                type="number"
                min="1"
                max="1440"
                class="custom-minutes-input"
              />
              <span class="custom-label">min</span>
              <mwc-button
                outlined
                dense
                @click="createQuickAlarm(quickAlarmCustomMinutes)"
              >
                Set
              </mwc-button>
            </div>
          </div>
        </ha-expansion-panel>

        <!-- Alarm List Section -->
        <ha-expansion-panel
          v-if="showAlarmList"
          :expanded="!alarmListCollapsed"
          outlined
          @expanded-changed="toggleSection('alarmList')"
        >
          <div slot="header" class="section-header">
            <ha-icon icon="mdi:format-list-bulleted" />
            <span>Alarms</span>
            <span class="alarm-count">{{ filteredAlarms.length }}</span>
          </div>

          <div class="alarm-list-section">
            <div v-if="filteredAlarms.length === 0" class="no-alarms">
              <ha-icon icon="mdi:alarm-plus" />
              <p>No alarms scheduled</p>
              <mwc-button outlined @click="handleAddButtonClick">
                Add Alarm
              </mwc-button>
            </div>

            <div
              v-for="alarm in filteredAlarms"
              :key="alarm.alarm_id"
              class="alarm-list-item"
              :class="{
                ringing: isAlarmRinging(alarm),
                disabled: !alarm.enabled,
              }"
            >
              <!-- Mini SVG Clock -->
              <div class="alarm-mini-clock" :class="{ night: isAlarmNightTime(alarm.time) }">
                <svg viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="23" class="mini-clock-face" />
                  <g class="mini-hour-markers">
                    <line
                      v-for="i in 12"
                      :key="i"
                      x1="25"
                      y1="5"
                      x2="25"
                      y2="8"
                      :transform="`rotate(${i * 30}, 25, 25)`"
                    />
                  </g>
                  <line
                    class="mini-hour-hand"
                    x1="25"
                    y1="25"
                    x2="25"
                    y2="14"
                    :transform="`rotate(${getAlarmClockHands(alarm.time).hour}, 25, 25)`"
                  />
                  <line
                    class="mini-minute-hand"
                    x1="25"
                    y1="25"
                    x2="25"
                    y2="8"
                    :transform="`rotate(${getAlarmClockHands(alarm.time).minute}, 25, 25)`"
                  />
                  <circle cx="25" cy="25" r="2" class="mini-center-dot" />
                </svg>
              </div>

              <!-- Alarm Info -->
              <div class="alarm-info">
                <div class="alarm-time-row">
                  <span class="alarm-time">{{ formatTime(alarm.time) }}</span>
                  <span class="alarm-day">{{ formatAlarmDay(alarm.time) }}</span>
                </div>
                <div class="alarm-details-row">
                  <span class="alarm-name">{{ alarm.name }}</span>
                  <span v-if="alarm.repeat !== 'none'" class="alarm-repeat">
                    {{ formatRepeat(alarm.repeat) }}
                  </span>
                </div>
              </div>

              <!-- Alarm Actions -->
              <div class="alarm-actions">
                <template v-if="isAlarmRinging(alarm)">
                  <ha-icon-button @click.stop="snoozeAlarm(alarm)">
                    <ha-icon icon="mdi:alarm-snooze" />
                  </ha-icon-button>
                  <ha-icon-button @click.stop="dismissAlarm(alarm)">
                    <ha-icon icon="mdi:alarm-off" />
                  </ha-icon-button>
                </template>
                <template v-else>
                  <ha-switch
                    :checked="alarm.enabled"
                    @change="handleSwitchChange(alarm, $event)"
                    @click.stop
                  />
                  <ha-icon-button @click.stop="openEditDialog(alarm)">
                    <ha-icon icon="mdi:pencil" />
                  </ha-icon-button>
                  <ha-icon-button @click.stop="deleteAlarm(alarm)">
                    <ha-icon icon="mdi:delete" />
                  </ha-icon-button>
                </template>
              </div>
            </div>
          </div>
        </ha-expansion-panel>

        <!-- Add Alarm Section (inline form) -->
        <ha-expansion-panel
          v-if="shouldShowAddSection"
          :expanded="!addSectionCollapsed"
          outlined
          @expanded-changed="toggleSection('addSection')"
        >
          <div slot="header" class="section-header">
            <ha-icon icon="mdi:alarm-plus" />
            <span>Add Alarm</span>
          </div>

          <div class="add-alarm-section">
            <ha-textfield
              label="Name"
              :value="dialogData.name"
              @input="dialogData.name = ($event.target as HTMLInputElement).value"
            />

            <div class="form-row-inline">
              <div class="form-field">
                <label class="form-label">Time</label>
                <input
                  type="time"
                  class="ha-time-input"
                  :value="dialogData.time"
                  @input="dialogData.time = ($event.target as HTMLInputElement).value"
                />
              </div>
              <div class="form-field">
                <label class="form-label">Date</label>
                <input
                  type="date"
                  class="ha-date-input"
                  :value="dialogData.date"
                  @input="dialogData.date = ($event.target as HTMLInputElement).value"
                />
              </div>
            </div>

            <ha-select
              label="Repeat"
              :value="dialogData.repeat"
              @selected="handleRepeatChange"
            >
              <mwc-list-item value="none">Never</mwc-list-item>
              <mwc-list-item value="daily">Daily</mwc-list-item>
              <mwc-list-item value="weekdays">Weekdays</mwc-list-item>
              <mwc-list-item value="weekends">Weekends</mwc-list-item>
              <mwc-list-item value="weekly">Weekly</mwc-list-item>
            </ha-select>

            <div class="add-alarm-actions">
              <mwc-button
                v-if="addSectionMode === 'auto'"
                outlined
                @click="showAddSection = false"
              >
                Cancel
              </mwc-button>
              <mwc-button raised @click="saveAlarm">
                <ha-icon icon="mdi:check" slot="icon" />
                Create Alarm
              </mwc-button>
            </div>
          </div>
        </ha-expansion-panel>

        <!-- FAB (only shown when add section is not visible) -->
        <ha-fab
          v-if="!shouldShowAddSection"
          extended
          label="Add Alarm"
          @click="handleAddButtonClick"
        >
          <ha-icon slot="icon" icon="mdi:plus" />
        </ha-fab>
      </template>
    </div>

    <!-- Add/Edit Dialog (for editing existing alarms) -->
    <ha-dialog
      :open="showDialog"
      heading=""
      @closed="closeDialog"
    >
      <div slot="heading" class="dialog-heading">
        <ha-icon :icon="isEditing ? 'mdi:pencil' : 'mdi:alarm-plus'" />
        <span>{{ isEditing ? 'Edit Alarm' : 'Add Alarm' }}</span>
      </div>

      <div class="dialog-content">
        <ha-textfield
          label="Name"
          :value="dialogData.name"
          @input="dialogData.name = ($event.target as HTMLInputElement).value"
        />

        <div class="form-row">
          <label class="form-label">Time</label>
          <input
            type="time"
            class="ha-time-input"
            :value="dialogData.time"
            @input="dialogData.time = ($event.target as HTMLInputElement).value"
          />
        </div>

        <div class="form-row">
          <label class="form-label">Date</label>
          <input
            type="date"
            class="ha-date-input"
            :value="dialogData.date"
            @input="dialogData.date = ($event.target as HTMLInputElement).value"
          />
        </div>

        <ha-select
          label="Repeat"
          :value="dialogData.repeat"
          @selected="handleRepeatChange"
        >
          <mwc-list-item value="none">Never</mwc-list-item>
          <mwc-list-item value="daily">Daily</mwc-list-item>
          <mwc-list-item value="weekdays">Weekdays</mwc-list-item>
          <mwc-list-item value="weekends">Weekends</mwc-list-item>
          <mwc-list-item value="weekly">Weekly</mwc-list-item>
        </ha-select>

        <ha-formfield label="Enabled">
          <ha-switch
            :checked="dialogData.enabled"
            @change="handleDialogEnabledChange"
          />
        </ha-formfield>
      </div>

      <mwc-button slot="secondaryAction" dialogAction="cancel">
        Cancel
      </mwc-button>
      <mwc-button slot="primaryAction" @click="saveAlarm">
        Save
      </mwc-button>
    </ha-dialog>
  </ha-card>
</template>

<style scoped>
:host {
  --alarm-ringing-color: var(--error-color, #db4437);
  --alarm-snooze-color: var(--warning-color, #ff9800);
  --alarm-urgent-color: var(--error-color, #db4437);
  --alarm-soon-color: var(--warning-color, #ff9800);
  --clock-night-bg: #1a237e;
  --clock-day-bg: #e3f2fd;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.header-icon {
  --mdc-icon-size: 24px;
}

.card-content {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.section-header ha-icon {
  --mdc-icon-size: 20px;
  color: var(--primary-color);
}

.alarm-indicator {
  margin-left: auto;
  --mdc-icon-size: 16px;
}

.alarm-indicator.urgent {
  color: var(--alarm-urgent-color);
  animation: pulse 1s ease-in-out infinite;
}

.alarm-indicator.soon {
  color: var(--alarm-soon-color);
}

.alarm-count {
  margin-left: auto;
  background: var(--primary-color);
  color: var(--text-primary-color, white);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

/* Ringing Alarm Banner */
.ringing-alarm-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  margin: 0 -16px 8px;
  background: var(--error-color, #db4437);
  color: white;
  text-align: center;
  animation: pulse 1s ease-in-out infinite;
}

.ringing-alarm-icon {
  --mdc-icon-size: 56px;
  margin-bottom: 8px;
}

.ringing-alarm-info {
  margin-bottom: 16px;
}

.ringing-alarm-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.ringing-alarm-time {
  font-size: 48px;
  font-weight: 500;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.ringing-alarm-name {
  font-size: 18px;
  opacity: 0.9;
}

.ringing-alarm-actions {
  display: flex;
  gap: 16px;
}

.snooze-button {
  --mdc-theme-primary: var(--alarm-snooze-color);
  --mdc-theme-on-primary: white;
}

.dismiss-button {
  --mdc-theme-primary: rgba(255, 255, 255, 0.3);
  --mdc-theme-on-primary: white;
}

/* Clock Section */
.clock-section {
  position: relative;
  padding: 16px;
  border-radius: 8px;
  background: var(--clock-day-bg);
  transition: background 0.3s;
}

.clock-section.night {
  background: var(--clock-night-bg);
}

.analog-clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.analog-clock {
  width: 180px;
  height: 180px;
}

.clock-face {
  fill: var(--card-background-color, white);
  stroke: var(--divider-color);
  stroke-width: 2;
}

.clock-face.night {
  fill: #303f9f;
}

.hour-markers line {
  stroke: var(--primary-text-color);
  stroke-width: 2;
  stroke-linecap: round;
}

.minute-markers line {
  stroke: var(--secondary-text-color);
  stroke-width: 1;
  opacity: 0.5;
}

.hour-hand {
  stroke: var(--primary-text-color);
  stroke-width: 4;
  stroke-linecap: round;
}

.minute-hand {
  stroke: var(--primary-text-color);
  stroke-width: 3;
  stroke-linecap: round;
}

.second-hand {
  stroke: var(--primary-color);
  stroke-width: 1.5;
  stroke-linecap: round;
}

.alarm-hand {
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 4 4;
  opacity: 0.7;
}

.alarm-hand.urgent {
  stroke: var(--alarm-urgent-color);
}

.alarm-hand.soon {
  stroke: var(--alarm-soon-color);
}

.center-dot {
  fill: var(--primary-color);
}

.clock-date {
  margin-top: 12px;
  font-size: 14px;
  color: var(--secondary-text-color);
}

.clock-section.night .clock-date {
  color: rgba(255, 255, 255, 0.7);
}

.clock-add-button {
  position: absolute;
  top: 8px;
  right: 8px;
}

/* Digital Clock */
.digital-clock-container {
  text-align: center;
  padding: 16px;
}

.digital-time {
  font-size: 56px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  color: var(--primary-text-color);
  line-height: 1;
}

.clock-section.night .digital-time {
  color: white;
}

.digital-date {
  font-size: 16px;
  color: var(--secondary-text-color);
  margin-top: 8px;
}

.clock-section.night .digital-date {
  color: rgba(255, 255, 255, 0.7);
}

.digital-next-alarm {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
}

.digital-next-alarm.urgent {
  background: var(--alarm-urgent-color);
  color: white;
}

.digital-next-alarm.soon {
  background: var(--alarm-soon-color);
  color: white;
}

.digital-next-alarm ha-icon {
  --mdc-icon-size: 16px;
}

/* Quick Alarm Section */
.quick-alarm-section {
  padding: 16px;
}

.quick-alarm-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.quick-alarm-presets mwc-button {
  flex: 1;
  min-width: 80px;
}

.quick-alarm-custom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-minutes-input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid var(--divider-color);
  border-radius: 4px;
  font-size: 16px;
  background: var(--card-background-color);
  color: var(--primary-text-color);
}

.custom-label {
  color: var(--secondary-text-color);
}

/* Alarm List Section */
.alarm-list-section {
  padding: 8px 0;
}

.no-alarms {
  text-align: center;
  padding: 32px 16px;
  color: var(--secondary-text-color);
}

.no-alarms ha-icon {
  --mdc-icon-size: 48px;
  opacity: 0.5;
  margin-bottom: 12px;
}

.no-alarms p {
  margin: 0 0 16px;
}

.alarm-list-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid var(--divider-color);
}

.alarm-list-item:last-child {
  border-bottom: none;
}

.alarm-list-item.ringing {
  background: rgba(var(--rgb-error-color, 219, 68, 55), 0.1);
}

.alarm-list-item.disabled {
  opacity: 0.5;
}

/* Mini Clock */
.alarm-mini-clock {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.alarm-mini-clock svg {
  width: 100%;
  height: 100%;
}

.mini-clock-face {
  fill: var(--card-background-color);
  stroke: var(--divider-color);
  stroke-width: 1.5;
}

.alarm-mini-clock.night .mini-clock-face {
  fill: #303f9f;
  stroke: #1a237e;
}

.mini-hour-markers line {
  stroke: var(--secondary-text-color);
  stroke-width: 1;
}

.alarm-mini-clock.night .mini-hour-markers line {
  stroke: rgba(255, 255, 255, 0.5);
}

.mini-hour-hand {
  stroke: var(--primary-text-color);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.mini-minute-hand {
  stroke: var(--primary-text-color);
  stroke-width: 2;
  stroke-linecap: round;
}

.alarm-mini-clock.night .mini-hour-hand,
.alarm-mini-clock.night .mini-minute-hand {
  stroke: white;
}

.mini-center-dot {
  fill: var(--primary-color);
}

/* Alarm Info */
.alarm-info {
  flex: 1;
  min-width: 0;
}

.alarm-time-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.alarm-time {
  font-size: 24px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.alarm-day {
  font-size: 12px;
  color: var(--secondary-text-color);
}

.alarm-details-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.alarm-name {
  font-size: 14px;
  color: var(--secondary-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-repeat {
  font-size: 11px;
  color: var(--primary-color);
  background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.alarm-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* Add Alarm Section */
.add-alarm-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row-inline {
  display: flex;
  gap: 16px;
}

.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.add-alarm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* Single Alarm View */
.single-alarm-view {
  text-align: center;
  padding: 24px 0;
}

.single-alarm-icon {
  --mdc-icon-size: 72px;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.single-alarm-icon.shake {
  color: var(--alarm-ringing-color);
}

.single-alarm-icon.disabled {
  color: var(--disabled-text-color);
}

.single-alarm-time {
  font-size: 48px;
  font-weight: 400;
  color: var(--primary-text-color);
  font-variant-numeric: tabular-nums;
}

.single-alarm-name {
  font-size: 20px;
  color: var(--secondary-text-color);
  margin-bottom: 4px;
}

.single-alarm-status {
  font-size: 14px;
  color: var(--secondary-text-color);
  margin-bottom: 24px;
}

.single-alarm-status.ringing {
  color: var(--alarm-ringing-color);
  font-weight: 500;
}

.single-alarm-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.single-alarm-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.toggle-label {
  font-size: 14px;
  color: var(--primary-text-color);
}

.details-content {
  padding: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--divider-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--secondary-text-color);
}

.detail-value {
  font-weight: 500;
  color: var(--primary-text-color);
}

.single-alarm-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.delete-button {
  --mdc-icon-button-ink-color: var(--alarm-ringing-color);
}

/* FAB */
ha-fab {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1;
}

/* Dialog */
.dialog-heading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-heading ha-icon {
  --mdc-icon-size: 24px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

ha-textfield,
ha-select {
  width: 100%;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ha-time-input,
.ha-date-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--divider-color);
  border-radius: 4px;
  font-size: 16px;
  font-family: inherit;
  background: var(--card-background-color);
  color: var(--primary-text-color);
  box-sizing: border-box;
}

.ha-time-input:focus,
.ha-date-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

ha-formfield {
  display: flex;
  align-items: center;
  --mdc-typography-body2-font-size: 14px;
}

/* Animations */
.shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0deg);
  }
  10% {
    transform: translateX(-2px) rotate(-5deg);
  }
  20% {
    transform: translateX(2px) rotate(5deg);
  }
  30% {
    transform: translateX(-2px) rotate(-5deg);
  }
  40% {
    transform: translateX(2px) rotate(5deg);
  }
  50% {
    transform: translateX(-1px) rotate(-2deg);
  }
  60% {
    transform: translateX(1px) rotate(2deg);
  }
  70% {
    transform: translateX(-1px) rotate(-2deg);
  }
  80% {
    transform: translateX(1px) rotate(2deg);
  }
  90% {
    transform: translateX(0) rotate(0deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Expansion Panel Styling */
ha-expansion-panel {
  --expansion-panel-summary-padding: 0 16px;
  --expansion-panel-content-padding: 0;
}
</style>
