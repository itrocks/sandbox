import Store          from '../dao/store'
import Email          from '../property/validate/email'
import Required       from '../property/validate/required'
import Representative from '../view/class/representative'
import Account        from './account'

@Representative('email') @Store()
export default class User extends Account
{

	@Email() @Required()
	email = ''

}
