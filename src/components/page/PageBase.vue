<template>
	<div class="page-base">
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/page' }">首页</el-breadcrumb-item>

			<el-breadcrumb-item v-for="item of titles">{{ item }}</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card class="page-base-card">
			<slot></slot>
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'PageBase',

	props: {
		titles: {
			type: Array,
			default: () => []
		}
	}
}
</script>
