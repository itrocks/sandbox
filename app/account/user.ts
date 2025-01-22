import { Representative } from '@itrocks/class-view'
import { Store }          from '@itrocks/store'
import { Email }          from '../property/validate/email'
import { Required }       from '../property/validate/required'
import Account            from './account'

@Representative('email') @Store()
export default class User extends Account
{

	@Email() @Required()
	email = ''

}
