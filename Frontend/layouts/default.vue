<template>
    <Navbar v-if="!hide" />
    <div>
        <slot />
    </div>
    <Footer v-if="!hide" />
</template>
<script setup>
import { computed } from 'vue' // تأكدي من وجود هذا السطر
import { useRoute } from 'vue-router'
const route = useRoute();

// hide navbar only on homepage
const hide = computed(() => 
  route.path === "/" || route.path === "/SectionWelcome" || route.path === "/register" || route.path === "/verify-account"  || route.path === "/forgot-password"  || route.path === "/reset-password" || route.path === "/register2" || route.path === "/Account" || route.path === "/Admin"
);
</script>
