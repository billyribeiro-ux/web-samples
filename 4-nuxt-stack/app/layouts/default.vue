<template>
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
    <LayoutAppHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>
