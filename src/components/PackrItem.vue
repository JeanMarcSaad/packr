<template>
  <li
    :id="pack.id"
    class="list-group-item d-flex justify-content-between align-items-center packr-item"
    :class="[openable?'selectable':'']"
    @click="openPack"
  >
    <div class="category-ribbon"/>
    <div class="packr-item-text-div">
      <b-form-input
        v-if="editing"
        v-model="pack.name"
        placeholder="Name"
        @blur="validatePackNameEdit"
        @keyup.enter="validatePackNameEdit"
        v-focus
      >
        {{ pack.name }}
      </b-form-input>
      <span 
        v-else
        class="packr-item-text"
      >
        {{ pack.name }}
      </span>
    </div>
    <b-icon-pencil
      v-if="!editing"
      class="edit-item-icon"
      @click.stop="editing = !editing"
    />
    <!-- <b-icon-bookmark
      v-if="!editing && !pack.bookmarked"
      class="bookmark-item-icon"
      @click="bookmarkPack"
    />
    <b-icon-bookmark-fill
      v-if="!editing && pack.bookmarked"
      class="bookmark-item-icon"
      @click="removeBookmark"
    /> -->
    <b-icon-trash
      v-if="!editing"
      class="delete-item-icon"
      @click.stop="removePack"
      title="Delete"
    />
    <b-badge
      variant="dark"
      pill
      class="packr-item-pill"
      @click.stop="routeToPack(pack.id)"
    >
      {{ pack.tabs.length }}
    </b-badge>
  </li>
</template>

<script>
import chromeStorageApi from '@/api/chrome-storage'
import chromeWindowsApi from '@/api/chrome-windows'
// import chromeBookmarkApi from '@/api/chrome-bookmarks'

export default {
  name: "PackrItem",
  props: {
    pack: Object
  },
  data: () => {
    return {
      editing: false
    }
  },
  computed: {
    openable() {
      return !this.editing;
    }
  },
  created() {
    this.editing = this.pack.name == "";
  },
  methods: {
    openPack() {
      if(this.openable) {
        if (confirm(`Do you want to open "${this.pack.name}" pack?`)) {
          let tabs = this.pack.tabs;
          chromeWindowsApi.openWindowWithTabs({tabs: tabs.map((tab) => tab.url)});
        }
      }
    },
    validatePackNameEdit() {
      setTimeout(() => {
        if(this.pack.name == "")
          this.pack.name = "Untitled Pack";
        this.editing = false;
        chromeStorageApi.updatePack({id: this.pack.id, pack: this.pack});
      }, 150);
    },
    bookmarkPack() {
      this.pack.bookmarked = true;
      chromeStorageApi.updatePack({id: this.pack.id, pack: this.pack})
      // chromeBookmarkApi
      // .addBookmark({id: this.pack.id})
      // .then(() => {
      //   this.pack.bookmarked = true;
      // })
    },
    removeBookmark() {
      this.pack.bookmarked = false;
      chromeStorageApi.updatePack({id: this.pack.id, pack: this.pack});
      // chromeStorageApi.update({id: this.pack.id, pack: this.pack})
    },
    removePack() {
      let id = this.pack.id;
      let removedPack = document.getElementById(id)

      removedPack.classList.add('deleted-item');

      removedPack.addEventListener('animationend', () => {
        chromeStorageApi.deletePack({id: id})
        .then(() => { removedPack.classList.remove('deleted-item'); });
      });
    },
    routeToPack(id) {
      this.$router.push(`/pack/${id}`);
    }
  },
  directives: {
      focus: {
        inserted (el) {
          el.focus();
          el.select();
      }
    }
  }
}
</script>

<style scoped>
.category-ribbon {
  position: absolute;

  left: 0;
  top: 0;

  height: 101%;
  width: 12px;

  background-color: var(--secondary-color);
  opacity: 0.12;
}
</style>