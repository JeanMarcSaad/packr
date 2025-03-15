<template>
  <li
    :id="tab.url"
    class="list-group-item d-flex justify-content-between align-items-center packr-item selectable"
    @click="openTab(tab.url)"
  >
    <div class="tab-favicon">
      <b-spinner
        v-if="!showImg && !isLocalFile"
        variant="light"
        class="packr-spinner tab-favicon-spinner"
      />
      <div v-if="isLocalFile" class="default-favicon">
        <!-- Display a text placeholder for local files -->
        <span>📄</span>
      </div>
      <img
        v-else
        :src="tab.favicon"
        width="15px"
        height="15px"
        draggable="false"
        @load="onImgLoad"
        @error="onImgError"
      />
    </div>
    <div class="packr-item-text-div">
      <span 
        class="packr-item-text"
      >
        <span v-if="tab.title">
          {{ tab.title }}
        </span>
        <span v-else>
          <i>Loading ..</i>
        </span>
        <br>
        <span class="tab-url">
          {{ tab.url }}
        </span>
      </span>
    </div>
    <b-icon-trash
      class="delete-item-icon"
      @click.stop="removeTab"
    />
  </li>
</template>

<script>
import chromeStorageApi from '@/api/chrome-storage'
import chromeTabsApi from '@/api/chrome-tabs'

export default {
  name: "TabItem",
  props: {
    id: String,
    tab: Object
  },
  data: () => {
    return {
      hasImgLoaded: false,
      hasImgError: false
    }
  },
  computed: {
    isLocalFile() {
      return this.tab.favicon && (
        this.tab.favicon.startsWith('file://') || 
        this.hasImgError
      );
    },
    showImg() {
      return this.tab.favicon != "" && this.hasImgLoaded && !this.isLocalFile;
    }
  },
  methods: {
    openTab() {
      chromeTabsApi.openTab({url: this.tab.url});
    },
    removeTab() {
      let removedTab = document.getElementById(this.tab.url);

      removedTab.classList.add('deleted-item');

      removedTab.addEventListener('animationend', () => {
        chromeStorageApi.deleteTab({id: this.id, url: this.tab.url})
        .then(() => { removedTab.classList.remove('deleted-item'); });
      });
    },
    onImgLoad() {
      this.hasImgLoaded = true;
    },
    onImgError() {
      this.hasImgError = true;
    }
  }
}
</script>

<style scoped>
.tab-favicon {
  min-width: 10%;
  max-width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-favicon-spinner {
  width: 20px;
  height: 20px;
}

.default-favicon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  font-size: 15px;
}

.tab-url {
  font-size: 10pt;
}
</style>