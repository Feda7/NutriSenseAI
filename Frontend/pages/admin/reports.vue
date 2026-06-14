<template>
  <div class="min-h-screen bg-gray-100 flex">
    <main class="flex-1 p-8">
      
      <header class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">System Reports</h2>
        <p class="text-sm text-gray-500">View and manage system alerts and user generated logs</p>
      </header>

      <div class="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b text-gray-400 text-xs uppercase bg-gray-50">
              <th class="p-3">Report ID</th>
              <th class="p-3">User</th>
              <th class="p-3">Message / Issue</th>
              <th class="p-3">Generated Date</th>
              <th class="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="text-sm text-gray-700">
            <tr v-for="report in reports" :key="report.ReportID" class="border-b last:border-none hover:bg-gray-50">
              <td class="p-3 font-semibold text-gray-500">#{{ report.ReportID }}</td>
              <td class="p-3 font-medium text-gray-800">
                {{ report.FirstName ? `${report.FirstName} ${report.LastName}` : 'System Alert' }}
              </td>
              <td class="p-3 text-gray-600 max-w-xs truncate">{{ report.Message }}</td>
              <td class="p-3 text-gray-500 text-xs">{{ formatDate(report.Date) }}</td>
              <td class="p-3 text-center">
                <button @click="removeReport(report.ReportID)" class="text-red-500 hover:text-red-700 text-xs font-medium">
                  Dismiss
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="reports.length === 0" class="text-center py-8">
          <p class="text-gray-400 text-sm">No system logs or reports found.</p>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin"
})

import { ref, onMounted } from "vue"

const reports = ref([])
const API = "http://localhost:5000/api/admin/reports"

// جلب التقارير
async function fetchReports() {
  try {
    const res = await fetch(API)
    if (res.ok) {
      reports.value = await res.json()
    }
  } catch (error) {
    console.error("Error fetching reports:", error)
  }
}

// حذف تقرير أو إغلاقه (Dismiss)
async function removeReport(id) {
  if (!confirm("Are you sure you want to dismiss this report?")) return

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE"
    })
    if (res.ok) {
      reports.value = reports.value.filter(report => report.ReportID !== id)
    }
  } catch (error) {
    console.error("Error deleting report:", error)
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  fetchReports()
})
</script>