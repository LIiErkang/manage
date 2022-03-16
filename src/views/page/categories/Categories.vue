<template>
	<page-base :titles="['商品管理', '商品列表']">
		<el-row :gutter="20">
			<el-col :span="8">
				<el-input
					@keyup.enter.native="queryCategories()"
					@clear="getCategoriesListData()"
					v-model="query"
					placeholder="搜索 . . ."
					clearable
				>
					<el-button
						@click="queryCategories()"
						slot="append"
						icon="el-icon-search"
					></el-button>
				</el-input>
			</el-col>

			<el-col :span="6">
				<el-button type="primary" @click="showCategoriesDialog = true">
					添加分类
				</el-button>
			</el-col>
		</el-row>

		<tree-table
			style="margin: 15px 0"
			:columns="categoriesTableColumns"
			v-loading="categoriesTableLoad"
			:data="categoriesListData"
			:show-row-hover="false"
			:selection-type="false"
			:expand-type="false"
			:show-index="true"
			index-text="#"
			stripe
			border
		>
			<template slot="catDeleted" slot-scope="scope">
				<i
					class="el-icon-success"
					style="color: #409eff"
					v-if="!scope.row.cat_deleted"
				></i>

				<i class="el-icon-error" style="color: #F56C6C" v-else></i>
			</template>

			<template slot="level" slot-scope="scope">
				<el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
				<el-tag
					size="mini"
					v-else-if="scope.row.cat_level === 1"
					type="success"
				>
					二级
				</el-tag>
				<el-tag size="mini" v-else type="warning">三级</el-tag>
			</template>

			<template slot="operate" slot-scope="scope">
				<el-button
					@click="editCategories(scope.row)"
					size="small"
					type="primary"
					icon="el-icon-edit"
				>
					编辑
				</el-button>

				<el-button
					@click="deleteCategories(scope.row)"
					size="small"
					type="danger"
					icon="el-icon-delete"
				>
					删除
				</el-button>
			</template>
		</tree-table>

		<el-pagination
			:total="total"
			:page-sizes="[3, 5, 10, 15]"
			@size-change="handleSizeChange($event)"
			@current-change="handleCurrentChange($event)"
			:page-size="categoriesTableParams.pagesize"
			:current-page="categoriesTableParams.pagenum"
			layout="total, sizes, prev, pager, next, jumper"
		>
		</el-pagination>

		<el-dialog
			title="添加分类"
			@keyup.enter.native="setAddCategories()"
			:visible.sync="showCategoriesDialog"
			@close="handleDialogClose()"
		>
			<el-form
				:rules="categoriesDialogFormRules"
				:model="addCategories"
				ref="categoriesDialogForm"
				label-width="auto"
			>
				<el-form-item label="分类名称: " prop="cat_name">
					<el-input v-model="addCategories.cat_name"></el-input>
				</el-form-item>

				<el-form-item label="父级分类: ">
					<el-cascader
						@change="cascaderChange($event)"
						style="width: 100%"
						v-model="selectKeys"
						:props="cascaderProps"
						:options="parentCateList"
						clearable
					></el-cascader>
				</el-form-item>
			</el-form>

			<div slot="footer">
				<el-button @click="showCategoriesDialog = false">
					取消
				</el-button>

				<el-button
					:loading="categoriesLoad"
					type="primary"
					@click="setAddCategories()"
					>确认</el-button
				>
			</div>
		</el-dialog>

		<el-dialog
			title="编辑分类"
			@closed="handleEditFormClose()"
			@keyup.enter.native="editSubmit()"
			:visible.sync="editDialog"
		>
			<el-row class="flex-center">
				<el-col :span="4">
					分类名称:
				</el-col>

				<el-col :span="20">
					<el-input v-model="editCatName"></el-input>
				</el-col>
			</el-row>

			<div slot="footer">
				<el-button @click="editDialog = false">取消</el-button>
				<el-button
					@click="editSubmit()"
					:loading="editSubmitLoad"
					type="primary"
					>确认</el-button
				>
			</div>
		</el-dialog>
	</page-base>
