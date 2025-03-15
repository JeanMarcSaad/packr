<template>
  <div class="theme-selector" :class="theme.class">
    <div
        class="theme-ball"
        :class="[selected?'selected':'']"
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
        theme: Object
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
    width: 100%;
    max-width: 120px;
    height: 85px;
    margin-bottom: 30px;
    text-align: center;
    font-size: 11pt;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.theme-name {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 2px 8px;
    margin-top: 0;
    width: 100%;
}

.theme-ball {
    width: 60px;
    height: 60px;
    margin-bottom: 8px;
    border-radius: 50%;
    aspect-ratio: 1 / 1;
    background: linear-gradient(180deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    cursor: pointer;
    flex-shrink: 0;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}

.theme-ball:hover {
    border: 1.5px solid var(--primary-color);
}

.selected {
    border: 1.5px solid var(--primary-color);
}
</style>