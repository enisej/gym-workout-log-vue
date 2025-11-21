import { defineStore } from "pinia";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5193/api",
});

export const useGymStore = defineStore("gym", {
  state: () => ({
    exercises: [],
    bodyParts: [],
    sessions: [],
    currentSession: null,
    loading: false,
  }),

  actions: {
    async loadAll() {
      this.loading = true;
      try {
        const [ex, bp, sess] = await Promise.all([
          api.get("/exercises"),
          api.get("/bodyparts"),
          api.get("/sessions"),
        ]);
        this.exercises = ex.data;
        this.bodyParts = bp.data;
        this.sessions = sess.data;
      } catch (err) {
        console.error("API kļūda:", err);
      } finally {
        this.loading = false;
      }
    },

    async addExercise(name, bodyPartIds = []) {
      try {
        await api.post("/exercises", { name, bodyPartIds });
        await this.loadAll();
      } catch (err) {
        console.error("Kļūda pievienojot vingrinājumu:", err);
      }
    },

    async deleteExercise(id) {
      try {
        await api.delete(`/exercises/${id}`);
        this.exercises = this.exercises.filter((e) => e.id !== id);
      } catch (err) {
        console.error("Kļūda dzēšot vingrinājumu:", err);
      }
    },

    async createSession(date, name = null) {
      try {
        const res = await api.post("/sessions", { date, name });
        this.currentSession = res.data;
        await this.loadAll();
        return res.data.id;
      } catch (err) {
        console.error("Kļūda izveidojot sesiju:", err);
        throw err;
      }
    },

    async addLog(sessionId, exerciseId, sets) {
      try {
        // API expects individual logs per set
        for (let i = 0; i < sets.length; i++) {
          const set = sets[i];
          await api.post(`/sessions/${sessionId}/logs`, {
            exerciseId: exerciseId,
            setNumber: i + 1,
            weightKg: set.weight,
            reps: set.reps,
            notes: null,
          });
        }
        await this.loadAll();
      } catch (err) {
        console.error("Kļūda pievienojot log:", err);
        throw err;
      }
    },

    async deleteSession(id) {
      try {
        await api.delete(`/sessions/${id}`);
        await this.loadAll();
      } catch (err) {
        console.error("Kļūda dzēšot sesiju:", err);
      }
    },
  },
});
