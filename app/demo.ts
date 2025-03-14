import { Component } from '@itrocks/composition'
import { Required }  from '@itrocks/required'
import { Store }     from '@itrocks/store'
import { User }      from '@itrocks/user'
import { DemoLine }  from './demo-line'

@Store()
export class Demo
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
