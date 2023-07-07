import { cartsService, productsService } from '../dao/mongo/Managers/index.js';

const getCarts = async (req, res) => {
  try {
    const carts = await cartsService.getCarts();
    res.status(200).send({ status: "success", payload: carts });
  } catch (error) {
    res.status(500).send({ status: "error", error: 'Error interno del servidor' })
  }
}

const addCart = async (req, res) => {
  try {
    const { name, price } = req.body;

    //Verificando que los campos name y price se envien correctamente.
    if (!name || !price) {
      throw new Error("El 'name' y 'price' del producto deben estar indicados");
    }

    //Verificando que los campos name y price sean de tipo string y number respectivamente.
    if (typeof name !== 'string' || typeof price !== 'number') {
      throw new Error("El 'name' debe ser de tipo 'String' y el 'price' de tipo 'Number'")
    }

    const newCart = await cartsService.addCart({ name, price });
    res.status(200).send({ status: "success", cart: newCart });
  } catch (error) {
    res.status(500).send({ status: "error", error: error.message });
  }
}

const getCartById = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartsService.getCartById(cartId).populate('products.product');
    if (cart) {
      res.send({ status: "success", message: `El cartito '${req.params.cid}' se ha cargado con exito`, payload: cart });
    } else {
      res.status(400).send({ status: "error", error: 'Producto no encontrado, ingrese una Id valida' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message })
  }
}

const updateCart = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const updatedProducts = req.body.products;

    // Verificando si los productos existen en la base de datos
    const productIds = updatedProducts.map(product => product.product);
    const existingProducts = await productsService.getProducts({ _id: { $in: productIds } });

    // Validando si se encontraron todos los productos
    if (existingProducts.length !== productIds.length) {
      res.status(400).send({ error: "Una o más IDs de productos no existen en la base de datos. Por favor, ingrese IDs válidas" });
      return;
    }

    const updatedCart = await cartsService.updateCart(cartId, updatedProducts);

    res.status(200).send({ status: "success", message: `Carrito actualizado correctamente`, payload: updatedCart });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message });
  }
}

const deleteAllProducts = async (req, res) => {
  try {
    const cartId = req.params.cid;
    const deleteProducts = [];

    const deleteAllProducts = await cartsService.deleteAllProducts(cartId, deleteProducts);

    res.status(200).send({ status: "success", message: `Productos del carrito eliminados con éxito`, payload: deleteAllProducts });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message });
  }
}

const addProductToCart = async (req, res) => {
  try {
    const cid = (req.params.cid);
    const pid = (req.params.pid);
    const quantity = (req.body.quantity);

    // Validando si el ID del producto es mayor que 0
    if (pid <= 0) {
      throw new Error('El Id del producto debe ser mayor que 0.');
    }

    const updatedCart = await cartsService.addProductToCart(cid, pid, quantity);
    if (updatedCart) {
      res.status(200).send({ status: "success", message: `Producto agregado correctamente al carrito '${req.params.cid}'`, payload: updatedCart })
    } else {
      res.status(400).send({ status: "error", error: error.message })
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message })
  }
}

const updateProductQuantity = async (req, res) => {
  try {
    const cid = (req.params.cid);
    const pid = (req.params.pid);
    const quantity = (req.body.quantity);

    // Validando si el ID del producto es mayor que 0
    if (pid <= 0) {
      throw new Error('El Id del producto debe ser mayor que 0.');
    }

    const updatedProductQuantity = await cartsService.updateProductQuantity(cid, pid, quantity);
    if (updatedProductQuantity) {
      res.status(200).send({ status: "success", message: `Cantidad actualizada correctamente`, payload: updatedProductQuantity })
    } else {
      res.status(400).send({ status: "error", error: error.message })
    }

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message })
  }
}

const deleteProductFromCart = async (req, res) => {
  const {cid, pid} = req.params;

  try {
    const cart = await cartsService.deleteProductFromCart(cid, pid);

    // Consulta para obtener el título del producto eliminado
    const deleteProduct = await productsService.getProductById(pid);

    res.status(200).send({ status: "success", message: `El producto '${deleteProduct.title}' ha sido eliminado con exito`, payload: deleteProduct});

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: error.message })
  }
}

export default {
  getCarts,
  addCart,
  getCartById,
  updateCart,
  deleteAllProducts,
  addProductToCart,
  updateProductQuantity,
  deleteProductFromCart
}