<template>
	<page-base :titles="['商品管理', '分类参数']">
		<el-alert
			show-icon
			type="warning"
			:closable="false"
			title="注意: 只允许为第三级分类设置相关参数"
		>
		</el-alert>

		<el-row style="margin: 15px 0">
			<el-col>
				选择商品分类:
				<el-cascader
					clearable
					ref="paramsCascader"
					:options="paramsDataLIst"
					v-model="paramsCheckedKeys"
					:props="paramsCascaderProps"
					@change="cascaderChange($event)"
				></el-cascader>
			</el-col>
		</el-row>

		<el-tabs v-model="sel" @tab-click="tabClick($event)">
			<el-tab-pane label="动态参数" name="many"> </el-tab-pane>
			<el-tab-pane label="静态参数" name="only"> </el-tab-pane>
		</el-tabs>

		<el-button style="margin: 0 0 15px 0" @click="addParams()" type="primary">
			添加参数
		</el-button>

		<el-table stripe border v-loading="paramsLoad" :data="paramsTableData">
			<el-table-column type="expand">
				<template slot-scope="scope">
					<el-row>
						<el-col>
							<el-tag
								closable
								v-show="sel === 'many'"
								@close="deleteTag(scope.row, index)"
								v-for="(item, index) of filterTagDataList(scope.row)"
							>
								{{ item }}
							</el-tag>

							<el-tag
								closable
								@close="deleteTag(scope.row, 0)"
								v-show="sel === 'only' && scope.row.attr_vals"
							>
								{{ scope.row.attr_vals }}
							</el-tag>

							<el-row v-show="sel === 'many'">
								<el-col :span="4">
									<el-input
										@keyup.enter.native="setAddTag(scope.row)"
										@blur="showAddTag = false"
										v-model="addTagInfo"
										ref="addTagInput"
										v-if="showAddTag"
										size="small"
										autofocus
									></el-input>

									<el-button
										@click="handleAddButtonClick()"
										style="margin-left: 10px"
										size="small"
										v-else
									>
										+ 添加分类
									</el-button>
								</el-col>
							</el-row>
						</el-col>
					</el-row>
				</template>
			</el-table-column>

			<el-table-column type="index" label="#"></el-table-column>

			<el-table-column label="参数名称" prop="attr_name"></el-table-column>

			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button
						@click="editParam(scope.row)"
						type="primary"
						icon="el-icon-edit"
						>修改
					</el-button>

					<el-button
						type="danger"
						icon="el-icon-delete"
						@click="deleteParams(scope.row)"
						>删除
					</el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog
			title="添加参数"
			:visible.sync="addParamsDialog"
			@keyup.enter.native="setAddParams()"
			@closed="$refs['addParamsForm'].resetFields()"
		>
			<el-form
				label-width="auto"
				ref="addParamsForm"
				:model="addParamsFormInfo"
				:rules="addParamsFormRules"
			>
				<el-form-item label="参数名称: " prop="attr_name">
					<el-input v-model="addParamsFormInfo.attr_name"></el-input>
				</el-form-item>

				<el-form-item label="详细参数: " prop="attr_vals">
					<el-input
						v-model="addParamsFormInfo.attr_vals"
						:placeholder="sel === 'many' ? '以逗号隔开' : ''"
					></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer">
				<el-button @click="addParamsDialog = false">取消</el-button>
				<el-button
					type="primary"
					@click="setAddParams()"
					:loading="addParamsLoad"
				>
					确认
				</el-button>
			</div>
		</el-dialog>

		<el-dialog
			title="修改参数"
			:visible.sync="editParamsDialog"
			@keyup.enter.native="setEditParams()"
			@closed="$refs['editParamsForm'].resetFields()"
		>
			<el-form
				label-width="auto"
				ref="editParamsForm"
				:model="editParamsFormInfo"
				:rules="addParamsFormRules"
			>
				<el-form-item label="参数名称: " prop="attr_name">
					<el-input v-model="editParamsFormInfo.attr_name"></el-input>
				</el-form-item>

				<el-form-item label="详细参数: " prop="attr_vals">
					<el-input
						v-model="editParamsFormInfo.attr_vals"
						:placeholder="sel === 'many' ? '以逗号隔开' : ''"
					></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer">
				<el-button @click="editParamsDialog = false">取消</el-button>
				<el-button
					type="primary"
					@click="setEditParams()"
					:loading="editParamsLoad"
				>
					确认
				</el-button>
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
		id: '',
		editId: '',
		sel: 'many',
		editAttrId: '',
		addTagInfo: '',

		showAddTag: false,
		paramsLoad: false,
		addParamsLoad: false,
		editParamsLoad: false,
		addParamsDialog: false,
		editParamsDialog: false,

		addParamsFormInfo: { attr_name: '', attr_vals: '' },
		editParamsFormInfo: { attr_name: '', attr_vals: '' },
		addParamsFormRules: {
			attr_name: [{ required: true, message: '不能为空', trigger: 'change' }],
			attr_vals: []
		},
		paramsCascaderProps: {
			value: 'cat_id',
			label: 'cat_name',
			children: 'children',
			expandTrigger: 'hover'
		},

		paramsDataLIst: [],
		paramsTableData: [],
		paramsCheckedKeys: []
	}),

	created() {
		this.getParamsDataLIst()
	},

	methods: {
		async getParamsDataLIst() {
			const { data: res } = await this.$http.get('categories')

			if (!verify(res, this)) return

			this.paramsDataLIst = res.data
		},

		async cascaderChange(value) {
			if (!value.length) {
				return (this.paramsTableData = [])
			}

			this.id = value[value.length - 1]

			this.paramsLoad = true

			const { data: res } = await this.$http.get(
				`categories/${value[value.length - 1]}/attributes`,
				{ params: { sel: this.sel } }
			)

			this.paramsLoad = false

			if (!verify(res, this)) return

			this.paramsTableData = res.data
		},

		addParams() {
			this.paramsCheckedKeys.length
				? (this.addParamsDialog = true)
				: this.$msg('请选择分类 ! ! !')
		},

		tabClick(component) {
			if (!this.paramsCheckedKeys.length) return

			this.sel = component.name

			this.cascaderChange(this.paramsCheckedKeys)
		},

		async deleteTag(row, index) {
			const str = row.attr_vals
				.split(',')
				.filter((item, i) => i !== index)
				.join(',')

			const { data: res } = await this.$http.put(
				`categories/${row.cat_id}/attributes/${row.attr_id}`,
				{
					attr_name: row.attr_name,
					attr_sel: row.attr_sel,
					attr_vals: str
				}
			)

			if (!verify(res, this)) return

			row.attr_vals = res.data.attr_vals
		},

		setAddParams() {
			this.$refs['addParamsForm'].validate(async valid => {
				if (!valid) return

				this.addParamsLoad = true

				const { data: res } = await this.$http.post(
					`categories/${this.id}/attributes`,
					{
						attr_sel: this.sel,
						attr_name: this.addParamsFormInfo.attr_name,
						attr_vals: this.addParamsFormInfo.attr_vals
					}
				)

				this.addParamsLoad = false
				this.addParamsDialog = false

				if (!verify(res, this)) return

				this.cascaderChange(this.paramsCheckedKeys)
			})
		},

		async setAddTag(row) {
			this.showAddTag = false

			if (!this.addTagInfo) return this.$msg('请输入')

			const str = row.attr_vals.split(',')

			str.push(this.addTagInfo)

			const val = str.join(',')

			const { data: res } = await this.$http.post(
				`categories/${this.id}/attributes`,
				{
					attr_sel: this.sel,
					attr_name: row.attr_name,
					attr_vals: val
				}
			)

			if (!verify(res, this)) return

			row.attr_vals = res.data.attr_vals
		},

		async deleteParams(row) {
			const { data: res } = await this.$http.delete(
				`categories/${row.cat_id}/attributes/${row.attr_id}`
			)

			if (!verify(res, this)) return

			this.cascaderChange(this.paramsCheckedKeys)
		},

		editParam(row) {
			this.editParamsDialog = true

			this.editId = row.cat_id
			this.editAttrId = row.attr_id

			this.editParamsFormInfo.attr_name = row.attr_name
			this.editParamsFormInfo.attr_vals = row.attr_vals
		},

		async setEditParams() {
			this.editParamsLoad = true

			const { data: res } = await this.$http.put(
				`categories/${this.editId}/attributes/${this.editAttrId}`,
				{
					attr_sel: this.sel,
					attr_name: this.editParamsFormInfo.attr_name,
					attr_vals: this.editParamsFormInfo.attr_vals
				}
			)

			this.editParamsLoad = false
			this.editParamsDialog = false

			if (!verify(res, this)) return

			this.cascaderChange(this.paramsCheckedKeys)
		},

		handleAddButtonClick() {
			this.showAddTag = true
			this.addTagInfo = ''

			this.$nextTick(() => {
				this.$refs['addTagInput'].focus()
			})
		}
	},

	computed: {
		filterTagDataList() {
			return function(row) {
				const arr = row.attr_vals.split(',')
				return arr.filter(item => item.length)
			}
		},

		tagFlag() {
			return { flag: false }
		}
	}
}
</script>
