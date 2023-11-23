import Account from './account'
import email from '../property/validate/email'
import required from "../property/validate/required";
import store from '../dao/store'

@store()
class User extends Account
{

    @email() @required()
    email = ''

}

export default User
