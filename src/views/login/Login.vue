<template>
	<div class="login-container" @keyup.enter="login()">
		<el-card class="login-card">
			<div slot="header">登录</div>

			<el-form
				ref="loginForm"
				:rules="loginFormRules"
				:model="loginInfo"
				label-width="auto"
			>
				<el-form-item label="用户名: " prop="username">
					<el-input
						ref="loginFormItemUsernameInput"
						v-model="loginInfo.username"
						clearable
					/>
				</el-form-item>

				<el-form-item label="密码: " prop="password">
					<el-input v-model="loginInfo.password" clearable show-password />
				</el-form-item>

				<el-form-item class="flex-center">
					<el-button type="primary" @click="login()" :loading="loginButton">
						login
					</el-button>
					<el-button type="info" @click="reset()" plain>reset</el-button>
				</el-form-item>
			</el-form>
		</el-card>
	</div>
</template>

<script>
import { verify } from 'utils'

export default {
	name: 'Login',

	data: () => ({
		loginInfo: {
			username: 'admin',
			password: '123456'
		},
		loginFormRules: {
			username: [
				{ required: true, message: '请输入用户名', trigger: 'change' },
				{
					min: 3,
					max: 10,
					message: '请输入 3 - 10 个字符',
					trigger: 'change'
				}
			],

			password: [
				{ required: true, message: '请输入密码', trigger: 'change' },
				{
					min: 6,
					max: 15,
					message: '请输入 6 - 15 个字符',
					trigger: 'change'
				}
			]
		},
		loginButton: false
	}),

	mounted() {
		this.$refs['loginFormItemUsernameInput'].focus()
	},

	methods: {
		login() {
			this.$refs['loginForm'].validate(async valid => {
				if (!valid) return

				this.loginButton = true

				const { data: res } = await this.$http.post('login', this.loginInfo)
				this.loginButton = false

				if (!verify(res, this)) return

				window.sessionStorage.setItem('token', res.data.token)
				this.$router.push('/page')
			})
		},

		reset() {
			this.$refs['loginForm'].resetFields()
		}
	}
}
</script>
