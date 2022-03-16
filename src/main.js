import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import TreeTable from 'vue-table-with-tree-grid'

import 'element-ui/lib/theme-chalk/index.css'
import 'style'
import 'http'

Vue.prototype.$msg = (
	message,
	type = 'error',
	duration = 1500,
	showClose = true
) => ElementUI.Message({ type, message, duration, showClose })

Vue.component('tree-table', TreeTable)
Vue.use(ElementUI)

Vue.filter('dateFormat', value => {
	const date = new Date(value)

	return `${date.getFullYear()}-${date.getMonth() +
		1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
})

Vue.config.productionTip = false

new Vue({ router, render: h => h(App) }).$mount('#app')
