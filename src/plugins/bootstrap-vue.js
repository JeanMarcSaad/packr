import Vue from 'vue'

import { BFormInput, BBadge, BSpinner, BContainer, BRow, BCol } from 'bootstrap-vue/dist/bootstrap-vue.esm';
import { BIconPencil, BIconBookmark, BIconBookmarkFill, BIconTrash, BIconGear, BIconArrowLeftCircle } from 'bootstrap-vue/dist/bootstrap-vue.esm';
import 'bootstrap/dist/css/bootstrap.min.css'

// Utility
Vue.component('b-form-input', BFormInput);
Vue.component('b-badge', BBadge);
Vue.component('b-spinner', BSpinner);
Vue.component('b-container', BContainer);
Vue.component('b-row', BRow);
Vue.component('b-col', BCol);

// Icons
Vue.component('b-icon-pencil', BIconPencil);
Vue.component('b-icon-bookmark', BIconBookmark);
Vue.component('b-icon-bookmark-fill', BIconBookmarkFill);
Vue.component('b-icon-trash', BIconTrash);
Vue.component('b-icon-gear', BIconGear);
Vue.component('b-icon-arrow-left-circle', BIconArrowLeftCircle);