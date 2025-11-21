<script setup>
import { ref, onMounted } from "vue";
import { useGymStore } from "../stores/useGymStore";
import ExerciseCard from "../components/ExerciseCard.vue";

const store = useGymStore();
const newName = ref("");
const selectedParts = ref([]);

onMounted(() => store.loadAll());

const addExercise = () => {
  if (newName.value.trim()) {
    store.addExercise(newName.value, selectedParts.value);
    newName.value = "";
    selectedParts.value = [];
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <h2 class="text-3xl font-bold mb-10 text-white">Vingrinājumi</h2>

    <!-- Add Form -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-10">
      <h3 class="text-xl font-semibold mb-6 text-white">Pievienot jaunu</h3>
      <form @submit.prevent="addExercise" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Nosaukums</label>
            <input
              v-model="newName"
              placeholder="piemēram, Bench Press"
              required
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-2"
              >Ķermeņa daļas</label
            >
            <select
              v-model="selectedParts"
              multiple
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 min-h-[120px]"
            >
              <option
                v-for="bp in store.bodyParts"
                :key="bp.id"
                :value="bp.id"
                class="py-2"
              >
                {{ bp.name }}
              </option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition"
        >
          Pievienot
        </button>
      </form>
    </div>

    <!-- List -->
    <div>
      <h3 class="text-xl font-semibold mb-6 text-white">
        Visi vingrinājumi ({{ store.exercises.length }})
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ExerciseCard
          v-for="ex in store.exercises"
          :key="ex.id"
          :exercise="ex"
          @delete="store.deleteExercise"
        />
      </div>
      <div
        v-if="store.exercises.length === 0"
        class="text-center py-16 text-slate-500"
      >
        Nav pievienotu vingrinājumu
      </div>
    </div>
  </div>
</template>
