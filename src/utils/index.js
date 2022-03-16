export function verify(res, that) {
	if (res.meta.status === 200 || res.meta.status === 201) {
		that.$msg(res.meta.msg, 'success')
		return true
	} else {
		that.$msg(res.meta.msg)
		return false
	}
}
