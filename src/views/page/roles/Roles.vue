<template>
	<page-base :titles="['权限管理', '角色列表']">
		<el-row :gutter="20">
			<el-col :span="8">
				<el-input
					@keyup.enter.native="getRolesDataList()"
					@clear="getRolesDataList()"
					v-model="query"
					placeholder="搜索 . . ."
					clearable
				>
					<el-button
						@click="getRolesDataList()"
						slot="append"
						icon="el-icon-search"
					></el-button>
				</el-input>
			</el-col>

			<el-col :span="6">
				<el-button type="primary" @click="openAddRole()">添加角色</el-button>
			</el-col>
		</el-row>

		<el-table
			class="roles-table"
			:data="rolesDataList"
			style="margin: 15px 0"
			v-loading="isRolesLoading"
			stripe
			border
		>
			<el-table-column type="expand">
				<template slot-scope="scope">
					<el-row
						:class="['roles-row', 'flex-center', { 'border-top': index === 0 }]"
						v-for="(items, index) of scope.row.children"
					>
						<el-col :span="5">
							<el-tag @close="tagClose(scope.row, items.id)" closable>
								{{ items.authName }}
							</el-tag>
							<i class="el-icon-caret-right"></i>
						</el-col>

						<el-col :span="19">
							<el-row
								:class="[
									index !== items.children.length - 1 ? 'roles-row' : '',
									'flex-center'
								]"
								v-for="(item, index) of items.children"
							>
								<el-col :span="6">
									<el-tag
										type="success"
										@close="tagClose(scope.row, item.id)"
										closable
									>
										{{ item.authName }}
									</el-tag>
									<i class="el-icon-caret-right"></i>
								</el-col>

								<el-col :span="18">
									<el-tag
										@close="tagClose(scope.row, i.id)"
										v-for="i of item.children"
										type="warning"
										closable
									>
										{{ i.authName }}
									</el-tag>
								</el-col>
							</el-row>
						</el-col>
					</el-row>
				</template>
			</el-table-column>

			<el-table-column type="index" label="#"></el-table-column>
			<el-table-column prop="roleName" label="角色名称"></el-table-column>
			<el-table-column prop="roleDesc" label="角色描述"></el-table-column>
			<el-table-column label="操作" width="400">
				<template slot-scope="scope">
					<div>
						<el-button
							@click="openEditRole(scope.row)"
							size="small"
							type="primary"
							icon="el-icon-edit"
						>
							编辑
						</el-button>
						<el-button
							@click="deleteRoles(scope.row)"
							size="small"
							type="danger"
							icon="el-icon-delete"
						>
							删除
						</el-button>
						<el-button
							@click="openEditPower(scope.row)"
							size="small"
							type="warning"
							icon="el-icon-s-tools"
						>
							分配权限
						</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog
			@close="handelDialogClose()"
			@keyup.enter.native="changeRoles()"
			:visible.sync="isRolesDialog"
			title="权限分配"
		>
			<el-tree
				:data="rightsDataTree"
				:props="defaultProps"
				:default-checked-keys="defaultChecked"
				ref="rolesTree"
				node-key="id"
				default-expand-all
				show-checkbox
			></el-tree>

			<span slot="footer" class="dialog-footer">
				<el-button @click="isRolesDialog = false">取 消</el-button>
				<el-button :loading="editLoad" type="primary" @click="changeRoles()">
					确 定
				</el-button>
			</span>
		</el-dialog>

		<el-dialog
			title="添加用户"
			@closed="$refs['addRoleForm'].resetFields()"
			:visible.sync="addRoleDialog"
			@keyup.enter.native="setAddRole()"
		>
			<el-form
				ref="addRoleForm"
				:model="addRole"
				:rules="addRoleRule"
				label-width="auto"
			>
				<el-form-item label="角色名称: " prop="roleName">
					<el-input v-model="addRole.roleName" clearable></el-input>
				</el-form-item>

				<el-form-item label="角色描述: " prop="roleDesc">
					<el-input v-model="addRole.roleDesc" clearable></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer">
				<el-button @click="addRoleDialog = false">取消</el-button>
				<el-button type="primary" :loading="setRoleLoad" @click="setAddRole()">
					确认
				</el-button>
			</div>
		</el-dialog>

		<el-dialog
			title="编辑权限"
			:visible.sync="editRoleDialog"
			@keyup.enter.native="setEditRole()"
		>
			<el-form :model="editRole" :rules="addRoleRule" label-width="auto">
				<el-form-item label="角色名称: " prop="roleName">
					<el-input v-model="editRole.roleName"></el-input>
				</el-form-item>

				<el-form-item label="角色描述: ">
					<el-input v-model="editRole.roleDesc"></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer">
				<el-button @click="addRoleDialog = false">取消</el-button>
				<el-button
					type="primary"
					:loading="editRoleLoad"
					@click="setEditRole()"
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
	name: 'Roles',

	components: { PageBase },

	data: () => ({
		id: '',
		editId: '',
		query: '',

		editLoad: false,
		setRoleLoad: false,
		editRoleLoad: false,
		isRolesDialog: false,
		addRoleDialog: false,
		editRoleDialog: false,
		isRolesLoading: false,

		rolesDataList: [],
		rightsDataTree: [],
		defaultChecked: [],

		addRole: { roleName: '', roleDesc: '' },
		editRole: { roleName: '', roleDesc: '' },
		defaultProps: { label: 'authName', children: 'children' },
		addRoleRule: {
			roleName: [{ required: true, message: '不能为空', trigger: 'change' }],
			roleDesc: [{ required: true, message: '不能为空', trigger: 'change' }]
		}
	}),

	created() {
		this.getRolesDataList()
		this.getRightsDataTree()
	},

	methods: {
		async getRolesDataList() {
			this.isRolesLoading = true

			const { data: res } = await this.$http.get(`roles/${this.query}`)

			this.isRolesLoading = false

			if (!verify(res, this)) return

			this.rolesDataList = res.data
		},

		tagClose(role, rightId) {
			this.$confirm('此操作无法恢复!', '确认删除?', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',

				callback: async action => {
					if (action === 'cancel') {
						return this.$msg('已取消', 'warning')
					}

					const { data: res } = await this.$http.delete(
						`roles/${role.id}/rights/${rightId}`
					)

					if (!verify(res, this)) return

					role.children = res.data
				}
			})
		},

		async getRightsDataTree() {
			const { data: res } = await this.$http.get(`rights/tree`)

			if (!verify(res, this)) return

			this.rightsDataTree = res.data
		},

		openEditPower(row) {
			row.children.forEach(item =>
				item.children.forEach(item =>
					item.children.forEach(item => {
						if (item.id) this.defaultChecked.push(item.id)
					})
				)
			)

			this.id = row.id

			this.isRolesDialog = true

			this.$nextTick(() => {
				this.$refs['rolesTree'].setCheckedKeys(this.defaultChecked)
			})
		},

		handelDialogClose() {
			this.$refs['rolesTree'].setCheckedKeys([])

			this.defaultChecked = []
		},

		async deleteRoles(row) {
			this.isRolesLoading = true

			const { data: res } = await this.$http.delete(`roles/${row.id}`)

			this.isRolesLoading = false

			if (!verify(res, this)) return

			this.getRolesDataList()
		},

		async changeRoles() {
			this.editLoad = true

			const keys = [
				...this.$refs['rolesTree'].getCheckedKeys(),
				...this.$refs['rolesTree'].getHalfCheckedKeys()
			]

			const key = keys.join(',')

			const { data: res } = await this.$http.post(`roles/${this.id}/rights`, {
				rids: key
			})

			this.isRolesDialog = false
			this.editLoad = false

			if (!verify(res, this)) return

			this.getRolesDataList()
		},

		openAddRole() {
			this.addRoleDialog = true
		},

		setAddRole() {
			this.$refs['addRoleForm'].validate(async valid => {
				if (!valid) return

				this.setRoleLoad = true

				const { data: res } = await this.$http.post('roles', this.addRole)

				this.setRoleLoad = false
				this.addRoleDialog = false

				if (!verify(res, this)) return

				this.getRolesDataList()
			})
		},

		openEditRole(row) {
			this.editRoleDialog = true

			this.editId = row.id

			this.editRole.roleName = row.roleName
			this.editRole.roleDesc = row.roleDesc
		},

		async setEditRole() {
			this.editRoleLoad = true
			const { data: res } = await this.$http.put(
				`roles/${this.editId}`,
				this.editRole
			)

			this.editRoleLoad = false
			this.editRoleDialog = false

			if (!verify(res, this)) return

			this.getRolesDataList()
		}
	}
}
</script>
