var db = require("../config/connection");
var collections = require("../config/collections");
var bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const objectId = require("mongodb").ObjectID;

module.exports = {
  addShop: (shop, callback) => {
    // console.log(product);
    //product.Price = parseInt(product.Price);
    db.get()
      .collection(collections.SHOP_COLLECTION)
      .insertOne(shop)
      .then((data) => {
        console.log(data);
        callback(data.ops[0]._id);
      });
  },

  getAllShops: () => {
    //console.log("i am in all shop")
    return new Promise(async (resolve, reject) => {
      let shops = await db
        .get()
        .collection(collections.SHOP_COLLECTION)
        .find()
        .toArray();
      resolve(shops);
    });
  },
  getAllShopOffers:()=>{
    return new Promise(async (resolve, reject) => {
      let shops = await db
        .get()
        .collection(collections.SHOP_COLLECTION)
        .find({ isOffer: true })
        .toArray();
      resolve(shops);
    });
  },
  getOfferByIdAndIndex: (shopId, index) => {
    return new Promise(async (resolve, reject) => {
      try {
        const shopCollection = db.get().collection(collections.SHOP_COLLECTION);
  
        // Find the shop by ID
        const shop = await shopCollection.findOne({ _id: objectId(shopId) });
  
        if (shop && shop.offers && shop.offers[index]) {
          // Retrieve the offer at the specified index
          const offer = shop.offers[index];
          resolve(offer);
        } else {
          // Shop or offer at the specified index not found
          resolve(null); // You can choose to handle this case as needed
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  
  editOffers: (shopId, index, updatedOffer) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await db
          .get()
          .collection(collections.SHOP_COLLECTION)
          .updateOne(
            { _id: objectId(shopId) },
            {
              $set: {
                [`offers.${index}`]: updatedOffer
              }
            }
          );
  
        if (result.modifiedCount === 1) {
          // Successfully updated the offer
          resolve({ success: true });
        } else {
          // Offer not found or not updated
          resolve({ success: false, message: "Offer not updated" });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
,  
  doSignup: (shopData) => {
    return new Promise(async (resolve, reject) => {
      if (shopData.Code == "shop123") {
        shopData.Password = await bcrypt.hash(shopData.Password, 10);
        db.get()
          .collection(collections.SHOP_COLLECTION)
          .insertOne(shopData)
          .then((data) => {
            resolve(data.ops[0]);
          });
      } else {
        resolve({ status: false });
      }
    });
  },

  doSignin: (shopData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let shop = await db
        .get()
        .collection(collections.SHOP_COLLECTION)
        .findOne({ emailId: shopData.Email });
      if (shop) {
        bcrypt.compare(shopData.Password, shop.password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.shop = shop;
            response.status = true;
            resolve(response);
          } else {
            console.log("Login Failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("Login Failed");
        resolve({ status: false });
      }
    });
  },
  getShopDetails: (shopName) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SHOP_COLLECTION)
        .findOne({ name: shopName })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getShopOffersDetails:(shopId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SHOP_COLLECTION)
        .findOne({ _id: ObjectId(shopId)})
        .then((response) => {
          resolve(response);
        });
    });
  },
  addOffer: (offer, shopId,offerLength,callback) => {
    offer.price = parseInt(offer.price);
    offer.mrp= parseInt(offer.mrp);
    offer.img_id=shopId+"_"+ offerLength;
    db.get()
      .collection(collections.SHOP_COLLECTION)
      .updateOne(
        { _id: ObjectId(shopId) },
        {
          $set: {
            isOffer:true,
          },
          $push: {
            offers: offer
          }
        }
      )
      .then((data) => {
        console.log(data);
        callback( shopId+"_"+ offerLength )
      });
  },
  getAllBookings: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(orders);
    });
  },
  getAllOfferBookings: (shopId) => {
    return new Promise(async (resolve, reject) => {
      
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({  "orderObject.shopId":shopId})
        .toArray();
        console.log(orders,"offerbooking")
      resolve(orders);
    });
  },

  getProductDetails: (productId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .findOne({ _id: objectId(productId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  deleteOffer: (shopId,Id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SHOP_COLLECTION)
        .updateOne( { _id: ObjectId(shopId) },
        {
          
            $pull: { offers: { img_id: Id } }, // Delete the offer with the specified ID
          
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  deleteAllOffers: (shopId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SHOP_COLLECTION)
        .updateOne(
          { _id: ObjectId(shopId) },
          {
            $set: { 
              isOffer:false,
              offers: [] }, // Set the 'offers' array to an empty array to delete all offers
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  updateOffer: (productId, productDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .updateOne(
          { _id: objectId(productId) },
          {
            $set: {
              Name: productDetails.Name,
              Category: productDetails.Category,
              Price: productDetails.Price,
              Description: productDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },

  deleteAllShops: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.SHOP_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  removeUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then(() => {
          resolve();
        });
    });
  },

  removeAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.USERS_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({})
        .toArray();
      resolve(orders);
    });
  },

  changeStatus: (status, orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": status,
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },

  cancelAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },

  searchProduct: (details) => {
    console.log(details);
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.PRODUCTS_COLLECTION)
        .createIndex({ Name: "text" })
        .then(async () => {
          let result = await db
            .get()
            .collection(collections.PRODUCTS_COLLECTION)
            .find({
              $text: {
                $search: details.search,
              },
            })
            .toArray();
          resolve(result);
        });
    });
  },
};
