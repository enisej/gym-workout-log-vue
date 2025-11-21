<script setup>
import { ref, onMounted } from "vue";
import { useGymStore } from "../stores/useGymStore";

const store = useGymStore();
const sessionName = ref("");
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const logs = ref([]);

onMounted(() => store.loadAll());

const addSet = (exerciseId) => {
  const log = logs.value.find((l) => l.exerciseId === exerciseId);
  if (log) {
    log.sets.push({ weight: 0, reps: 0 });
  } else {
    logs.value.push({
      exerciseId,
      exerciseName: store.exercises.find((e) => e.id === exerciseId).name,
      sets: [{ weight: 0, reps: 0 }],
    });
  }
};

const removeLog = (exerciseId) => {
  logs.value = logs.value.filter((l) => l.exerciseId !== exerciseId);
};

const saveWorkout = async () => {
  try {
    const sessionId = await store.createSession(
      selectedDate.value,
      sessionName.value || null
    );
    for (const log of logs.value) {
      await store.addLog(sessionId, log.exerciseId, log.sets);
    }
    logs.value = [];
    sessionName.value = "";
    alert("Treniņš saglabāts!");
  } catch (error) {
    alert("Kļūda saglabājot treniņu!");
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <h2 class="text-3xl font-bold mb-10 text-white">Jauns treniņš</h2>

    <!-- Session Info -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm text-slate-400 mb-2">Datums</label>
          <input
            v-model="selectedDate"
            type="date"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-2"
            >Nosaukums (nav obligāts)</label
          >
          <input
            v-model="sessionName"
            placeholder="piemēram, Push Day"
            class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </div>

    <!-- Exercise Logs -->
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
            Noņemt
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(set, i) in log.sets"
            :key="i"
            class="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center bg-slate-800 p-3 rounded-lg"
          >
            <span class="text-slate-400 font-medium">{{ i + 1 }}</span>
            <div>
              <input
                v-model.number="set.weight"
                type="number"
                step="0.5"
                placeholder="Svars (kg)"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
            <div>
              <input
                v-model.number="set.reps"
                type="number"
                placeholder="Reizes"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
            <button
              @click="log.sets.splice(i, 1)"
              class="text-red-400 hover:text-red-300 w-8 h-8 rounded-lg transition text-xl"
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

    <!-- Exercise Selection -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <h3 class="text-lg font-semibold mb-4 text-white">
        Izvēlies vingrinājumu
      </h3>
      <div class="flex gap-3 flex-wrap">
        <button
          v-for="ex in store.exercises"
          :key="ex.id"
          @click="addSet(ex.id)"
          :disabled="logs.some((l) => l.exerciseId === ex.id)"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition',
            logs.some((l) => l.exerciseId === ex.id)
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-cyan-500',
          ]"
        >
          {{ ex.name }}
        </button>
      </div>
      <div
        v-if="store.exercises.length === 0"
        class="text-center py-8 text-slate-500"
      >
        Nav pievienotu vingrinājumu
      </div>
    </div>

    <!-- Save Button -->
    <button
      v-if="logs.length"
      @click="saveWorkout"
      class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-lg py-4 rounded-xl transition"
    >
      Saglabāt treniņu
    </button>
  </div>
</template>
