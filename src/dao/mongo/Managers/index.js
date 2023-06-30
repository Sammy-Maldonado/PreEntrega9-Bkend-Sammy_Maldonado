import CartsManager from './CartsManager.js';
import MessagesManager from './MessagesManager.js'
import ProductsManager from './ProductsManager.js'
import UsersManager from './UsersManager.js';

export const cartsService = new CartsManager();
export const messagesService = new MessagesManager();
export const productsService = new ProductsManager();
export const usersService = new UsersManager();