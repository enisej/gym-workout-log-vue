<script setup>
import { onMounted } from "vue";
import { useGymStore } from "../stores/useGymStore";
import ExerciseCard from "../components/ExerciseCard.vue";

const store = useGymStore();

onMounted(() => {
  store.loadAll();
});
</script>

<template>
  <div class="py-10">
    <h2 class="text-3xl font-bold mb-10 text-white">Dashboard</h2>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p class="text-slate-400 text-sm mb-2">Kopā treniņi</p>
        <p class="text-3xl font-bold text-cyan-400">
          {{ store.sessions.length }}
        </p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p class="text-slate-400 text-sm mb-2">Vingrinājumi</p>
        <p class="text-3xl font-bold text-cyan-400">
          {{ store.exercises.length }}
        </p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p class="text-slate-400 text-sm mb-2">Ķermeņa daļas</p>
        <p class="text-3xl font-bold text-cyan-400">
          {{ store.bodyParts.length }}
        </p>
      </div>
    </div>

    <!-- Exercises Grid -->
    <div class="mb-12">
      <h3 class="text-xl font-semibold mb-6 text-white">Vingrinājumi</h3>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <ExerciseCard
          v-for="ex in store.exercises"
          :key="ex.id"
          :exercise="ex"
          @delete="store.deleteExercise"
        />
      </div>
      <div
        v-if="store.exercises.length === 0"
        class="text-center py-12 text-slate-500"
      >
        Nav pievienotu vingrinājumu
      </div>
    </div>

    <!-- Recent Sessions -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 class="text-xl font-semibold mb-6 text-white">Pēdējie treniņi</h3>
      <div class="space-y-3">
        <div
          v-for="s in store.sessions.slice(0, 5)"
          :key="s.id"
          class="py-3 px-4 bg-slate-800 rounded-lg flex justify-between items-center"
        >
          <div>
            <span class="text-cyan-400 font-semibold">{{ s.date }}</span>
            <span class="ml-3 text-slate-300">{{
              s.name || "Bez nosaukuma"
            }}</span>
          </div>
          <span class="text-slate-400 text-sm">
            {{ s.logsCount || 0 }} vingr.
          </span>
        </div>
        <div
          v-if="store.sessions.length === 0"
          class="text-center py-8 text-slate-500"
        >
          Nav ierakstu
        </div>
      </div>
    </div>
  </div>
</template>
