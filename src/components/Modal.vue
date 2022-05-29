<template>
  <div v-show="show" class="fixed z-10 inset-0 overflow-y-auto scrollbar" aria-labelledby="modal-title" role="dialog" v-cloak aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          v-show="show"
      >
        <div class="fixed inset-0 bg-gray-500 dark:bg-gray-900 dark:bg-opacity-75 bg-opacity-75 transition-opacity" aria-hidden="true"
             @click="$emit('update:show', false)"
        ></div>
      </transition>

      <!-- This element is to trick the browser into centering the modal contents. -->
      <span class="hidden sm:inline-block align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          v-show="show"
      >
        <div class="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 align-middle sm:max-w-xl md:max-w-2xl lg:max-w-4xl w-full">
          <div class="bg-white dark:bg-gray-800 px-4 py-5 sm:p-6">
            <div class="sm:flex flex-col sm:items-start w-full">
              <div class="w-full flex pb-3">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" v-text="title"></h3>
              </div>

              <slot></slot>

            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
            <slot name="footer"></slot>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",
  props: {
    title: String,
    show: {
      type: Boolean,
      default: false,
    }
  },
  emits: ['update:show']
}
</script>

<style scoped>

</style>