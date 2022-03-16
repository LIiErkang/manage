<template>
	<page-base :titles="['用户管理', '用户列表']">
		<el-row :gutter="20">
			<el-col :span="8">
				<el-input
					v-model="usersTableParams.query"
					@keyup.enter.native="getUsersTable()"
					placeholder="搜索 . . ."
					@clear="getUsersTable()"
					clearable
				>
					<el-button
						@click="getUsersTable()"
						slot="append"
						icon="el-icon-search"
					></el-button>
				</el-input>
			</el-col>

			<el-col :span="6">
				<el-button @click="openAddUser()" type="primary">
					添加用户
				</el-button>
			</el-col>
		</el-row>

		<el-table
			:data="usersTableList"
			v-loading="isPageLoad"
			style="margin: 15px 0"
			stripe
			border
		>
			<el-table-column type="index" label="#"></el-table-column>
			<el-table-column prop="username" label="用户名"></el-table-column>
			<el-table-column prop="email" label="邮箱"></el-table-column>
			<el-table-column prop="mobile" label="电话"></el-table-column>
			<el-table-column prop="mg_state" label="状态">
				<template slot-scope="scope">
					<el-switch
						v-model="scope.row.mg_state"
						@click.native="changeState(scope.row)"
					></el-switch>
				</template>
			</el-table-column>

			<el-table-column prop="mg_state" label="操作" width="250">
				<template slot-scope="scope">
					<el-button
						@click="openEditUser(scope.row)"
						size="small"
						icon="el-icon-edit"
						type="primary"
					></el-button>

					<el-popconfirm
						style="margin: 0 10px"
						confirm-button-text="好的"
						cancel-button-text="不用了"
						title="确定删除此用户吗？"
						@confirm="deleteUser(scope.row)"
						hide-icon
					>
						<el-button
							icon="el-icon-delete"
							size="small"
							type="danger"
							slot="reference"
						></el-button>
					</el-popconfirm>

					<el-tooltip
						effect="light"
						content="权限管理"
						placement="top-start"
						:enterable="false"
					>
						<el-button
							@click="setRole(scope.row)"
							size="small"
							icon="el-icon-s-tools"
							type="warning"
						></el-button>
					</el-tooltip>
				</template>
			</el-table-column>
		</el-table>

		<el-pagination
			:page-sizes="[3, 5, 10, 15]"
			:page-size="usersTableParams.pagesize"
			:total="tableTotal"
			:current-page="usersTableParams.pagenum"
			@size-change="handleSizeChange($event)"
			@current-change="handleCurrentChange($event)"
			layout="total, sizes, prev, pager, next, jumper"
		>
		</el-pagination>

		<el-dialog
			:title="dialogTitle"
			:visible.sync="isDialog"
			@keyup.enter.native="submit()"
		>
			<el-form
				:model="dialogForm"
				ref="dialogForm"
				:rules="dialogFormRules"
				label-width="auto"
			>
				<el-form-item
					v-for="(item, name, index) of dialogForm"
					:label="dialogFormLabel[name]"
					:prop="name"
				>
					<el-input
						v-model="dialogForm[name]"
						:disabled="index === 0 && dialogTitle !== '添加用户'"
					></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer">
				<el-button @click="isDialog = false">取 消</el-button>
				<el-button @click="submit()" :loading="dialogLoading" type="primary">
					确 定
				</el-button>
			</div>
		</el-dialog>

		<el-dialog
			@keyup.enter.native="setRoleName()"
			title="分配角色"
			:visible.sync="setRoleDialog"
		>
			<el-row>
				<el-col>
					<span>当前的用户: {{ setRoleUsername }}</span>
				</el-col>
			</el-row>
			<br />
			<el-row>
				<el-col>
					<span>当前的角色: {{ setRoleRoleName }}</span>
				</el-col>
			</el-row>
			<br />

			<el-row>
				<el-col>
					<span>分配新角色: </span>
					<el-select v-model="selectRole">
						<el-option
							v-for="item in roleList"
							:label="item.roleName"
							:value="item.id"
						>
						</el-option>
					</el-select>
				</el-col>
			</el-row>
			<br />

			<div slot="footer">
				<el-button @click="setRoleDialog = false">取消</el-button>
				<el-button @click="setRoleName()" type="primary" :loading="setRoleLoad">
					确认
				</el-button>
			</div>
		</el-dialog>
	</page-base>
