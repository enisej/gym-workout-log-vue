<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGymStore } from "../stores/useGymStore";

const store = useGymStore();
const router = useRouter();

const isLogin = ref(true);
const username = ref("");
const loading = ref(false);
const error = ref("");

const handleSubmit = async () => {
  if (!username.value.trim()) {
    error.value = "Lūdzu ievadi vārdu";
    return;
  }

  error.value = "";
  loading.value = true;

  try {
    if (isLogin.value) {
      // Login
      const user = await store.loginUser(username.value);
      if (user) {
        router.push("/");
      } else {
        error.value = "Lietotājs nav atrasts";
      }
    } else {
      // Register
      const success = await store.registerUser(username.value);
      if (success) {
        router.push("/");
      } else {
        error.value = "Lietotājs ar šo vārdu jau eksistē";
      }
    }
  } catch (err) {
    error.value = "Kļūda! Mēģini vēlreiz.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  error.value = "";
};
</script>

<template>
  <div
    class="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-10"
  >
    <div class="max-w-md w-full">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">
            {{ isLogin ? "Pieslēgties" : "Reģistrēties" }}
          </h2>
          <p class="text-slate-400">
            {{ isLogin ? "Ievadi savu vārdu" : "Izveido jaunu kontu" }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Vārds</label>
            <input
              v-model="username"
              type="text"
              placeholder="Tavs vārds"
              required
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div v-if="error" class="text-red-400 text-sm text-center">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {{
              loading ? "Ielādē..." : isLogin ? "Pieslēgties" : "Reģistrēties"
            }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            @click="toggleMode"
            class="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            {{
              isLogin
                ? "Nav konta? Reģistrējies šeit"
                : "Jau ir konts? Piesakies šeit"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
