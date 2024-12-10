import User      from './account/user'
import Store     from './dao/store'
import DemoLine  from './demo-line'
import Component from './orm/component'
import Required  from './property/validate/required'

@Store()
export default class Demo
{

	age?: number

	birthday = new Date

	// TODO Fix infinite recursion
	//@Component()
	//lines: DemoLine[] = []

	@Required()
	name = ''

	user?: User

	users: User[] = []

}
