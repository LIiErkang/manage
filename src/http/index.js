import axios from 'axios'
import Vue from 'vue'

axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'

axios.interceptors.request.use(config => {
	config.headers.Authorization = window.sessionStorage.getItem('token')

	return config
})

Vue.prototype.$http = axios
