import { UserController } from './controller/UserController'

export const Routes = [{
  method: 'post',
  route: '/api/register',
  controller: UserController,
  action: 'save'
},
{
  method: 'post',
  route: '/api/login',
  controller: UserController,
  action: 'login'
}]
