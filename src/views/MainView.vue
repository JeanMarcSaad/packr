<template>
  <b-container fluid class="packr-container">
    <b-row>
      <b-col cols="12" class="p-3 packr-header">
        <button
          v-if="!packing"
          class="btn btn-dark packr-button"
          @click="packOpenTabs"
        >
          {{ buttonTitle }}
        </button>
        <b-spinner
          v-else
          variant="light"
          class="packr-spinner"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="p-0 align-items-center">
        <div v-if="emptyPacks" class="packr-no-pack-notice">{{ noPacksNotice }}</div>
        <ul v-else class="list-group packr-item-group">
          <PackrItem
            v-for="pack in packs"
            :pack="pack"
            :key="pack.id"
          />  
        </ul>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" class="p-3 packr-footer">
        <div id="settings-icon-div">
          <b-icon-gear
            id="settings-icon"
            class="settings-icon b-icon-animation-spin"
            @click="visitSettings"
          />
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import chromeStorageApi from '@/api/chrome-storage'
import chromeTabsApi from '@/api/chrome-tabs'
import {Pack, Tab} from '@/models/models'
import PackrItem from '@/components/PackrItem'

export default {
  name: "MainView",
  components: {
    PackrItem,
  },
  data: () => {
    return {
      buttonTitle: "Pack open tabs",
      noPacksNotice: "Start by packing some tabs",
      packing: false,
      packs: []
    }
  },
  created() {
    chromeStorageApi.setOnPacksChanged({callback: () => {
      chromeStorageApi.getPacks()
      .then((packs) => {
        this.packs = packs;
      });
    }});

    chromeStorageApi.getPacks()
    .then((packs) => {
      this.packs = packs;
    });
  },
  computed: {
    emptyPacks() {
      return this.packs.length == 0;
    }
  },
  methods: {
    packOpenTabs() {
      this.packing = true;
      setTimeout(() => {
        chromeTabsApi.getOpenTabs()
        .then((tabs) => {
          let _tabs = tabs.map((tab) => new Tab(tab.url, tab.favIconUrl, tab.title));
          let pack = new Pack("", _tabs);
          chromeStorageApi.addPack({pack: pack})
          .then(() => { this.packing = false; });
        });
      }, 500);
    },
    visitSettings() {
      this.$router.push(`/settings`);
    }
  }
}
</script>