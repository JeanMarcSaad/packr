<template>
  <div id="main-container">
    <transition name="fade">
      <router-view/>
    </transition>
  </div>
</template>

<script>
import themesApi from "@/api/themes-api"

export default {
  name: 'App',
  created: function() {
    themesApi.restoreCurrTheme();
    themesApi.setOnThemeChanged();
  }
}
</script>
