<script setup>
import { onMounted } from "vue";
import { useGymStore } from "../stores/useGymStore";

const store = useGymStore();

onMounted(() => store.loadAll());
</script>

<template>
  <div
    class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-10"
  >
    <div class="max-w-2xl w-full">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-8">
        <div class="text-center">
          <!-- Avatar -->
          <div class="relative inline-block mb-6">
            <div
              class="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-5xl font-bold text-white"
            >
              I
            </div>
          </div>

          <!-- User Info -->
          <h3 class="text-3xl font-bold text-cyan-400 mb-8">Ilja</h3>

          <!-- Progress Stats -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p class="text-slate-400 text-sm mb-1">Treniņi</p>
              <p class="text-3xl font-bold text-cyan-400">
                {{ store.sessions.length }}
              </p>
            </div>
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p class="text-slate-400 text-sm mb-1">Vingrinājumi</p>
              <p class="text-3xl font-bold text-cyan-400">
                {{ store.exercises.length }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
