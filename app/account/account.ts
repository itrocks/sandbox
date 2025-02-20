import Store    from '@itrocks/store'
import Password from '../property/transform/password'
import Required from '../property/validate/required'

@Store()
export default class Account
{

	@Required()
	login = ''

	@Password()
	password = ''

}
