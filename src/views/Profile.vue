<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGymStore } from "../stores/useGymStore";

const store = useGymStore();
const router = useRouter();

const isEditing = ref(false);
const newName = ref("");
const loading = ref(false);
const error = ref("");

onMounted(() => store.loadAll());

const currentUser = computed(() => store.currentUser);

const startEdit = () => {
  if (currentUser.value) {
    newName.value = currentUser.value.name;
    isEditing.value = true;
    error.value = "";
  }
};

const cancelEdit = () => {
  isEditing.value = false;
  newName.value = "";
  error.value = "";
};

const saveEdit = async () => {
  if (!newName.value.trim()) {
    error.value = "Vārds nevar būt tukšs";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const success = await store.updateUser(currentUser.value.id, newName.value);
    if (success) {
      cancelEdit();
    } else {
      error.value = "Lietotājs ar šo vārdu jau eksistē";
    }
  } catch (err) {
    error.value = "Kļūda atjaunojot profilu";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteAccount = async () => {
  if (!confirm("Vai tiešām vēlies dzēst savu kontu?")) {
    return;
  }

  loading.value = true;
  try {
    await store.deleteUser(currentUser.value.id);
    router.push("/auth");
  } catch (err) {
    alert("Kļūda dzēšot kontu!");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const logout = () => {
  store.logout();
  router.push("/auth");
};
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
              {{ currentUser?.name?.charAt(0).toUpperCase() || "?" }}
            </div>
          </div>

          <!-- User Info -->
          <h3 class="text-3xl font-bold text-cyan-400 mb-2">
            {{ currentUser?.name || "Lietotājs" }}
          </h3>
          <p class="text-slate-400 text-sm mb-8">Tavs profils</p>

          <!-- Progress Stats -->
          <div class="grid grid-cols-2 gap-6 mb-8">
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

          <!-- Actions -->
          <div class="space-y-3">
            <button
              @click="startEdit"
              class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition"
            >
              Labot profilu
            </button>
            <button
              @click="logout"
              class="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Iziet
            </button>
            <button
              @click="deleteAccount"
              :disabled="loading"
              class="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-3 rounded-lg transition border border-red-500/30 disabled:opacity-50"
            >
              Dzēst kontu
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="isEditing"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="cancelEdit"
    >
      <div
        class="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full"
      >
        <h3 class="text-2xl font-semibold mb-6 text-white">Labot profilu</h3>
        <form @submit.prevent="saveEdit" class="space-y-4">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Vārds</label>
            <input
              v-model="newName"
              type="text"
              required
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div v-if="error" class="text-red-400 text-sm">{{ error }}</div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {{ loading ? "Saglabā..." : "Saglabāt" }}
            </button>
            <button
              type="button"
              @click="cancelEdit"
              :disabled="loading"
              class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              Atcelt
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
