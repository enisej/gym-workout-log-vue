<script setup>
import { onMounted } from "vue";
import { useGymStore } from "../stores/useGymStore";

const store = useGymStore();

onMounted(() => store.loadAll());

const confirmDelete = (id) => {
  if (confirm("Vai tiešām vēlies dzēst šo treniņu?")) {
    store.deleteSession(id);
  }
};

/**
 * Group logs by exerciseName and combine repeated sets
 */
const groupLogsByExercise = (logs) => {
  const map = {};

  logs.forEach((log) => {
    const key = log.exerciseName;
    if (!map[key]) map[key] = [];
    map[key].push(log);
  });

  // Return array of { exerciseName, sets: [...] }
  return Object.keys(map).map((name) => ({
    exerciseName: name,
    sets: map[name],
  }));
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-10">
    <h2 class="text-3xl font-bold mb-10 text-white">Treniņu vēsture</h2>

    <div class="space-y-6">
      <div
        v-for="session in store.sessions"
        :key="session.id"
        class="bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <!-- Session Header -->
        <div
          class="flex justify-between items-start mb-6 pb-4 border-b border-slate-800"
        >
          <div>
            <h3 class="text-xl font-semibold text-cyan-400 mb-1">
              {{ session.date }}
            </h3>
            <p class="text-slate-400">
              {{ session.name || "Bez nosaukuma" }}
            </p>
          </div>
          <button
            @click="confirmDelete(session.id)"
            class="text-red-400 hover:text-red-300 px-3 py-1 rounded-lg transition text-sm"
          >
            Dzēst
          </button>
        </div>

        <!-- Exercise Logs -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="log in groupLogsByExercise(session.logs)"
            :key="log.exerciseName"
            class="bg-slate-800 border border-slate-700 rounded-lg p-4"
          >
            <h4 class="text-lg font-semibold text-white mb-3">
              {{ log.exerciseName }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="(set, i) in log.sets"
                :key="i"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-slate-400">Set {{ i + 1 }}</span>
                <span class="text-white font-medium">
                  {{ set.weightKg }} kg × {{ set.reps }}
                  <span
                    v-if="
                      log.sets.filter(
                        (s) =>
                          s.weightKg === set.weightKg && s.reps === set.reps
                      ).length > 1
                    "
                  >
                    x
                    {{
                      log.sets.filter(
                        (s) =>
                          s.weightKg === set.weightKg && s.reps === set.reps
                      ).length
                    }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!session.logs || session.logs.length === 0"
          class="text-center py-8 text-slate-500"
        >
          Nav vingrinājumu
        </div>
      </div>
    </div>

    <div
      v-if="store.sessions.length === 0"
      class="text-center py-20 text-slate-500"
    >
      Nav ierakstu
    </div>
  </div>
</template>
