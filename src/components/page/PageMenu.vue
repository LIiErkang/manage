<template>
	<el-menu
		class="el-menu-vertical-demo menu"
		:default-active="activeName"
		:collapse="isCollapse"
		unique-opened
		router
	>
		<el-submenu v-for="items of pageMenuData" :index="'' + items.id">
			<template slot="title">
				<i :class="menuItemIcon[items.id]"></i>
				<span slot="title">{{ items.authName }}</span>
			</template>

			<el-menu-item
				v-for="item of items.children"
				:index="`/page/${item.path}`"
			>
				<i class="el-icon-menu"></i>
				<span>{{ item.authName }}</span>
			</el-menu-item>
		</el-submenu>
	</el-menu>
</template>

<script>
export default {
	name: 'PageMenu',

	props: {
		pageMenuData: {
			type: Array,
			default: () => []
		},

		isCollapse: {
			type: Boolean,
			default: () => false
		}
	},

	data: () => ({
		menuItemIcon: {
			125: 'el-icon-user-solid',
			103: 'el-icon-s-cooperation',
			101: 'el-icon-s-goods',
			102: 'el-icon-s-order',
			145: 'el-icon-s-marketing'
		}
	}),

	computed: {
		activeName() {
			return this.$route.path === '/page/goods/append'
				? '/page/goods'
				: this.$route.path
		}
	}
}
</script>
