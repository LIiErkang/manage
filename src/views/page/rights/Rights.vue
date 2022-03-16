<template>
	<page-base :titles="['权限列表', '权限管理']">
		<el-table :data="rightsDataList" stripe border>
			<el-table-column type="index" label="#"></el-table-column>
			<el-table-column prop="authName" label="权限名称"></el-table-column>
			<el-table-column prop="path" label="路径"></el-table-column>

			<el-table-column prop="level" label="权限等级">
				<template slot-scope="scope">
					<el-tag v-if="+scope.row.level === 0">一级</el-tag>
					<el-tag v-else-if="+scope.row.level === 1" type="success">
						二级
					</el-tag>
					<el-tag v-else type="warning">三级</el-tag>
				</template>
			</el-table-column>
		</el-table>
	</page-base>
</template>

<script>
import { verify } from 'utils'

import PageBase from 'components/page/PageBase'

export default {
	components: { PageBase },
	data: () => ({
		rightsDataList: []
	}),
	created() {
		this.getRightsData()
	},
	methods: {
		async getRightsData() {
			const { data: res } = await this.$http.get(`rights/list`)

			if (!verify(res, this)) return

			this.rightsDataList = res.data
		}
	}
}
</script>
