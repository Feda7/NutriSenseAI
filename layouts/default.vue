<template>
    <Navbar v-if="!hide" />
    <div>
        <slot />
    </div>
    <Footer v-if="!hide" />
</template>
<script setup>
const route = useRoute();

// hide navbar only on homepage
const hide = computed(() => 
  route.path === "/" || route.path === "/SectionWelcome" || route.path === "/register" || route.path === "/register2" || route.path === "/Account"
);
</script>
