<template>
  <div class="theme-selector" :class="theme.class">
    <div
        v-if="selected"
        class="theme-ball"
        :class="[selected?'selected':'']"
        @click="selectTheme">
    </div>
    <div
        v-else
        class="theme-ball"
        @click="selectTheme">
    </div>
    <p class="theme-name">{{ theme.name }}</p>
  </div>
</template>

<script>
import themesApi from "@/api/themes-api"

export default {
    name: "ThemeSelector",
    props: {
        theme: Object,
    },
    computed: {
        selected() {
            return this.theme.selected == true;
        }
    },
    methods: {
        selectTheme() {
            themesApi.setCurrTheme({ theme: this.theme })
            .then(() => {
                this.$emit('selected');
            })
        }
    }
}
</script>

<style>
.theme-selector {
    user-select: none;
    width: 100px;
    height: 75px;
    margin-bottom: 50px;
    text-align: center;
    font-size: 11pt;
}

.theme-name {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}

.theme-ball {
    width: 45px;
    height: 45px;
    margin: auto;
    margin-bottom: 8px;
    border-radius: 50px;
    background: linear-gradient(180deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    cursor: pointer;
}

.theme-ball:hover {
    border: 1.5px solid var(--primary-color);
}

.selected {
    border: 1.5px solid var(--primary-color);
}
</style>