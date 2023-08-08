<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="relative bg-gray-100 bg-gray-800">
    <div class="absolute inset-0">
      <img class="w-full h-full object-cover" src="/images/castle.jpg" alt="" />
      <div
        class="absolute inset-0 bg-gray-400 dark:bg-gray-700 mix-blend-multiply"
        aria-hidden="true"
      ></div>
    </div>
    <div
      class="relative max-w-7xl mx-auto py-20 px-12 sm:py-24 sm:px-6 lg:px-8"
    >
      <h1
        class="text-4xl font-extrabold text-center tracking-tight text-white md:text-5xl lg:text-6xl"
      >
        Who are we?
      </h1>
      <p class="mt-6 text-xl text-gray-100 dark:text-gray-300 text-center">
        Fantasy Computerworks at your service. We like to build stuff.
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto pt-12">
    <!-- This example requires Tailwind CSS v2.0+ -->
    <div class="grid lg:grid-cols-8 gap-6 px-6">
      <div class="prose dark:prose-invert lg:col-span-5">
        <h2>Fantasy Computerworks, Ltd.</h2>

        <h3>Who is Fantasy Computerworks?</h3>
        <p>
          <a class="primary-link" href="https://fantasycomputer.works"
          >Fantasy Computerworks</a
          >
          is a team of two developers, Axel and Adam, who like keeping small
          slices of the internet running.
        </p>
        <p>
          In August of 2021, Axel and Adam decided to launch their own fork of
          Kobold Fight Club, both to take pressure off of its original
          maintainer and to fix the problems caused by using Google Sheets!
        </p>

        <h3>Do you have a privacy policy?</h3>
        <p>
          We sure do! You can read it
          <RouterLink class="primary-link" :to="{ name: 'privacy' }"
          >here</RouterLink
          >.
          <br />
          The short answer is: We don't use cookies or
          <del>disgusting parasites</del> third party analytics tools to track
          you. At all. The only analytics we do is using our own hosting access
          logs, to count page views and referrers (where people visit K+FC
          from).
        </p>

        <h3>Questions, comments, suggestions?</h3>
        <a
          href="https://github.com/fantasycalendar/kobold-plus-fight-club"
          class="primary-link"
          target="_blank"
        >Check the README on Github!</a
        >

        <h3>Via Discord</h3>
        <a
          href="https://app.fantasy-calendar.com/discord"
          target="_blank"
          class="primary-link"
        >Fantasy Computerworks Official Discord</a
        >
      </div>

      <div class="lg:col-span-3 prose dark:prose-invert">
        <div>
          <img src="/images/logo-full.png" class="img-responsive" alt="Logo" />
        </div>
        <strong>Other useful tools we've created:</strong>
        <ul style="padding-left: 24px">
          <li>
            <a
              class="primary-link font-semibold"
              href="https://app.fantasy-calendar.com/"
            >Fantasy Calendar</a
            >
            - The best tool for RPG calendar creation on the Internet. (We're
            not biased, we're just the creators. Promise!)
          </li>
          <li>
            <a
              class="primary-link font-semibold"
              href="http://dungeon-generator.fantasy-calendar.com/"
            >Dungeon Generator</a
            >
            - A random dungeon generator using beautiful tiles by
            <a href="https://www.patreon.com/csp_kris">Kristian Richards</a>
          </li>
          <li>
            <a
              class="primary-link font-semibold"
              href="https://github.com/fantasycalendar/FoundryVTT-Sequencer"
            >FoundryVTT Sequencer</a
            >
            - A FoundryVTT module that implements a basic pipeline for managing
            the flow of a set of functions, effects, sounds, and macros.
          </li>
        </ul>
      </div>
    </div>

    <div class="prose prose-sm dark:prose-invert text-center w-full max-w-none">
      <p class="pt-12">
        Fantasy Computerworks is not associated with Wizards of the Coast.

        <br />

        Inspired heavily by Kobold Fight Club originally by Ian Toltz (<a
          href="http://reddit.com/u/Asmor"
          class="primary-link"
          target="_blank"
        >/u/Asmor</a
        >) and Joe Barzilai (<a
          href="http://reddit.com/u/jabber3"
          class="primary-link"
          target="_blank"
        >/u/jabber3</a
        >)
      </p>
    </div>
  </div>
</template>

<style scoped>
.primary-link {
  @apply no-underline;
}
</style>
