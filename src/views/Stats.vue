<script setup>
import { ref, onMounted } from "vue";
import { useGymStore } from "../stores/useGymStore";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const store = useGymStore();

const exerciseChart = ref({
  labels: [],
  datasets: [
    {
      label: "Kopējais apjoms (kg)",
      data: [],
      backgroundColor: "rgba(34, 211, 238, 0.8)",
      borderColor: "rgba(34, 211, 238, 1)",
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
});

const top10Chart = ref({
  labels: [],
  datasets: [
    {
      label: "Volume per set (kg)",
      data: [],
      backgroundColor: "rgba(245, 158, 11, 0.8)",
      borderColor: "rgba(245, 158, 11, 1)",
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#22d3ee",
      bodyColor: "#fff",
      borderColor: "#334155",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
    y: {
      grid: { color: "rgba(51, 65, 85, 0.3)" },
      ticks: { color: "#94a3b8" },
    },
  },
};

const exerciseFilter = ref("Deadlift");
const fromDate = ref("2025-09-01");
const toDate = ref("2025-09-30");
const dateQuery = ref("2025-09-09");
const bodyPartQuery = ref("Back");

const exerciseResults = ref([]);
const sessionByDateResults = ref([]);
const exercisesByBodyPart = ref([]);

// Filter sessions by exercise & date
const loadExerciseData = async () => {
  if (!exerciseFilter.value || !fromDate.value || !toDate.value) return;
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api"
    }/sessions/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseName: exerciseFilter.value,
        fromDate: fromDate.value,
        toDate: toDate.value,
      }),
    }
  );
  const data = await response.json();
  exerciseResults.value = data;

  const volumeByDate = {};
  data.forEach((log) => {
    volumeByDate[log.date] = (volumeByDate[log.date] || 0) + log.volumeKg;
  });
  exerciseChart.value.labels = Object.keys(volumeByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  exerciseChart.value.datasets[0].data = Object.values(volumeByDate);
};

const loadSessionByDate = async () => {
  const res = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api"
    }/stats/by-date?date=${dateQuery.value}`
  );
  sessionByDateResults.value = await res.json();
};

// Exercises by body part
const loadExercisesByBodyPart = async () => {
  const res = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api"
    }/stats/by-bodypart?name=${bodyPartQuery.value}`
  );
  exercisesByBodyPart.value = await res.json();
};

const top10Sets = ref([]);
const heavySets = ref([]);
const last30Days = ref({});

const loadStaticData = async () => {
  const [top10, heavy, last30] = await Promise.all([
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api"
      }/stats/top10`
    ).then((r) => r.json()),
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api"
      }/stats/heavy`
    ).then((r) => r.json()),
    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api"
      }/stats/last30days`
    ).then((r) => r.json()),
  ]);

  top10Sets.value = top10;
  heavySets.value = heavy;
  last30Days.value = last30;

  // Prepare chart for Top10
  top10Chart.value.labels = top10.map((l) => `${l.exercise} (${l.date})`);
  top10Chart.value.datasets[0].data = top10.map((l) => l.volumeKg);
};

onMounted(async () => {
  await store.loadAll();
  await loadExerciseData();
  await loadStaticData();
  await loadSessionByDate();
  await loadExercisesByBodyPart();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-10 space-y-10">
    <h2 class="text-3xl font-bold text-white">Statistika</h2>

    <div class="space-y-6">
      <div class="mb-6 flex gap-4">
        <input
          v-model="exerciseFilter"
          placeholder="Exercise"
          class="p-2 rounded"
        />
        <input v-model="fromDate" type="date" class="p-2 rounded" />
        <input v-model="toDate" type="date" class="p-2 rounded" />
        <button
          @click="loadExerciseData"
          class="bg-cyan-400 px-4 rounded text-black"
        >
          Load
        </button>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-6 text-white">
          Treniņu apjoms (filtrēts)
        </h3>
        <div class="h-[400px]">
          <Bar
            :key="exerciseChart.labels.join(',')"
            :data="exerciseChart"
            :options="chartOptions"
          />
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="mb-4 flex gap-4">
          <input v-model="dateQuery" type="date" class="p-2 rounded" />
          <button
            @click="loadSessionByDate"
            class="bg-cyan-400 px-4 rounded text-black"
          >
            Load
          </button>
        </div>
        <h3 class="text-xl font-semibold mb-4 text-white">
          Workout Session on {{ dateQuery }}
        </h3>
        <table class="min-w-full text-white border border-slate-700">
          <thead>
            <tr class="bg-slate-800">
              <th class="p-2 border border-slate-700">Exercise</th>
              <th class="p-2 border border-slate-700">Set #</th>
              <th class="p-2 border border-slate-700">Weight (kg)</th>
              <th class="p-2 border border-slate-700">Reps</th>
              <th class="p-2 border border-slate-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in sessionByDateResults.logs || []"
              :key="log.setNumber + log.exercise"
              class="odd:bg-slate-700 even:bg-slate-800"
            >
              <td class="p-2 border border-slate-700">{{ log.exercise }}</td>
              <td class="p-2 border border-slate-700">{{ log.setNumber }}</td>
              <td class="p-2 border border-slate-700">{{ log.weightKg }}</td>
              <td class="p-2 border border-slate-700">{{ log.reps }}</td>
              <td class="p-2 border border-slate-700">
                {{ log.notes || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="mb-4 flex gap-4">
          <input
            v-model="bodyPartQuery"
            placeholder="Body Part"
            class="p-2 rounded"
          />
          <button
            @click="loadExercisesByBodyPart"
            class="bg-cyan-400 px-4 rounded text-black"
          >
            Load
          </button>
        </div>
        <h3 class="text-xl font-semibold mb-4 text-white">
          Exercises for "{{ bodyPartQuery }}"
        </h3>
        <table class="min-w-full text-white border border-slate-700">
          <thead>
            <tr class="bg-slate-800">
              <th class="p-2 border border-slate-700">Exercise</th>
              <th class="p-2 border border-slate-700">Body Parts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ex in exercisesByBodyPart"
              :key="ex.id"
              class="odd:bg-slate-700 even:bg-slate-800"
            >
              <td class="p-2 border border-slate-700">{{ ex.name }}</td>
              <td class="p-2 border border-slate-700">
                {{ ex.bodyParts.join(", ") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-6 text-white">
          Top 10 Heaviest Sets
        </h3>
        <div class="h-[400px]">
          <Bar
            :key="top10Chart.labels.join(',')"
            :data="top10Chart"
            :options="chartOptions"
          />
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-4 text-white">Sets above 100kg</h3>
        <table class="min-w-full text-white border border-slate-700">
          <thead>
            <tr class="bg-slate-800">
              <th class="p-2 border border-slate-700">Exercise</th>
              <th class="p-2 border border-slate-700">Weight (kg)</th>
              <th class="p-2 border border-slate-700">Reps</th>
              <th class="p-2 border border-slate-700">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in heavySets"
              :key="s.exercise + s.date"
              class="odd:bg-slate-700 even:bg-slate-800"
            >
              <td class="p-2 border border-slate-700">{{ s.exercise }}</td>
              <td class="p-2 border border-slate-700">{{ s.weightKg }}</td>
              <td class="p-2 border border-slate-700">{{ s.reps }}</td>
              <td class="p-2 border border-slate-700">{{ s.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-xl font-semibold mb-2 text-white">
          Sessions Last 30 Days
        </h3>
        <p class="text-white text-lg">
          Total sessions: {{ last30Days.sessionsLast30Days }}
        </p>
      </div>
    </div>
  </div>
</template>
