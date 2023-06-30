import { Router } from "express";
//import ProductManager from "../../managers/fs/ProductManagers.js";
import productsModel from "../dao/mongo/models/products.js"
import ProductsManager from "../dao/mongo/Managers/ProductsManager.js";
import usersModel from "../dao/mongo/models/products.js";

const productManager = new ProductsManager();

//const productManager = new ProductManager();
const router = Router();


/* MongoDB */
router.get('/', async (req, res) => {
  try {
    const { page = 1, category } = req.query;
    const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await usersModel.paginate(
      { /* category: "frutas" */ },
      {
        page, limit: 5,
        lean: true,
        sort: { price: 1 }
      });
    const products = docs

    const totalPages = rest.totalPages;
    const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null;
    const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null;

    const result = {
      status: "success",
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page: rest.page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink
    };
    res.send(result);
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, price, code, stock, category, thumbnails } = req.body;
    const productWithCode = await productsModel.findOne({ code })

    //Comprobando que no falten datos o que no esten vacíos

    if (!title || !description || !price || !code || !stock || !category || !thumbnails) return res.status(400).send({ status: 'error', error: 'Datos incompletos, por favor, verifica que los datos se estén enviando correctamente' });

    const existingProduct = productWithCode;
    if (existingProduct) {
      return res.status(400).send({ status: 'error', error: 'El código de producto ya está en uso' });
    }

    const product = {
      title,
      description,
      price,
      code,
      stock,
      category,
      thumbnails
    };

    const result = await productManager.addProduct(product);
    res.send({ status: "success", message: "Producto agregado correctamente", payload: result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message })
  }
});

router.get('/:pId', async (req, res) => {
  try {
    const productId = req.params.pId;
    const product = await productManager.getProductById(productId);
    if (product) {
      res.send({ status: "success", message: `El producto '${product.title}', se ha cargado correctamente`, payload: product });
    } else {
      res.status(400).send({ status: "error", error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' })
  }
});

router.put('/:pId', async (req, res) => {
  try {
    const productId = req.params.pId;
    const productToUpdate = req.body;
    const result = await productManager.updateProduct(productId, productToUpdate)
    console.log(result);
    res.send({ status: "success", message: "Producto actualizado con éxito" })
  } catch (error) {
    console.log(error);
    res.status(400).send('Producto no encontrado')
  }
})

router.delete('/:pId', async (req, res) => {
  try {
    const productId = req.params.pId;
    const result = await productManager.deleteProduct(productId);
    console.log(result);
    res.send({ status: "success", message: "Su producto ha sido eliminado con éxito" })
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
});


/* FileSystem */
/* router.get('/', async (req, res) => {
  try {
    let products;
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      products = await productManager.getProducts(limit);
    } else {
      products = await productManager.getProducts();
    }
    res.status(200).send({ status: "success", payload: products });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}); */

/* router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails, status } = req.body;
    const newProduct = await productManager.addProduct({ title, description, price, code, stock, category, thumbnails, status });
    const products = await productManager.getProducts();
    req.io.emit('products', products);
    res.status(200).send({ status: "success", message: "Producto agregado correctamente", payload: newProduct });
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}); */

/* router.get('/:pId', async (req, res) => {
  try {
    const productId = parseInt(req.params.pId);
    const product = await productManager.getProductById(productId);
    if (product) {
      res.send({ status: "success", message: `El producto '${req.params.pId}' - '${product.title}', se ha cargado correctamente`, payload: product });
    } else {
      res.status(400).send('Producto no encontrado');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status:"error", error: "Error interno del servidor" })
  }
}); */

/* router.put('/:pId', async (req, res) => {
  const updates = req.body;
  delete updates.id;

  try {
    const productId = parseInt(req.params.pId);
    const product = await productManager.getProductById(productId)
    if (product) {
      const updatedProduct = await productManager.updateProduct(productId, updates);
      res.status(200).send({ status: "success", message: `Producto '${req.params.pId}' actualizado correctamente`, payload: updatedProduct })
    } else {
      res.status(400).send('Producto no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
}); */

/* router.delete('/:pId', async (req, res) => {
  try {
    const productId = parseInt(req.params.pId);
    const product = await productManager.getProductById(productId);
    if (product) {
      await productManager.deleteProduct(productId);
      const products = await productManager.getProducts();
      req.io.emit('products', products);
      res.status(200).send({ status: "success", message: `El producto '${product.title}' ha sido eliminado con éxito`, payload: product });
    } else {
      res.status(404).send({ status: "error", error: error.message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: error.message });
  }
}); */

export default router