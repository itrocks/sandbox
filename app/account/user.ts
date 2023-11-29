import Account from './account'
import Email from '../property/validate/email'
import Required from '../property/validate/required'
import Store from '../dao/store'

@Store()
class User extends Account
{

    @Email() @Required()
    email = ''

}

export default User
