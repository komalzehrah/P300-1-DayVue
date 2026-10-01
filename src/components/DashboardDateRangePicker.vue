<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  startDate: string;
  endDate: string;
}>();

const emit = defineEmits<{
  "update:startDate": [value: string];
  "update:endDate": [value: string];
}>();

const showPicker = ref(false);
const draftStartDate = ref("");
const draftEndDate = ref("");
const selectedPreset = ref("");
const viewMonth = ref(new Date(2026, 5, 1));

const minDate = "2026-03-01";
const maxDate = "2026-07-31";
const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const quickRanges = [
  { id: "last-30-days", label: "Last 30 days" },
  { id: "last-2-months", label: "Last 2 months" },
  { id: "last-3-months", label: "Last 3 months" },
  { id: "last-12-months", label: "Last 12 months" },
  { id: "month-to-date", label: "Month to date" },
  { id: "quarter-to-date", label: "Quarter to date" },
];

interface CalendarDay {
  date: string;
  day: number;
}

interface CalendarMonth {
  key: string;
  label: string;
  days: Array<CalendarDay | null>;
}

const parseDate = (value: string) => {
  const [year = 1970, month = 1, day = 1] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toDateEnd = (value: string) => {
  const date = parseDate(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const toDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const createCalendarMonth = (date: Date): CalendarMonth => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<CalendarDay | null> = Array(firstDayOffset).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ date: toDateString(new Date(year, month, day)), day });
  }

  return {
    key: `${year}-${String(month + 1).padStart(2, "0")}`,
    label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    days,
  };
};

const displayedMonths = computed(() => {
  const firstMonth = new Date(
    viewMonth.value.getFullYear(),
    viewMonth.value.getMonth(),
    1,
  );
  return [
    createCalendarMonth(firstMonth),
    createCalendarMonth(
      new Date(firstMonth.getFullYear(), firstMonth.getMonth() + 1, 1),
    ),
  ];
});

const canGoPrevious = computed(
  () => displayedMonths.value[0]!.key > minDate.slice(0, 7),
);
const canGoNext = computed(
  () => displayedMonths.value[1]!.key < maxDate.slice(0, 7),
);

const formatDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options);

