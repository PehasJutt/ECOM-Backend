import fs from 'fs';

import { Products } from '../models'; 

const GetSharedProduct = async (id) => {
  const prod = await Products.findById({ _id:id });
  const moreProds = await Products.find()
    .skip(parseInt(0))
    .limit(parseInt(19));
  const products = [prod, ...moreProds];

  return products;
};

const GetProductDetails = async (id) => {
  if (id) return (await Products.findOne({ _id:id }));
  else return (await Products.findOne());
};

const GetProducts = async ({
  skip = 0,
  limit = 20,
  select = '',
  filterArr
}) => {
  const queryObj = {};
  let sortObj = {};

  if (filterArr?.length) {
    for (let filterObj of filterArr) {
      if (filterObj.value) {
        if (filterObj.field === 'sort') {
          switch (filterObj.value) {
          case 1: {
            sortObj = { price: 1 };
            break;
          }
          case 2: {
            sortObj = { price: -1 };
            break;
          }
          case 3: {
            sortObj = { createdOn: -1 };
            break;
          }
          }
        } else if (filterObj.field === 'price') {
          queryObj[filterObj.field] = {
            $gte: filterObj.value.min,
            $lte: filterObj.value.max
          };
        } else if (filterObj.field === 'description') {
          queryObj[filterObj.field] = {
            $regex: filterObj.value,
            $options: 'i'
          }; 
        } else {
          queryObj[filterObj.field] = filterObj.value;
        }
      }
    }
  }
  
  const netCount = await Products.countDocuments(queryObj);
  const products = await Products.find(queryObj)
    .sort(sortObj)
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .select(select);

  return ({
    products: products,
    total: products.length ? products.length : 0,
    netCount,
    skip: skip ? skip : 0,
    limit: limit ? limit : 20
  });
};

const DeleteProductById = async (productId) => {
  const prod = await Products.findById({ _id:productId });
  const images = prod.images.map( img => 
    img.split('/').pop()
  );
  await DeleteProductImages(images);

  return await Products.findByIdAndRemove(productId);
};

const UpdateProductById = async (productId, updateData) => {
  return (await Products.findByIdAndUpdate({ _id:productId }, updateData));
};

const AddProduct = async (productData) => {
  const newProduct = new Products(productData);

  return (await newProduct.save());
};

const AddBulkProducts = async (productArr) => {
  return (await Products.bulkWrite(productArr));
};

const DeleteProductImages = (files) => {
  files.forEach(fileName => {
    const filePath = `public/images/${fileName}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        return ({ err: err });
      } else {
        return ({ err: null });
      }
    });
  });
  
};

export { 
  GetProducts,
  DeleteProductById,
  UpdateProductById,
  AddProduct,
  AddBulkProducts,
  DeleteProductImages,
  GetSharedProduct,
  GetProductDetails
};
  