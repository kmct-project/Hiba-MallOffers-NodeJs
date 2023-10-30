var express = require("express");
var userHelper = require("../helper/userHelper");
var shopHelper = require("../helper/shopHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect("/signin");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    let userId = req.session.user._id;
    cartCount = await userHelper.getCartCount(userId);
  }
  shopHelper.getAllShopOffers().then((offerShops) => {
   console.log("okk",offerShops,"lll")

    res.render("users/home", { admin: false, offerShops, user, cartCount });
  });
});



router.get("/offers", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    let userId = req.session.user._id;
    cartCount = await userHelper.getCartCount(userId);
  }
  shopHelper.getAllShopOffers().then((offerShops) => {
    console.log("okk",offerShops,"lll")
     res.render("users/offers", { admin: false, offerShops, user, cartCount });
   });});



router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/");
  } else {
    res.render("users/signup", { admin: false, layout: "emptylayout" });
  }
});

router.post("/signup", function (req, res) {
  userHelper.doSignup(req.body).then((response) => {
    req.session.signedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});

router.get("/shopOffersDetalis/:id", verifySignedIn, function (req, res) {
  let shopId = req.params.id;

  shopHelper.getShopOffersDetails(shopId).then((offerDetails) => {
    res.render("users/shopOffersDetalis", { offerDetails });
  });
});

router.get("/booknow/:id", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let offerId = req.params.id;
  var parts = offerId.split('_'); // Split the string by underscore
  // var offerId = parts[0]; 
  var price = req.query.price;
  var product = req.query.product;
  var mobile = req.query.mobile;
  console.log(user, offerId);
  // let cartCount = await userHelper.getCartCount(userId);
  // let total = await userHelper.getTotalAmount(userId);
  res.render("users/booknow", { admin: false, user,price, mobile,product,offerId});
});

router.post("/booknow", async (req, res) => {
  let user = req.session.user;
  let price =100;
  userHelper
  .placeBooking(req.body, price, user)
  .then((orderId) => {
    if (req.body["payment-method"] === "COD") {
      res.json({ codSuccess: true });
    } else {
      userHelper.generateRazorpay(orderId, price).then((response) => {
        res.json(response);
      });
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/");
  } else {
    res.render("users/signin", {
      admin: false,
      layout: "emptylayout",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  userHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedIn = false;
  req.session.user = null;
  res.redirect("/");
});

router.get("/cart", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let cartProducts = await userHelper.getCartProducts(userId);
  let total = null;
  if (cartCount != 0) {
    total = await userHelper.getTotalAmount(userId);
  }
  res.render("users/cart", {
    admin: false,
    user,
    cartCount,
    cartProducts,
    total,
  });
});

router.get("/add-to-cart/:id", function (req, res) {
  console.log("api call");
  let productId = req.params.id;
  let userId = req.session.user._id;
  userHelper.addToCart(productId, userId).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", function (req, res) {
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then((response) => {
    res.json(response);
  });
});

router.post("/remove-cart-product", (req, res, next) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/place-order", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let total = await userHelper.getTotalAmount(userId);
  res.render("users/place-order", { admin: false, user, cartCount, total });
});

router.post("/place-order", async (req, res) => {
  let user = req.session.user;
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  userHelper
    .placeOrder(req.body, products, totalPrice, user)
    .then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }
    });
});

router.post("/verify-payment", async (req, res) => {
  console.log(req.body);
  userHelper
    .verifyPayment(req.body)
    .then(() => {
      userHelper.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      res.json({ status: false, errMsg: "Payment Failed" });
    });
});

router.get("/order-placed", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  res.render("users/order-placed", { admin: false, user, cartCount });
});

router.get("/orders", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  let cartCount = await userHelper.getCartCount(userId);
  let orders = await userHelper.getUserOrder(userId);
  res.render("users/orders", { admin: false, user, cartCount, orders });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let user = req.session.user;
    let userId = req.session.user._id;
    let cartCount = await userHelper.getCartCount(userId);
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("users/order-products", {
      admin: false,
      user,
      cartCount,
      products,
    });
  }
);

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  userHelper.cancelOrder(orderId).then(() => {
    res.redirect("/orders");
  });
});

router.get("/search", verifySignedIn, async function (req, res) {
  let user = req.session.user;
  let userId = req.session.user._id;
  const result=JSON.parse(req.query.results);

 // let cartCount = await userHelper.getCartCount(userId);
  userHelper.searchOffers(JSON.parse(req.query.results)).then((offers) => {
    const uniqueIds = Array.from(new Set(result.map(obj => obj.byid)));
    const byName=Array.from(new Set(result.map(obj => obj.by)));
 
    res.render("users/search-result", {
      admin: false,
      user,
      offers,
      uniqueIds,
      byName
    });
  }).catch((err)=>console.log("errrr:",err))
});
// router.post("/search", verifySignedIn, async function (req, res) {
//   let user = req.session.user;
//   let userId = req.session.user._id;
//   console.log(req.body)
//  // let cartCount = await userHelper.getCartCount(userId);
//   userHelper.searchProduct(req.body).then((response) => {
//     res.render("users/search-result", {
//       admin: false,
//       user,
//       response,
//     });
//   });
// });

module.exports = router;
