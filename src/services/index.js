import CartsManager from '../dao/mongo/Managers/CartsManager.js';
import ProductsManager from '../dao/mongo/Managers/ProductsManager.js';
import MessagesManager from '../dao/mongo/Managers/MessagesManager.js';
import UsersManager from '../dao/mongo/Managers/UsersManager.js';

import CartsService from './carts.service.js';
import ProductsService from './products.service.js';
import MessagesService from './messages.service.js';
import UsersService from './users.service.js';

export const cartsService = new CartsService(new CartsManager());
export const productsService = new ProductsService(new ProductsManager());
export const messagesService = new MessagesService(new MessagesManager());
export const usersService = new UsersService(new UsersManager());