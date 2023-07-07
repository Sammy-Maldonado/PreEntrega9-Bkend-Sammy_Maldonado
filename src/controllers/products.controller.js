import { productsService } from '../dao/mongo/Managers/index.js';

const getProducts = async (req, res) => {
  try {
    const { page = 1, category } = req.query;
    const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, ...rest } = await productsService.addPaginate(
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
}

const addProduct = async (req, res) => {
  try {
    const { title, description, price, code, stock, category, thumbnails } = req.body;
    const productWithCode = await productsService.getOneProduct({ code })

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

    const result = await productsService.addProduct(product);
    res.send({ status: "success", message: "Producto agregado correctamente", payload: result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message })
  }
}

const getProductById = async (req, res) => {
  try {
    const productId = req.params.pId;
    const product = await productsService.getProductById(productId);
    if (product) {
      res.send({ status: "success", message: `El producto '${product.title}', se ha cargado correctamente`, payload: product });
    } else {
      res.status(400).send({ status: "error", error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' })
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.pId;
    const productToUpdate = req.body;
    const result = await productsService.updateProduct(productId, productToUpdate)
    console.log(result);
    res.send({ status: "success", message: "Producto actualizado con éxito" })
  } catch (error) {
    console.log(error);
    res.status(400).send('Producto no encontrado')
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.pId;
    const result = await productsService.deleteProduct(productId);
    console.log(result);
    res.send({ status: "success", message: "Su producto ha sido eliminado con éxito" })
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error: 'Error interno del servidor' });
  }
}

export default {
  getProducts,
  addProduct,
  getProductById,
  updateProduct,
  deleteProduct
}