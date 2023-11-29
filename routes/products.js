import express from 'express';

import upload from '../config/multer';
import Passport from '../config/passport';
import catchResponse from '../utils/catch-response';
import {
  GetProducts,
  DeleteProductById,
  UpdateProductById,
  AddProduct,
  AddBulkProducts,
  DeleteProductImages,
  GetSharedProduct,
  GetProductDetails
} from '../controllers';

const router = express.Router();

router.get('/get-shared-product', async (req, res) => {
  try {
    const { id } = req.query;
    const products = await GetSharedProduct(id);
    if (products) {
      const total = products.length;
      const resObj = {
        products: products,
        total: total
      };
      res.status(200).send(resObj);
    } else {
      throw new Error ('Something Bad Happened');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/get-product-details', async (req, res) => {
  try {
    const { id } = req.body;
    const product = await GetProductDetails(id);
    if (product) res.status(200).send(product);
    else throw new Error ('Product Not Found');
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/get-products', async (req, res) => {
  try {
    const {
      filterArr,
      skip,
      select,
      limit
    } = req.body;
    const products = await GetProducts({
      skip,
      limit,
      select,
      filterArr
    });
    res.status(200).send(products);
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.patch('/update-product', Passport.authenticate('jwt', { session: false }), upload, async (req, res) => {
  try {
    if ( req.user.type === 'admin') {
      if (req.files) {
        let nameArray = [];
        req.files.forEach((file)=>{
          nameArray.push(`http://localhost:4000/${file.filename}`);
        });
        req.body.thumbnail = nameArray[0];
        req.body.images = nameArray;
      }
      
      const {
        prodId,
        title,
        description,
        price,
        stock,
        thumbnail,
        images,
        color,
        size
      } = req.body;

      const prodData = {
        title,
        description,
        price,
        stock,
        thumbnail,
        images,
        color,
        size
      };
      console.log(req.body);
      const prod = await UpdateProductById(prodId, prodData);
      if (!prod)
        throw new Error('No product found');
      res.status(200).send('Product updated');
    } else {
      throw new Error ('Permission not granted');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/add-product', Passport.authenticate('jwt', { session: false }), upload, async (req, res) => {
  try {
    if ( req.user.type === 'admin') {
      let nameArray = [];
      req.files.forEach((file)=>{
        nameArray.push(`http://localhost:4000/${file.filename}`);
      });
      req.body.thumbnail = nameArray[0];
      req.body.images = nameArray;
      const prod = await AddProduct(req.body);
      res.status(200).send(prod);
    } else {
      throw new Error ('Permission not granted');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/delete-product-images', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if ( req.user.type === 'admin') {
      const { filesToDelete } = req.body;
      const err = await DeleteProductImages(filesToDelete);
      if (err)
        throw new Error(err);
      res.status(200).send('Files Cleared');
    } else {
      throw new Error ('Permission not granted');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/add-product-images', Passport.authenticate('jwt', { session: false }), upload, async (req, res) => {
  try {
    let nameArray = [];
    req.files.forEach((file)=>{
      nameArray.push(file.filename);
    });
    console.log('sucess');
    res.status(200).send({ nameArray });
   
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/add-bulk-products', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if ( req.user.type === 'admin') {
      const productsData = req.body;

      const errorArr = [];
      let writeData = [];
      let successfullUploads = 0;
      let failedUploads = 0;

      for (let i = 0; i < productsData.length; i += 1) {
        const [
          productName,
          productDescription,
          productPriceStr,
          productStockStr,
          productColors,
          productSizes,
          productImages,
        ] = productsData[i];

        if (!productName) {
          errorArr.push({
            row: i,
            message: 'Name is missing',
          });
        }
        if (!productDescription) {
          errorArr.push({
            row: i,
            message: 'Description is missing',
          });
        }
        if (!productPriceStr) {
          errorArr.push({
            row: i,
            message: 'Price is missing or is negative',
          });
        }
        if (!productStockStr) {
          errorArr.push({
            row: i,
            message: 'Stock is missing',
          });
        }
        if (!productColors) {
          errorArr.push({
            row: i,
            message: 'Color is missing',
          });
        }
        if (!productSizes) {
          errorArr.push({
            row: i,
            message: 'Size is missing',
          });
        }
        if (!productImages) {
          errorArr.push({
            row: i,
            message: 'Image is missing',
          });
        }

        const productPrice = parseInt(productPriceStr, 10);
        const productStock = parseInt(productStockStr, 10);
        

        const isProdValid =
        !!productName &&
        !!productDescription &&
        !!productPrice &&
        !!productStock &&
        !!productColors &&
        !!productSizes &&
        !!productImages;
                
        if (isProdValid) {
          if (productStock < 0) {
            errorArr.push({
              row: i,
              message: 'Product Stock cannot be negative',
            });
          } else if (productPrice < 0) {
            errorArr.push({
              row: i,
              message: 'Product Price cannot be negative',
            });
          } else {
            writeData.push({
              insertOne: {
                document: {
                  title: productName,
                  description: productDescription,
                  price: productPrice,
                  stock: productStock,
                  color: productColors,
                  size: productSizes,
                  images: productImages,
                  thumbnail: productImages,
                },
              },
            });

            successfullUploads++;
          }
        }
        if (writeData.length === 2) {
          await AddBulkProducts(writeData);
          writeData = [];
        }
      }

      if (writeData.length) {
        await AddBulkProducts(writeData);
      }

      failedUploads = productsData?.length - successfullUploads;

      const bulkUploadResult = {
        errorArr,
        successfullUploads,
        failedUploads
      };

      return res.status(200).send({ bulkUploadResult });
      
    } else {
      throw new Error ('Permission not granted');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

router.post('/delete-product', Passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if ( req.user.type === 'admin') {
      const { prodId } = req.body;
      const prod = await DeleteProductById(prodId);
      if (!prod)
        throw new Error('No product found');
      res.status(200).send('Prod Deleted Successflly');
    } else {
      throw new Error ('Permission not granted');
    }
  } catch (err) {
    await catchResponse({
      res,
      err
    });
  }
});

export default router;





