<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGymStore } from "../stores/useGymStore";

const store = useGymStore();
const route = useRoute();
const router = useRouter();

const sessionId = ref(Number(route.params.id));
const sessionName = ref("");
const selectedDate = ref("");
const notes = ref("");
const logs = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await store.loadAll();

  const session = await store.fetchSessionById(sessionId.value);
  if (!session) {
    alert("Sesija nav atrasta!");
    router.push("/history");
    return;
  }

  selectedDate.value = session.date;
  sessionName.value = session.name || "";
  notes.value = session.notes || "";

  const grouped = {};
  for (const log of session.logs || []) {
    const exId = Number(log.exerciseId);
    if (!grouped[exId]) {
      grouped[exId] = {
        exerciseId: exId,
        exerciseName: log.exerciseName,
        sets: [],
      };
    }
    grouped[exId].sets.push({
      weight: Number(log.weightKg),
      reps: Number(log.reps),
      notes: log.notes,
    });
  }

  logs.value = Object.values(grouped);
  loading.value = false;
});

const addSet = (exerciseId) => {
  const log = logs.value.find((l) => l.exerciseId === exerciseId);
  if (log) {
    log.sets.push({ weight: 0, reps: 0, notes: null });
  } else {
    const ex = store.exercises.find((e) => e.id === exerciseId);
    if (ex) {
      logs.value.push({
        exerciseId,
        exerciseName: ex.name,
        sets: [{ weight: 0, reps: 0, notes: null }],
      });
    }
  }
};

const removeLog = (exerciseId) => {
  logs.value = logs.value.filter((l) => l.exerciseId !== exerciseId);
};

const saveChanges = async () => {
  if (!confirm("Saglabāt izmaiņas treniņā?")) return;

  try {
    loading.value = true;

    await store.updateSession(
      sessionId.value,
      selectedDate.value,
      sessionName.value || null,
      notes.value || null
    );

    await store.replaceSessionLogs(sessionId.value, logs.value);

    alert("Izmaiņas saglabātas!");
    router.push("/history");
  } catch (err) {
    alert("Kļūda saglabājot izmaiņas!");
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <h2 class="text-3xl font-bold mb-10 text-white">Labot treniņu</h2>

    <div v-if="loading" class="text-center py-20 text-cyan-400">Ielādē...</div>

    <template v-else>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Datums</label>
            <input
              v-model="selectedDate"
              type="date"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-2"
              >Nosaukums (nav obligāts)</label
            >
            <input
              v-model="sessionName"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div class="space-y-6 mb-8">
        <div
          v-for="log in logs"
          :key="log.exerciseId"
          class="bg-slate-900 border border-slate-800 rounded-xl p-6"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-cyan-400">
              {{ log.exerciseName }}
            </h3>
            <button
              @click="removeLog(log.exerciseId)"
              class="text-red-400 hover:text-red-300 px-3 py-1 rounded-lg transition text-sm"
            >
              Noņemt vingrinājumu
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(set, i) in log.sets"
              :key="i"
              class="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center bg-slate-800 p-3 rounded-lg"
            >
              <span class="text-slate-400 font-medium">{{ i + 1 }}</span>
              <input
                v-model.number="set.weight"
                type="number"
                step="0.5"
                placeholder="kg"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              />
              <input
                v-model.number="set.reps"
                type="number"
                placeholder="reps"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
              />
              <button
                @click="log.sets.splice(i, 1)"
                class="text-red-400 hover:text-red-300 w-8 h-8 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          <button
            @click="addSet(log.exerciseId)"
            class="mt-3 text-cyan-400 hover:text-cyan-300 px-3 py-2 rounded-lg transition text-sm font-medium"
          >
            + Pievienot setu
          </button>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4 text-white">
          Pievienot citu vingrinājumu
        </h3>
        <div class="flex gap-3 flex-wrap">
          <button
            v-for="ex in store.exercises"
            :key="ex.id"
            @click="addSet(ex.id)"
            :disabled="logs.some((l) => l.exerciseId === ex.id)"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition text-sm',
              logs.some((l) => l.exerciseId === ex.id)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-cyan-500',
            ]"
          >
            {{ ex.name }}
          </button>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          @click="saveChanges"
          :disabled="loading || !logs.length"
          class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-xl transition disabled:opacity-50"
        >
          Saglabāt izmaiņas
        </button>

        <router-link
          to="/history"
          class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition text-center"
        >
          Atcelt
        </router-link>
      </div>
    </template>
  </div>
</template>
