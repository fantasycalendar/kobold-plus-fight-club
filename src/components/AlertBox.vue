<template>
  <div class="rounded-md p-4" :class="outerColors">
    <div class="flex">
      <div class="flex-shrink-0">
        <!-- Heroicon name: solid/x-circle -->
        <i
          class="fa h-5 w-5 text-lg"
          :class="`${iconColors} ${iconClass}`"
        ></i>
      </div>
      <div class="ml-3">
        <h3
          class="text-sm font-medium"
          :class="headingColors"
        >
          {{ heading }}
        </h3>
        <div
          class="mt-2 text-sm"
          :class="bodyColors"
        >
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    heading: String,
    role: {
      type: String,
      default: "info",
    },
  },
  data() {
    return {
      iconClasses: {
        info: "fa-info-circle",
        warning: "fa-exclamation-triangle",
        danger: "fa-times-circle",
        success: "fa-check-circle",
      },
      colors: {
        info: "blue",
        warning: "orange",
        danger: "red",
        success: "emerald",
      },
      outerClassOptions: {
        info: "bg-blue-50 dark:bg-blue-900",
        warning: "bg-orange-50 dark:bg-orange-900",
        danger: "bg-red-50 dark:bg-red-900",
        success: "bg-emerald-50 dark:bg-emerald-900",
      },
      iconColorOptions: {
        info: "text-blue-400 dark:text-blue-300",
        warning: "text-orange-400 dark:text-orange-300",
        danger: "text-red-400 dark:text-red-300",
        success: "text-emerald-400 dark:text-emerald-300",
      },
      headingColorOptions: {
        info: "text-blue-800 dark:text-blue-300",
        warning: "text-orange-800 dark:text-orange-300",
        danger: "text-red-800 dark:text-red-300",
        success: "text-emerald-800 dark:text-emerald-300",
      },
      bodyColorOptions: {
        info: "text-blue-700 dark:text-blue-300",
        warning: "text-orange-700 dark:text-orange-300",
        danger: "text-red-700 dark:text-red-300",
        success: "text-emerald-700 dark:text-emerald-300",
      },
    };
  },
  computed: {
    bodyColors() {
      return this.bodyColorOptions[this.role];
    },
    headingColors() {
      return this.headingColorOptions[this.role];
    },
    iconColors() {
      return this.iconColorOptions[this.role];
    },
    outerColors() {
      return this.outerClassOptions[this.role];
    },
    iconClass() {
      return this.iconClasses[this.role];
    },
    color() {
      return this.colors[this.role];
    },
  },
};
</script>
