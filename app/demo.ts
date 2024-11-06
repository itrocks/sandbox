import User  from './account/user'
import Store from './dao/store'

@Store()
export default class Demo
{

	age?: number

	birthday = new Date

	name = ''

	user?: User

}
