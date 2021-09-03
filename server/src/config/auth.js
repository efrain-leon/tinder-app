import jwt from 'express-jwt';
import { serverConfig } from './server';

export default jwt({
  secret: serverConfig.TOKEN_SECRET,
  algorithms: ['sha1', 'RS256', 'HS256'],
  userProperty: 'payload'
}).unless({path: ['/api/validateToken', '/api/activateAccount']});