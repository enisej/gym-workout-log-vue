<template>
  <div
    class="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500 transition"
  >
    <h3 class="text-lg font-semibold text-cyan-400 mb-3">
      {{ exercise.name }}
    </h3>
    <div class="flex flex-wrap gap-2 mb-4">
      <span
        v-for="part in exercise.bodyPartNames"
        :key="part"
        class="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-medium"
      >
        {{ part }}
      </span>
      <span
        v-if="!exercise.bodyPartNames || exercise.bodyPartNames.length === 0"
        class="px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-xs"
      >
        Bez kategorijas
      </span>
    </div>
    <button
      @click="$emit('delete', exercise.id)"
      class="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium py-2 rounded-lg transition"
    >
      Dzēst
    </button>
  </div>
</template>

<script setup>
defineProps(["exercise"]);
defineEmits(["delete"]);
</script>
