import { Component } from '@itrocks/composition'
import { Store }     from '@itrocks/store'
import User          from './account/user'
import DemoLine      from './demo-line'
import Required      from './property/validate/required'

@Store()
export default class Demo
{

	age?: number

	birthday = new Date

	@Component()
	lines: DemoLine[] = []

	@Required()
	name = ''

	user?: User

	users: User[] = []

}
