<template>
  <div class="bg-slate-950 text-white">
    <!-- Navigation -->
    <nav
      class="bg-slate-900 border-b border-slate-800 px-6 py-4 fixed top-0 w-full z-50"
    >
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold text-cyan-400">GYM LOG</h1>
        <div class="flex gap-6 text-sm font-medium">
          <router-link
            to="/"
            class="hover:text-cyan-400 transition px-3 py-2 rounded-lg"
          >
            Sākums
          </router-link>
          <router-link
            to="/exercises"
            class="hover:text-cyan-400 transition px-3 py-2 rounded-lg"
          >
            Vingrinājumi
          </router-link>
          <router-link
            to="/add"
            class="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg transition"
          >
            + Jauns
          </router-link>
          <router-link
            to="/history"
            class="hover:text-cyan-400 transition px-3 py-2 rounded-lg"
          >
            Vēsture
          </router-link>
          <router-link
            to="/stats"
            class="hover:text-cyan-400 transition px-3 py-2 rounded-lg"
          >
            Statistika
          </router-link>
          <router-link
            to="/profile"
            class="hover:text-cyan-400 transition px-3 py-2 rounded-lg"
          >
            Profils
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <div class="pt-20 pb-12 flex justify-center">
      <router-view />
    </div>
  </div>
</template>

<style></style>
