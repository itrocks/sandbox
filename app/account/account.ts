import { Password } from '@itrocks/password'
import { Required } from '@itrocks/required'
import { Store }    from '@itrocks/store'

@Store()
export default class Account
{

	@Required()
	login = ''

	@Password()
	password = ''

}
