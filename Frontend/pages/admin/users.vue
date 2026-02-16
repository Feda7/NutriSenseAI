<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Users</h2>

    <table class="w-full bg-white shadow rounded-xl">
      <thead>
        <tr class="text-left text-sm text-gray-500">
          <th>Name</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u.email" class="border-t">
          <td>{{ u.firstName }} {{ u.lastName }}</td>
          <td>{{ u.email }}</td>
          <td>
            <button @click="deleteUser(u.email)" class="text-red-500 text-xs">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const users = ref([
  { email: 'test@test.com', firstName: 'Test', lastName: 'User' }
])

function deleteUser(email){
  users.value = users.value.filter(u => u.email !== email)
}
</script>
