import { Component } from '@itrocks/composition'
import { Required }  from '@itrocks/required'
import { Store }     from '@itrocks/store'
import User          from './account/user'
import DemoLine      from './demo-line'

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
