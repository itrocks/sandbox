import { Representative } from '@itrocks/class-view'
import { Required }       from '@itrocks/required'
import { Store }          from '@itrocks/store'
import { Email }          from '../property/validate/email'
import Account            from './account'

@Representative('email') @Store()
export default class User extends Account
{

	@Email() @Required()
	email = ''

}