const rangeLabel = computed(() => {
  const start = formatDate(props.startDate, { month: "short", day: "numeric" });
  const end = formatDate(props.endDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${start} - ${end}`;
});

const openPicker = () => {
  draftStartDate.value = props.startDate;
  draftEndDate.value = props.endDate;
  selectedPreset.value = "";
  const endMonth = parseDate(props.endDate);
  viewMonth.value = new Date(
    endMonth.getFullYear(),
    endMonth.getMonth() - 1,
    1,
  );
  showPicker.value = true;
};

const navigateMonths = (amount: number) => {
  viewMonth.value = new Date(
    viewMonth.value.getFullYear(),
    viewMonth.value.getMonth() + amount,
    1,
  );
};

const selectDate = (date: string) => {
  if (date < minDate || date > maxDate) return;
  selectedPreset.value = "";

  if (!draftStartDate.value || draftEndDate.value) {
    draftStartDate.value = date;
    draftEndDate.value = "";
  } else if (date < draftStartDate.value) {
    draftEndDate.value = draftStartDate.value;
    draftStartDate.value = date;
  } else {
    draftEndDate.value = date;
  }
};

const selectQuickRange = (rangeId: string) => {
  const end = parseDate(props.endDate);
  const start = new Date(end);

  if (rangeId === "last-30-days") {
    start.setDate(start.getDate() - 29);
  } else if (rangeId === "last-2-months") {
    start.setDate(1);
    start.setMonth(start.getMonth() - 1);
  } else if (rangeId === "last-3-months") {
    start.setDate(1);
    start.setMonth(start.getMonth() - 2);
  } else if (rangeId === "last-12-months") {
    start.setDate(1);
    start.setMonth(start.getMonth() - 11);
  } else if (rangeId === "month-to-date") {
    start.setDate(1);
  } else if (rangeId === "quarter-to-date") {
    start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  }

  draftStartDate.value =
    toDateString(start) < minDate ? minDate : toDateString(start);
  draftEndDate.value = props.endDate;
  selectedPreset.value = rangeId;
};

const normalizeDraftRange = () => {
  selectedPreset.value = "";
  if (draftStartDate.value && draftStartDate.value > maxDate)
    draftStartDate.value = maxDate;
  if (draftEndDate.value && draftEndDate.value > maxDate)
    draftEndDate.value = maxDate;
  if (draftStartDate.value && draftStartDate.value < minDate)
    draftStartDate.value = minDate;
  if (draftEndDate.value && draftEndDate.value < minDate)
    draftEndDate.value = minDate;
  if (
    draftStartDate.value &&
    draftEndDate.value &&
    draftStartDate.value > draftEndDate.value
  ) {
    [draftStartDate.value, draftEndDate.value] = [
      draftEndDate.value,
      draftStartDate.value,
    ];
  }
};

const isInRange = (date: string) =>
  Boolean(
    draftStartDate.value &&
    draftEndDate.value &&
    date >= draftStartDate.value &&
    date <= draftEndDate.value,
  );
const isRangeEndpoint = (date: string) =>
  date === draftStartDate.value || date === draftEndDate.value;
const isDateDisabled = (date: string) => date < minDate || date > maxDate;

const applyRange = () => {
  if (!draftStartDate.value || !draftEndDate.value) return;
  emit("update:startDate", draftStartDate.value);
  emit("update:endDate", draftEndDate.value);
  showPicker.value = false;
};
</script>

<template>
  <header class="date-header">
    <div class="date-display">
      <div class="range-anchor">
        <button
          class="range-trigger"
          aria-label="Choose dashboard date range"
          :aria-expanded="showPicker"
          @click="openPicker"
        >
          <span>{{ rangeLabel }}</span>
          <ChevronDownIcon class="range-chevron-icon" />
        </button>

        <div v-if="showPicker" class="range-popover">
          <nav class="range-presets" aria-label="Quick date ranges">
            <button
              v-for="range in quickRanges"
              :key="range.id"
              type="button"
              :class="{ active: selectedPreset === range.id }"
              :aria-pressed="selectedPreset === range.id"
              @click="selectQuickRange(range.id)"
            >
              {{ range.label }}
            </button>
          </nav>

          <div class="range-main">
            <div class="calendar-months">
              <section
                v-for="(month, monthIndex) in displayedMonths"
                :key="month.key"
                class="calendar-month"
              >
                <header class="month-heading">
                  <button
                    v-if="monthIndex === 0"
                    type="button"
                    aria-label="Previous month"
                    :disabled="!canGoPrevious"
                    @click="navigateMonths(-1)"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span v-else class="month-nav-spacer" />
                  <h2>{{ month.label }}</h2>
                  <button
                    v-if="monthIndex === 1"
                    type="button"
                    aria-label="Next month"
                    :disabled="!canGoNext"
                    @click="navigateMonths(1)"
                  >
                    <ChevronRightIcon />
                  </button>
                  <span v-else class="month-nav-spacer" />
                </header>
                <div class="weekday-row">
                  <span v-for="weekday in weekdays" :key="weekday">{{
                    weekday
                  }}</span>
                </div>
                <div class="calendar-days">
                  <template
                    v-for="(day, dayIndex) in month.days"
                    :key="day?.date ?? `blank-${month.key}-${dayIndex}`"
                  >
                    <span v-if="!day" class="calendar-blank" />
                    <button
                      v-else
                      type="button"
                      class="calendar-date"
                      :class="{
                        'in-range': isInRange(day.date),
                        endpoint: isRangeEndpoint(day.date),
                      }"
                      :disabled="isDateDisabled(day.date)"
                      :aria-pressed="isRangeEndpoint(day.date)"
                      :aria-label="
                        formatDate(day.date, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      "
                      @click="selectDate(day.date)"
                    >
                      {{ day.day }}
                    </button>
                  </template>
                </div>
              </section>
            </div>

            <footer class="range-footer">
              <div class="date-fields">
                <label>
                  <span>Start date</span>
                  <input
                    v-model="draftStartDate"
                    type="date"
                    :min="minDate"
                    :max="maxDate"
                    @change="normalizeDraftRange"
                  />
                </label>
                <ArrowRightIcon class="date-range-arrow" aria-hidden="true" />
                <label>
                  <span>End date</span>
                  <input
                    v-model="draftEndDate"
                    type="date"
                    :min="minDate"
                    :max="maxDate"
                    @change="normalizeDraftRange"
                  />
                </label>
              </div>
              <div class="range-actions">
                <button
                  class="cancel-range"
                  type="button"
                  @click="showPicker = false"
                >
                  Cancel
                </button>
                <button
                  class="apply-range"
                  type="button"
                  :disabled="!draftStartDate || !draftEndDate"
                  @click="applyRange"
                >
                  Apply dates
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div v-if="showPicker" class="range-backdrop" @click="showPicker = false" />
</template>

<style scoped>
.date-header {
  position: relative;
  z-index: 100;
  flex: 0 0 auto;
  padding: 1rem;
  background: var(--bg-secondary);
}

.date-display {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.range-anchor {
  position: static;
}

.range-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 36px;
  padding: 0.25rem 0.5rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.range-trigger:hover {
  background: var(--bg-secondary);
}

.range-chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--accent-color);
}

.range-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.3);
}

.range-popover {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  width: min(860px, calc(100vw - 2rem));
  max-height: min(90dvh, 760px);
  overflow: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.3);
}

.range-presets {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0.75rem;
  border-right: 1px solid var(--border-color);
  background: var(--bg-primary);
}

.range-presets button {
  min-height: 36px;
  padding: 0.5rem 0.65rem;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-align: left;
}

.range-presets button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.range-presets button.active {
  background: var(--selected-surface);
  color: #051515;
}

.range-main {
  min-width: 0;
}

.calendar-months {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0.75rem;
}

.calendar-month {
  min-width: 0;
  padding: 0.25rem 0.5rem 0.75rem;
}

.calendar-month + .calendar-month {
  border-left: 1px solid var(--border-color);
}

.month-heading {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 30px;
  align-items: center;
  min-height: 36px;
  margin-bottom: 0.5rem;
}

.month-heading h2 {
  margin: 0;
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
}

.month-heading button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.month-heading button:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.month-heading button:disabled {
  cursor: default;
  opacity: 0.3;
}

.month-heading button :deep(svg) {
  width: 18px;
  height: 18px;
}

.month-nav-spacer {
  width: 30px;
}

.weekday-row,
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  justify-items: center;
}

.weekday-row {
  margin-bottom: 0.3rem;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 0.68rem;
  font-weight: 500;
}

.calendar-days {
  row-gap: 0.15rem;
}

.calendar-blank,
.calendar-date {
  width: 30px;
  height: 30px;
}

.calendar-date {
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.75rem;
}

.calendar-date:hover:not(:disabled) {
  background: var(--bg-tertiary);
}

.calendar-date.in-range {
  border-radius: 0;
  background: var(--bg-tertiary);
}

.calendar-date.endpoint {
  border-radius: 4px;
  background: var(--selected-surface);
  color: #051515;
}

.calendar-date:disabled {
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.3;
}

.range-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-top: 1px solid var(--border-color);
}

.date-fields {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-fields label {
  display: grid;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.62rem;
}

.date-fields input {
  width: 138px;
  min-height: 34px;
  padding: 0.35rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-ui);
  font-size: 0.72rem;
  color-scheme: dark;
}

.date-range-arrow {
  width: 16px;
  height: 16px;
  margin-top: 0.8rem;
  color: var(--text-secondary);
}

.range-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 0.5rem;
}

.cancel-range,
.apply-range {
  min-height: 34px;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  font-weight: 500;
}

.cancel-range {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.apply-range {
  border-color: #ff8c69;
  background: #ff8c69;
  color: #051515;
}

.apply-range:hover:not(:disabled) {
  border-color: #ff7a52;
  background: #ff7a52;
}

.apply-range:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 680px) {
  .range-popover {
    grid-template-columns: 118px minmax(0, 1fr);
  }

  .calendar-months {
    grid-template-columns: minmax(0, 1fr);
  }

  .calendar-month + .calendar-month {
    border-top: 1px solid var(--border-color);
    border-left: 0;
  }

  .range-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .range-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 440px) {
  .range-popover {
    left: 0;
    grid-template-columns: 1fr;
    transform: none;
  }

  .range-presets {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-right: 0;
    border-bottom: 1px solid var(--border-color);
    padding: 0.65rem;
  }

  .date-fields {
    justify-content: space-between;
  }

  .date-fields input {
    width: min(34vw, 138px);
  }
}

@media (min-width: 768px) {
  .date-header {
    padding: 1.25rem 2rem;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
