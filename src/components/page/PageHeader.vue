<template>
	<div>
		<div>
			<img src="@/assets/img/logo.png" />
			<span style="margin-left: 15px">后台管理</span>
		</div>

		<div class="page-header-button">
			<el-button size="small" type="info" @click="$emit('collapse')" plain>
				切换侧边栏
			</el-button>

			<el-button size="small" type="info" @click="pageExit()" plain>
				退出
			</el-button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'PageHeader',

	methods: {
		pageExit() {
			window.sessionStorage.clear('token')

			this.$router.back()
		}
	}
}
</script>
