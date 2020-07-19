<template>
  <b-container fluid class="packr-container">
    <b-row>
      <b-col cols="12" class="p-3 packr-header">
        <div class="settings-header">
          <b-icon-arrow-left-circle
            @click="goBack()"
            class="back-arrow-icon"
            font-scale="1.5"
          />
            Settings
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div class="themes-title">
          Themes
        </div>
      </b-col>
    </b-row>
    <b-row v-for="(themes, key) in splitThemes" :key="key">
      <b-col v-for="(theme, _key) in themes" :key="_key">
        <ThemeSelector :theme="theme" @selected="refreshThemes"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ThemeSelector from "@/components/ThemeSelector"
import themesApi from "@/api/themes-api"

export default {
  name: "SettingsView",
  components: {
    ThemeSelector
  },
  data: () => {
    return  {
        themes: themesApi.getThemes()
    }
  },
  created: function() {
  },
  computed: {
    splitThemes() {
      let result = [];
      let curr_index = -1;
      this.themes.forEach((element, index) => {
        if(index % 3 == 0) {
          curr_index += 1;
          result[curr_index] = [];
        }
        result[curr_index].push(element);
      });
      return result;
    }
  },
  methods: {
    refreshThemes() {
      this.themes = themesApi.getThemes();
      this.$router.go(-1);
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style>
.settings-header {
  width: 65%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
  user-select: none;
  font-size: 13pt;
}

.themes-title {
  user-select: none;
  margin: 13px;
  margin-bottom: 15px;
  font-size: 13pt;
  text-decoration: underline;
  text-decoration-color: rgba(0,0,0,0.3);
  text-underline-offset: 20px;
  text-underline-position: under;
}
</style>