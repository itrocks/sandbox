import { Representative } from '@itrocks/class-view'
import { EmailAddress }   from '@itrocks/email-address'
import { Required }       from '@itrocks/required'
import { Store }          from '@itrocks/store'
import Account            from './account'

@Representative('email') @Store()
export default class User extends Account
{

	@EmailAddress() @Required()
	email = ''

}
