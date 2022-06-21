<script setup>
import {marked} from "marked";
import {ref} from "vue";

import policyMarkdown from "../assets/privacy.md?raw";

const privacyPolicy = ref(marked(policyMarkdown));
</script>

<template>
  <div class="max-w-7xl m-auto py-12">
    <div class="text-3xl font-bold">Kobold+ Fight Club Privacy Policy</div>

    <div class="prose dark:prose-invert" v-html="privacyPolicy"></div>
  </div>
</template>
