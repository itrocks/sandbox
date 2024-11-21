import User     from './account/user'
import Store    from './dao/store'
import Required from './property/validate/required'

@Store()
export default class Demo
{

	age?: number

	birthday = new Date

	@Required()
	name = ''

	user?: User

}
