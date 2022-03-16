<template>
	<page-base :titles="['商品管理', '添加商品']">
		<el-alert
			title="添加商品信息"
			type="info"
			center
			show-icon
			:closable="false"
		></el-alert>

		<el-steps
			align-center
			:space="200"
			:active="+activeIndex"
			style="margin: 15px 0"
			finish-status="success"
		>
			<el-step v-for="item of titles" :title="item"></el-step>
			<el-step title="完成"></el-step>
		</el-steps>

		<el-tabs v-model="activeIndex" tab-position="left">
			<el-tab-pane
				v-for="(item, index) of titles"
				:label="item"
				:name="`${index}`"
			>
				<component :is="components[activeIndex]"></component>
			</el-tab-pane>
		</el-tabs>
	</page-base>
</template>

<script>
import { verify } from 'utils'

import PageBase from 'components/page/PageBase'

import GoodsBaseInfo from './GoodsBaseInfo'
import GoodsParams from './GoodsParams'
import GoodsCategories from './GoodsCategories'
import GoodsImage from './GoodsImage'
import GoodsDetail from './GoodsDetail'

export default {
	components: {
		PageBase,
		GoodsBaseInfo,
		GoodsParams,
		GoodsCategories,
		GoodsImage,
		GoodsDetail
	},

	data: () => ({
		activeIndex: 0,

		titles: ['基本信息', '商品参数', '商品属性', '商品图片', '商品内容'],

		components: [
			'GoodsBaseInfo',
			'GoodsParams',
			'GoodsCategories',
			'GoodsImage',
			'GoodsDetail'
		]
	}),

	created() {},

	methods: {},

	computed: {}
}
</script>
