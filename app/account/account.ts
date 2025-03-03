import { Required } from '@itrocks/required'
import { Store }    from '@itrocks/store'
import { Password } from '../property/transform/password'

@Store()
export default class Account
{

	@Required()
	login = ''

	@Password()
	password = ''

}
