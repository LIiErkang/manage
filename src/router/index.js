import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		redirect: '/login'
	},

	{
		path: '/login',
		name: 'Login',
		component: () => import('views/login/Login')
	},

	{
		path: '/page',
		component: () => import('views/page/Page'),

		children: [
			{ path: '/page', redirect: '/page/users' },

			{
				path: '/page/users',
				name: 'Users',
				component: () => import('views/page/users/Users')
			},

			{
				path: '/page/rights',
				name: 'Rights',
				component: () => import('views/page/rights/Rights')
			},

			{
				path: '/page/roles',
				name: 'Roles',
				component: () => import('views/page/roles/Roles')
			},

			{
				path: '/page/goods',
				name: 'Goods',
				component: () => import('views/page/goods/Goods')
			},

			{
				path: '/page/goods/append',
				name: 'Append',
				component: () => import('views/page/goods/append/AppendGoods')
			},

			{
				path: '/page/params',
				name: 'Params',
				component: () => import('views/page/params/Params')
			},

			{
				path: '/page/categories',
				name: 'Categories',
				component: () => import('views/page/categories/Categories')
			}
		]
	}
]

const router = new VueRouter({
	mode: 'history',
	routes
})

router.afterEach(to => (document.title = to.name))

router.beforeEach((to, from, next) => {
	if (to.path === '/login') return next()

	const token = window.sessionStorage.getItem('token')

	if (!token) {
		Vue.prototype.$msg('请登录 ! ! !')
		next('/login')
	}

	next()
})

const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

export default router
