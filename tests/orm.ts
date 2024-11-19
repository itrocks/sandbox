
class User {
	name = 'user-name'
}

class Demo
{

	user?: User

	get filou() {
		return new User
	}

	set filou(value) {
	}

	aMethod()
	{
	}

}

Object.defineProperty(Demo.prototype, 'user', {
	get()
	{
		const value = new User
		console.log('get user')
		Object.defineProperty(this, 'user', {
			value
		})
		return value
	},
	set(value)
	{
		console.log('set user')
		Object.defineProperty(this, 'user', {
			value
		})
	}
})

const demo = new Demo
delete demo.user
console.log(demo.user)

console.log(Object.keys(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(demo))))
