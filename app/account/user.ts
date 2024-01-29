import Store    from '../dao/store'
import Email    from '../property/validate/email'
import Required from '../property/validate/required'
import Account  from './account'

@Store()
export default class User extends Account
{

	@Email() @Required()
	email = ''

}
