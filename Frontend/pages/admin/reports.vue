<template>
  <div class="min-h-screen bg-gray-100 flex">
    
    
    <!-- Main Panel -->
    <main class="flex-1 p-8">
      <h2 class="text-2xl font-bold mb-2">Reports</h2>
      <p class="text-gray-600 mb-6">System recommendation logs & warnings</p>

      <div class="bg-white rounded-2xl shadow p-6">
        <table class="w-full text-sm">
          <thead class="border-b text-gray-500">
            <tr>
              <th class="pb-3 text-left">Date</th>
              <th class="pb-3 text-left">User</th>
              <th class="pb-3 text-left">Type</th>
              <th class="pb-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(report, index) in reports" :key="index" class="border-b last:border-none">
              <td class="py-3">{{ report.date }}</td>
              <td class="py-3">{{ report.user }}</td>
              <td class="py-3">
                <span
                  :class="report.type === 'warning' ? 'text-red-500 font-semibold' : 'text-blue-500 font-semibold'"
                >
                  {{ report.type }}
                </span>
              </td>
              <td class="py-3">{{ report.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})
import { ref } from 'vue'

const reports = ref([
  { date: '2025-11-01', user: 'fidaa@example.com', type: 'warning', message: 'High fat intake today' },
  { date: '2025-11-02', user: 'ahmed@example.com', type: 'info', message: 'Balanced meals logged' }
])
</script>