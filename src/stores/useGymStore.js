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
    currentUser: null,
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
        const res = await api.post("/exercises", { name, bodyPartIds });
        const { data } = await api.get(`/exercises/${res.data.id}`);
        this.exercises.push(data);
      } catch (err) {
        console.error("Kļūda pievienojot vingrinājumu:", err);
      }
    },

    async updateExercise(id, name, bodyPartIds = []) {
      try {
        await api.put(`/exercises/${id}`, { name, bodyPartIds });
        const { data } = await api.get(`/exercises/${id}`);
        const index = this.exercises.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.exercises[index] = data;
        }
      } catch (err) {
        console.error("Kļūda atjaunojot vingrinājumu:", err);
        throw err;
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
        const { data } = await api.get(`/sessions/${res.data.id}`);
        this.sessions.unshift(data);
        return res.data.id;
      } catch (err) {
        console.error("Kļūda izveidojot sesiju:", err);
        throw err;
      }
    },

    async addLog(sessionId, exerciseId, sets) {
      try {
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
        const { data } = await api.get(`/sessions/${sessionId}`);
        const index = this.sessions.findIndex((s) => s.id === sessionId);
        if (index !== -1) {
          this.sessions[index] = data;
        }
      } catch (err) {
        console.error("Kļūda pievienojot log:", err);
        throw err;
      }
    },

    async deleteSession(id) {
      try {
        await api.delete(`/sessions/${id}`);
        this.sessions = this.sessions.filter((s) => s.id !== id);
      } catch (err) {
        console.error("Kļūda dzēšot sesiju:", err);
      }
    },

    async updateSession(id, date, name = null, notes = null) {
      try {
        const payload = { date };
        if (name !== undefined) payload.name = name;
        if (notes !== undefined) payload.notes = notes;

        await api.put(`/sessions/${id}`, payload);
        const { data } = await api.get(`/sessions/${id}`);
        const index = this.sessions.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.sessions[index] = data;
        }
        this.currentSession = data;
        return data;
      } catch (err) {
        console.error("Kļūda atjaunojot sesiju:", err);
        throw err;
      }
    },

    async clearSessionLogs(sessionId) {
      try {
        await api.delete(`/sessions/${sessionId}/logs`);
        return true;
      } catch (err) {
        console.error("Failed to clear old logs:", err);
        return false;
      }
    },

    async replaceSessionLogs(sessionId, logGroups) {
      const existingExerciseIds = new Set(
        this.exercises.map((e) => Number(e.id))
      );

      const requestedIds = logGroups.map((g) => Number(g.exerciseId));

      const missingIds = requestedIds.filter(
        (id) => !existingExerciseIds.has(id)
      );

      if (missingIds.length > 0) {
        throw new Error(
          `Exercises with IDs ${missingIds.join(
            ", "
          )} no longer exist in database`
        );
      }

      const cleared = await this.clearSessionLogs(sessionId);
      if (!cleared) {
        throw new Error("Could not clear previous logs");
      }

      for (const group of logGroups) {
        for (let i = 0; i < group.sets.length; i++) {
          const set = group.sets[i];

          await api.post(`/sessions/${sessionId}/logs`, {
            exerciseId: group.exerciseId,
            setNumber: i + 1,
            weightKg: set.weight,
            reps: set.reps,
            notes: set.notes || null,
          });
        }
      }

      const { data } = await api.get(`/sessions/${sessionId}`);
      const index = this.sessions.findIndex((s) => s.id === sessionId);
      if (index !== -1) {
        this.sessions[index] = data;
      }
      return true;
    },

    async updateSessionMetadata(id, { date, name = null, notes = null }) {
      try {
        const payload = { date };
        if (name !== undefined) payload.name = name;
        if (notes !== undefined) payload.notes = notes;

        await api.put(`/sessions/${id}`, payload);
        const { data } = await api.get(`/sessions/${id}`);
        const index = this.sessions.findIndex((s) => s.id === id);
        if (index !== -1) {
          this.sessions[index] = data;
        }
        return true;
      } catch (err) {
        console.error("Failed to update session metadata:", err);
        return false;
      }
    },

    async fetchSessionById(id) {
      try {
        const { data } = await api.get(`/sessions/${id}`);

        if (data && data.logs) {
          data.logs = data.logs.map((log) => ({
            id: Number(log.id),
            exerciseId: Number(
              log.exerciseId || log.ExerciseId || log.exerciseid
            ),
            exerciseName: log.exerciseName || log.ExerciseName,
            weightKg: Number(log.weightKg || log.WeightKg),
            reps: Number(log.reps || log.Reps),
            notes: log.notes || log.Notes,
            setNumber: Number(log.setNumber || log.SetNumber),
          }));
        }

        return data;
      } catch (err) {
        console.error("Neizdevās ielādēt sesiju:", err);
        return null;
      }
    },

    async registerUser(name) {
      try {
        const res = await api.post("/users", { name });
        this.currentUser = res.data;
        localStorage.setItem("currentUser", JSON.stringify(res.data));
        return true;
      } catch (err) {
        console.error("Kļūda reģistrējot lietotāju:", err);
        return false;
      }
    },

    async loginUser(name) {
      try {
        const res = await api.get(`/users/name/${encodeURIComponent(name)}`);
        this.currentUser = res.data;
        localStorage.setItem("currentUser", JSON.stringify(res.data));
        return res.data;
      } catch (err) {
        console.error("Kļūda pieslēdzoties:", err);
        return null;
      }
    },

    async updateUser(id, name) {
      try {
        await api.put(`/users/${id}`, { name });
        this.currentUser.name = name;
        localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
        return true;
      } catch (err) {
        console.error("Kļūda atjaunojot lietotāju:", err);
        return false;
      }
    },

    async deleteUser(id) {
      try {
        await api.delete(`/users/${id}`);
        this.currentUser = null;
        localStorage.removeItem("currentUser");
        return true;
      } catch (err) {
        console.error("Kļūda dzēšot lietotāju:", err);
        throw err;
      }
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem("currentUser");
    },

    loadUserFromStorage() {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
        } catch (err) {
          console.error("Error loading user from storage:", err);
          localStorage.removeItem("currentUser");
        }
      }
    },
  },
});
