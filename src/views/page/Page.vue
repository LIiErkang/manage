<template>
	<el-container>
		<el-header>
			<page-header class="header" @collapse="isCollapse = !isCollapse" />
		</el-header>

		<el-container>
			<el-aside width="auto">
				<page-menu :pageMenuData="pageMenuData" :isCollapse="isCollapse" />
			</el-aside>

			<el-main>
				<transition name="father">
					<router-view exclude="Roles" />
				</transition>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
import { verify } from 'utils'

import PageHeader from 'components/page/PageHeader'
import PageMenu from 'components/page/PageMenu'

export default {
	name: 'Page',

	components: { PageHeader, PageMenu },

	data: () => ({ pageMenuData: [], isCollapse: false }),

	created() {
		this.getPageMenuData()
	},

	methods: {
		async getPageMenuData() {
			const { data: res } = await this.$http.get('menus')

			if (!verify(res, this)) return

			this.pageMenuData = res.data
		}
	}
}
</script>
