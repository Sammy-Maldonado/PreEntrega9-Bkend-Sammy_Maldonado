import { Router } from "express";
//import { privacy } from "../middlewares/auth.js";
import ProductsManager from "../dao/mongo/Managers/ProductsManager.js";
import CartsManager from "../dao/mongo/Managers/CartsManager.js";
import productsModel from "../dao/mongo/models/products.js";
import cartsModel from "../dao/mongo/models/carts.js";
import { authRoles, passportCall } from "../services/auth.js";

const router = Router();

const productsServices = new ProductsManager();
const cartsServices = new CartsManager();

/* MongoDb */

router.get('/', passportCall('jwt', {strategyType: 'jwt', sessions:false}), async (req, res) => {
  const products = await productsServices.getProducts().lean();
  res.render('products', {products, user: req.user});
});

router.get('/carts', async (req, res) => {
  const carts = await cartsServices.getCarts().lean();
  res.render('carts', { carts });
});

router.get('/chat', async (req, res) => {
  res.render('chat');
})

router.get('/products', passportCall('jwt', {strategyType: 'jwt', sessions:false}), async (req, res) => {
  const { page = 1, category, sort = 1 } = req.query;
  const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await productsModel.paginate(
    { /* category: "frutas" */ },
    {
      page, limit: 5,
      lean: true,
      sort: { price: sort }
    });
  const products = docs

  res.render('products', { user:req.user, products, page: rest.page, hasPrevPage, hasNextPage, prevPage, nextPage })
});

router.get('/register', passportCall('jwt', {strategyType: 'jwt', sessions:false, redirect: '/products'}), (req,res)=>{
  res.render('register');
})

router.get('/login', passportCall('jwt', { strategyType: 'jwt', sessions: false, redirect: '/products' }), (req, res) => {
  res.render('login');
});

router.get('/profile', passportCall('jwt', {strategyType: 'jwt', sessions:false}),(req,res)=>{
  res.render('profile',{ user:req.user })
})

router.get('/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await productsModel.findById(productId).lean();

    if (!product) {
      res.status(404).send({ error: "Producto no encontrado. Por favor, ingrese un Id válido." });
      return;
    }

    res.render('product-details', { product });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message });
  }
});

router.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    const cart = await cartsModel.findById(cartId).populate('products.product').lean();

    if (!cart) {
      res.status(404).send({ error: "Carrito no encontrado. Por favor, ingrese una Id válida." });
      return;
    }

    res.render('cart-details', { cart });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message });
  }
});

export default router;