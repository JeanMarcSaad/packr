<template>
  <b-container fluid class="packr-container">
    <b-row>
      <b-col cols="12" class="p-3 packr-header">
        <div class="pack-header">
          <div class="back-button-wrapper" @click="goBack()">
            <b-icon-arrow-left-circle
              class="back-arrow-outline"
              font-scale="1.5"
            />
            <b-icon-arrow-left-circle-fill
              class="back-arrow-fill"
              font-scale="1.5"
            />
          </div>
          <span class="packr-item-text">
            {{ pack.name }}
          </span>
        </div>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="p-0 align-items-center">
        <ul class="list-group packr-item-group">
          <TabItem
            v-for="tab in pack.tabs"
            :tab="tab"
            :id="pack.id"
            :key="tab.url"
          />
        </ul>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="p-3 packr-footer">
        <button
          v-if="!packing"
          class="btn btn-dark open-tabs-button"
          @click="addOpenTabs"
        >
          Add Open Tabs
        </button>
        <b-spinner
          v-else
          variant="light"
          class="packr-spinner"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import chromeStorageApi from '@/api/chrome-storage'
import chromeWindowsApi from '@/api/chrome-windows'
import chromeTabsApi from '@/api/chrome-tabs'

import TabItem from '@/components/TabItem'
import {Tab} from '@/models/models'

export default {
  name: "PackView",
  components: {
    TabItem
  },
  data: () => {
    return {
      pack: {},
      packing: false
    }
  },
  created() {
    this.id = this.$route.params.id;
    chromeStorageApi.setOnPacksChanged({callback: () => {
      chromeStorageApi.getPack({ id: this.id })
      .then((pack) => {
        this.pack = pack;
      });
    }});

    chromeStorageApi.getPack({ id: this.id })
    .then((pack) => {
      this.pack = pack;
    });
  },
  computed: {
  },
  methods: {
    openPack() {
      chromeStorageApi.getPack({ id: this.id })
      .then((pack) => {
        chromeWindowsApi.openWindowWithTabs({tabs: pack.tabs.map((tab) => tab.url)});
      });
    },
    addOpenTabs() {
      this.packing = true;
      setTimeout(() => {
        chromeTabsApi.getOpenTabs()
        .then((tabs) => {
          let tabs_ = tabs.map((tab) => new Tab(tab.url, tab.favIconUrl, tab.title));
          chromeStorageApi.addTabs({id: this.pack.id, tabs: tabs_})
          .then(() => { this.packing = false; });
        });
      }, 400);
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.pack-header {
  width: 65%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-align: center;
  user-select: none;
  font-size: 12.6pt;
}

.open-tabs-button {
  background-color: var(--secondary-color) !important;
  color: var(--primary-color) !important;
}

.open-tabs-button:hover {
  border: 1px solid var(--primary-color) !important;
}
</style>