</template>

<script>
import { verify } from 'utils'

import PageBase from 'components/page/PageBase'

export default {
	components: { PageBase },

	data: () => ({
		total: 0,

		id: '',
		query: '',
		editCatName: '',

		editDialog: false,
		editSubmitLoad: false,
		categoriesLoad: false,
		categoriesTableLoad: false,
		showCategoriesDialog: false,

		addCategories: { cat_pid: 0, cat_name: '', cat_level: 0 },
		categoriesTableParams: { type: 3, pagenum: 1, pagesize: 5 },
		cascaderProps: {
			expandTrigger: 'hover',
			label: 'cat_name',
			value: 'cat_id',
			checkStrictly: true
		},
		categoriesDialogFormRules: {
			cat_name: [{ required: true, message: '不能为空', trigger: 'change' }]
		},

		selectKeys: [],
		parentCateList: [],
		categoriesListData: [],
		categoriesTableColumns: [
			{ label: '分类名称', prop: 'cat_name' },
			{ label: '是否有效', type: 'template', template: 'catDeleted' },
			{ label: '排序', type: 'template', template: 'level' },
			{ label: '操作', type: 'template', template: 'operate' }
		]
	}),

	created() {
		this.getCategoriesListData()
		this.getParentCateList()
	},

	methods: {
		async getCategoriesListData() {
			this.categoriesTableLoad = true

			const { data: res } = await this.$http.get('categories', {
				params: this.categoriesTableParams
			})

			this.categoriesTableLoad = false

			if (!verify(res, this)) return

			this.total = res.data.total
			this.categoriesListData = res.data.result
		},

		async getParentCateList() {
			const { data: res } = await this.$http.get('categories', {
				params: { type: 2 }
			})

			if (!verify(res, this)) return

			this.parentCateList = res.data
		},

		handleCurrentChange(value) {
			this.categoriesTableParams.pagenum = value
			this.getCategoriesListData()
		},

		handleSizeChange(value) {
			this.categoriesTableParams.pagesize = value
			this.getCategoriesListData()
		},

		cascaderChange(value) {
			this.addCategories.cat_level = value.length
			this.addCategories.cat_pid = value[value.length - 1]
		},

		setAddCategories() {
			this.$refs['categoriesDialogForm'].validate(async valid => {
				if (!valid) return

				this.categoriesLoad = true

				const { data: res } = await this.$http.post(
					'categories',
					this.addCategories
				)

				this.showCategoriesDialog = false
				this.categoriesLoad = false

				if (!verify(res, this)) return

				this.getParentCateList()
				this.getCategoriesListData()
			})
		},

		handleDialogClose() {
			this.$refs['categoriesDialogForm'].resetFields()

			this.selectKeys = []
		},

		async deleteCategories(row) {
			this.categoriesTableLoad = true

			const { data: res } = await this.$http.delete(`categories/${row.cat_id}`)

			this.categoriesTableLoad = false

			if (!verify(res, this)) return

			this.getCategoriesListData()
		},

		async editCategories(row) {
			this.editCatName = row.cat_name
			this.id = row.cat_id

			this.editDialog = true
		},

		async queryCategories() {
			if (!this.query) return this.getCategoriesListData()

			this.categoriesTableLoad = true

			const { data: res } = await this.$http.get(`categories/${this.query}`)

			this.categoriesTableLoad = false

			if (!verify(res, this)) return

			this.total = res.data.total
			this.categoriesListData = res.data.result
		},

		async editSubmit() {
			this.editSubmitLoad = true

			const { data: res } = await this.$http.put(`categories/${this.id}`, {
				cat_name: this.editCatName
			})

			this.editSubmitLoad = false
			this.editDialog = false

			if (!verify(res, this)) return

			this.getCategoriesListData()
		},

		handleEditFormClose() {
			this.editCatName = ''
		}
	}
}
</script>