</template>

<script>
import PageBase from 'components/page/PageBase'

import { verify } from 'utils'

export default {
	name: 'Users',

	data: () => ({
		id: '',
		selectRole: '',
		dialogTitle: '',
		setRoleUsername: '',
		setRoleRoleName: '',

		tableTotal: 0,

		isDialog: false,

		isPageLoad: false,
		setRoleLoad: false,
		dialogLoading: false,
		setRoleDialog: false,

		row: null,
		roleList: null,
		dialogForm: null,
		usersTableParams: { query: '', pagenum: 1, pagesize: 5 },
		dialogFormLabel: {
			username: '用户名',
			password: '密码',
			email: '邮箱',
			mobile: '电话'
		},
		dialogFormRules: {
			username: [{ required: true, message: '不能为空', trigger: 'change' }],
			password: [{ required: true, message: '不能为空', trigger: 'change' }]
		},

		usersTableList: []
	}),

	components: { PageBase },

	async created() {
		this.getUsersTable()

		const { data: res } = await this.$http.get(`roles`)

		if (!verify(res, this)) return

		this.roleList = res.data
	},

	methods: {
		async getUsersTable() {
			this.isPageLoad = true

			const { data: res } = await this.$http.get('users', {
				params: this.usersTableParams
			})

			this.isPageLoad = false

			if (!verify(res, this)) return

			this.usersTableList = res.data.users

			this.tableTotal = res.data.total
		},

		async changeState(row) {
			const { data: res } = await this.$http.put(
				`users/${row.id}/state/${row.mg_state}`
			)

			if (!verify(res, this)) return

			this.getUsersTable()
		},

		handleSizeChange(value) {
			this.usersTableParams.pagesize = value
			this.getUsersTable()
		},

		handleCurrentChange(value) {
			this.usersTableParams.pagenum = value
			this.getUsersTable()
		},

		async deleteUser(row) {
			const { data: res } = await this.$http.delete(`users/${row.id}`)

			if (!verify(res, this)) return

			this.getUsersTable()
		},

		openAddUser() {
			this.row = null

			this.dialogTitle = '添加用户'
			this.dialogForm = { username: '', password: '', email: '', mobile: '' }

			this.isDialog = true
		},

		openEditUser(row) {
			this.row = row

			this.dialogForm = {
				username: this.row.username,
				email: this.row.email,
				mobile: this.row.mobile
			}

			this.dialogTitle = '修改用户'
			this.isDialog = true
		},

		submit() {
			this.$refs['dialogForm'].validate(async valid => {
				if (!valid) return

				this.dialogLoading = true

				const { data: res } =
					this.dialogTitle === '添加用户'
						? await this.$http.post('users', this.dialogForm)
						: await this.$http.put(`users/${this.row.id}`, this.dialogForm)

				this.isDialog = false
				this.dialogLoading = false

				if (!verify(res, this)) return

				this.getUsersTable()
			})
		},

		async setRole(row) {
			this.setRoleDialog = true

			this.id = row.id

			this.setRoleUsername = row.username

			this.setRoleRoleName = row.role_name
			this.selectRole = row.role_name
		},

		async setRoleName() {
			this.setRoleLoad = true

			const { data: res } = await this.$http.put(`users/${this.id}/role`, {
				id: this.id,
				rid: this.selectRole
			})

			this.setRoleLoad = false
			this.setRoleDialog = false

			if (!verify(res, this)) return

			this.getUsersTable()
		}
	}
}
</script>
