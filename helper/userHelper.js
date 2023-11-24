var db = require("../config/connection");
var collections = require("../config/collections");
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectID;
const ObjectId = require("mongodb").ObjectId;
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_8NokNgt8cA3Hdv",
  key_secret: "xPzG53EXxT8PKr34qT7CTFm9",
});

module.exports = {


  ///////ADD FeedBack/////////////////////                                         
  addfeedback: (feedback) => {
    return new Promise(async (resolve, reject) => {
      console.log(feedback);
      await db.get()
        .collection(collections.FEEDBACK_COLLECTION)
        .insertOne(feedback)
        .then((data) => {
          //console.log(data);
          resolve()
        });
    })
  },

  ///////GET ALL FeedBack/////////////////////                                            
  getAllfeedbacks: () => {
    return new Promise(async (resolve, reject) => {
      let feedbacks = await db
        .get()
        .collection(collections.FEEDBACK_COLLECTION)
        .find()
        .toArray();
      resolve(feedbacks);
    });
  },

  ///////ADD FeedBack DETAILS/////////////////////                                            
  getfeedbackDetails: (feedbackId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FEEDBACK_COLLECTION)
        .findOne({
          _id: objectId(feedbackId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE FeedBack/////////////////////                                            
  deletefeedback: (feedbackId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FEEDBACK_COLLECTION)
        .removeOne({
          _id: objectId(feedbackId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE FeedBack/////////////////////                                            
  updatefeedback: (feedbackId, feedbackDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FEEDBACK_COLLECTION)
        .updateOne(
          {
            _id: objectId(feedbackId)
          },
          {
            $set: {
              Name: feedbackDetails.Name,
              Category: feedbackDetails.Category,
              Price: feedbackDetails.Price,
              Description: feedbackDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL FeedBack/////////////////////                                            
  deleteAllfeedbacks: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.FEEDBACK_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },





  ///////ADD complaint/////////////////////                                         
  addcomplaint: (complaint) => {
    return new Promise(async (resolve, reject) => {
      console.log(complaint);
      await db.get()
        .collection(collections.COMPLAINT_COLLECTION)
        .insertOne(complaint)
        .then((data) => {
          //console.log(data);
          resolve()
        });
    })
  },

  ///////GET ALL complaint/////////////////////                                            
  getAllcomplaints: () => {
    return new Promise(async (resolve, reject) => {
      let complaints = await db
        .get()
        .collection(collections.COMPLAINT_COLLECTION)
        .find()
        .toArray();
      resolve(complaints);
    });
  },

  ///////ADD complaint DETAILS/////////////////////                                            
  getcomplaintDetails: (complaintId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMPLAINT_COLLECTION)
        .findOne({
          _id: objectId(complaintId)
        })
        .then((response) => {
          resolve(response);
        });
    });
  },

  ///////DELETE complaint/////////////////////                                            
  deletecomplaint: (complaintId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMPLAINT_COLLECTION)
        .removeOne({
          _id: objectId(complaintId)
        })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  ///////UPDATE complaint/////////////////////                                            
  updatecomplaint: (complaintId, complaintDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMPLAINT_COLLECTION)
        .updateOne(
          {
            _id: objectId(complaintId)
          },
          {
            $set: {
              Name: complaintDetails.Name,
              Category: complaintDetails.Category,
              Price: complaintDetails.Price,
              Description: complaintDetails.Description,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },


  ///////DELETE ALL complaint/////////////////////                                            
  deleteAllcomplaints: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.COMPLAINT_COLLECTION)
        .remove({})
        .then(() => {
          resolve();
        });
    });
  },



  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collections.PRODUCTS_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },

  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collections.USERS_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          resolve(data.ops[0]);
        });
    });
  },

  doSignin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collections.USERS_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user;
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

  addToCart: (productId, userId) => {
    console.log(userId);
    let productObject = {
      item: objectId(productId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (userCart) {
        let productExist = userCart.products.findIndex(
          (products) => products.item == productId
        );
        console.log(productExist);
        if (productExist != -1) {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(productId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collections.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: productObject },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObject = {
          user: objectId(userId),
          products: [productObject],
        };
        db.get()
          .collection(collections.CART_COLLECTION)
          .insertOne(cartObject)
          .then((response) => {
            resolve();
          });
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      // console.log(cartItems);
      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        var sumQuantity = 0;
        for (let i = 0; i < cart.products.length; i++) {
          sumQuantity += cart.products[i].quantity;
        }
        count = sumQuantity;
      }
      resolve(count);
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            { _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collections.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(details.cart),
              "products.item": objectId(details.product),
            },
            {
              $inc: { "products.$.quantity": details.count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },

  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.CART_COLLECTION)
        .updateOne(
          { _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } },
          }
        )
        .then(() => {
          resolve({ status: true });
        });
    });
  },

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: objectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collections.PRODUCTS_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.Price"] } },
            },
          },
        ])
        .toArray();
      console.log(total[0].total);
      resolve(total[0].total);
    });
  },

  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collections.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      resolve(cart.products);
    });
  },

  placeBooking: (order, total, user) => {
    //req.body, price, user
    return new Promise(async (resolve, reject) => {
      // console.log(order, product,"from bokkinggggg");
      let status = order["payment-method"] === "ONLINE" ? "placed" : "pending";
      let orderObject = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: objectId(order.userId),
        user: user,
        paymentMethod: order["payment-method"],
        products: order.product,
        offerId: order.productId,
        shopId: order.productId.split('_')[0],
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .insertOne({ orderObject })
        .then((response) => {
          // db.get()
          //   .collection(collections.CART_COLLECTION)
          //   .removeOne({ user: objectId(order.userId) });
          resolve(response.ops[0]._id);
        });
    });
  },
  placeOrder: (order, products, total, user) => {
    return new Promise(async (resolve, reject) => {
      console.log(order, products, total);
      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let orderObject = {
        deliveryDetails: {
          mobile: order.mobile,
          address: order.address,
          pincode: order.pincode,
        },
        userId: objectId(order.userId),
        user: user,
        paymentMethod: order["payment-method"],
        products: products,
        totalAmount: total,
        status: status,
        date: new Date(),
      };
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .insertOne({ orderObject })
        .then((response) => {
          db.get()
            .collection(collections.CART_COLLECTION)
            .removeOne({ user: objectId(order.userId) });
          resolve(response.ops[0]._id);
        });
    });
  },

  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collections.ORDER_COLLECTION)
        .find({ "orderObject.userId": objectId(userId) })
        .toArray();
      // console.log(orders);
      resolve(orders);
    });
  },
  getOrderProducts: (orderId, shopId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const shopCollection = db.get().collection(collections.SHOP_COLLECTION);

        const products = await shopCollection
          .aggregate([
            { $match: { _id: objectId(shopId) } },
            { $unwind: "$offers" }, // Unwind the offers array
            {
              $match: {
                "offers.img_id": orderId,
              },
            },
            {
              $project: {
                _id: 0, // Exclude _id field
                offers: 1, // Include only the offers field
              },
            },
          ])
          .toArray();

        if (products && products.length > 0) {
          resolve(products[0].offers); // Assuming there's only one match
        } else {
          resolve([]); // Return an empty array if no match is found
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  // getOrderProducts: (orderId,shopId) => {
  //   return new Promise(async (resolve, reject) => {

  //     let products = await db
  //       .get()
  //       .collection(collections.SHOP_COLLECTION)
  //       .aggregate([
  //         {
  //           $match: { _id: objectId(shopId) },
  //         },
  //         {
  //           $unwind: "$orderObject.products",
  //         },
  //         {
  //           $project: {
  //             item: "$orderObject.products.item",
  //             quantity: "$orderObject.products.quantity",
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: collections.PRODUCTS_COLLECTION,
  //             localField: "item",
  //             foreignField: "_id",
  //             as: "product",
  //           },
  //         },
  //         {
  //           $project: {
  //             item: 1,
  //             quantity: 1,
  //             product: { $arrayElemAt: ["$product", 0] },
  //           },
  //         },
  //       ])
  //       .toArray();
  //     resolve(products);
  //   });
  // },

  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        console.log("New Order : ", order);
        resolve(order);
      });
    });
  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "xPzG53EXxT8PKr34qT7CTFm9");

      hmac.update(
        details["payment[razorpay_order_id]"] +
        "|" +
        details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");

      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .updateOne(
          { _id: objectId(orderId) },
          {
            $set: {
              "orderObject.status": "placed",
            },
          }
        )
        .then(() => {
          resolve();
        });
    });
  },

  cancelOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collections.ORDER_COLLECTION)
        .removeOne({ _id: objectId(orderId) })
        .then(() => {
          resolve();
        });
    });
  },
  searchOffers: (results) => {
    return new Promise(async (resolve, reject) => {
      // Check if queryResults is empty
      if (results.length === 0) {
        resolve([]); // Resolve with an empty array
      } else {
        // Extract an array of unique byid values from the queryResults
        const uniqueByids = Array.from(new Set(results.map(obj => obj.byid)));

        // Extract an array of unique id values from the results
        const uniqueIds = Array.from(new Set(results.map(obj => obj.id)));

        // Use aggregation to match and retrieve the desired offers
        db.get().collection(collections.SHOP_COLLECTION).aggregate([
          {
            $match: {
              _id: { $in: uniqueByids.map(byid => ObjectId(byid)) } // Match based on _id and byid
            },
          },
          {
            $unwind: "$offers" // Unwind the offers array
          },
          {
            $match: {
              "offers.img_id": { $in: uniqueIds } // Match based on img_id and id
            },
          },
          {
            $project: {
              _id: 0, // Exclude _id field
              offers: 1, // Include offers field
            },
          },
          {
            $replaceRoot: {
              newRoot: "$offers"
            }
          }
        ]).toArray((err, result) => {
          if (err) {
            reject(err); // Reject the promise in case of an error
          } else {
            resolve(result); // Resolve the promise with the matching offers
          }
        });
      }
    });
  }
  ,

  searchProduct: (details) => {
    console.log(details);
    return new Promise(async (resolve, reject) => {
      const collection = db.get().collection(collections.SHOP_COLLECTION);
      const indexName = "offers.name_text"; // You can specify the desired index name

      // Check if the index already exists
      // const indexExists = await collection.indexExists(indexName);

      // if (!indexExists) {
      //   // Create the index if it doesn't exist
      //   await collection.createIndex({ "offers.name": "text" }, { name: indexName });
      // }

      let result = await collection
        .find({
          "isOffer": true,
          "offers.name": details.search,
        })
        .toArray();

      if (result.length > 0) {
        resolve(result[0].offers.find(offer => offer.name === details.search));
      } else {
        resolve(null);
      }
    });
  }



};
