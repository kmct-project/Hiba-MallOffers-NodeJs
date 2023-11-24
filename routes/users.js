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
    console.log("okk", offerShops, "lll")

    res.render("users/home", { admin: false, offerShops, user, cartCount });
  });
});



router.get("/add-complaints", verifySignedIn, function (req, res) {
  let user = req.session.user;
  shopHelper.getAllShops().then((shops) => {
    res.render("users/add-complaints", { shop: false, shops, user });
  });
});

router.post("/add-complaints", function (req, res) {
  let user = req.session.user;
  req.body.name = user.Name;
  req.body.email = user.Email;

  // Assuming userHelper.addfeedback returns a Promise
  const addComplaintPromise = userHelper.addcomplaint(req.body);

  if (addComplaintPromise) {
    addComplaintPromise
      .then(() => {
        shopHelper.getAllShops().then((shops) => {
          res.render("users/add-complaints", { admin: false, shops, user });
        })
      })
      .catch((error) => {
        // Handle any errors that might occur during the promise execution
        console.error(error);
        res.status(500).send("An error occurred");
      });
  } else {
    // Handle the case where addFeedbackPromise is not a Promise
    console.error("addfeedback does not return a Promise.");
    res.status(500).send("An error occurred");
  }
});



router.get("/add-feedback", verifySignedIn, function (req, res) {
  let user = req.session.user;
  shopHelper.getAllShops().then((shops) => {
    res.render("users/add-feedback", { shop: false, shops, user });
  });
});

router.post("/add-feedback", function (req, res) {
  let user = req.session.user;
  req.body.name = user.Name;
  req.body.email = user.Email;

  // Assuming userHelper.addfeedback returns a Promise
  const addFeedbackPromise = userHelper.addfeedback(req.body);

  if (addFeedbackPromise) {
    addFeedbackPromise
      .then(() => {
        shopHelper.getAllShops().then((shops) => {
          res.render("users/add-feedback", { admin: false, shops, user });
        })
      })
      .catch((error) => {
        // Handle any errors that might occur during the promise execution
        console.error(error);
        res.status(500).send("An error occurred");
      });
  } else {
    // Handle the case where addFeedbackPromise is not a Promise
    console.error("addfeedback does not return a Promise.");
    res.status(500).send("An error occurred");
  }
});





router.get("/offers", verifySignedIn, async (req, res) => {
  let user = req.session.user;
  let cartCount = null;
  if (user) {
    let userId = req.session.user._id;
    cartCount = await userHelper.getCartCount(userId);
  }
  shopHelper.getAllShopOffers().then((offerShops) => {
    console.log("okk", offerShops, "lll")
    res.render("users/offers", { admin: false, offerShops, user, cartCount });
  });
});



router.get("/signup", function (req, res) {
  if (req.session.signedIn) {
    res.redirect("/");
  } else {
    res.render("users/signup", { admin: false, layout: "emptylayout" });
  }
});


router.post("/signup", async function (req, res) {
  const mobileRegex = /^[0-9\s-]{10}$/;
  const phone = req.body.phone;
  const password = req.body.Password;
  const email = req.body.Email;
  const name = req.body.Name; // Assuming the name field is named "Name"
  const nameRegex = /^[A-Za-z]+$/; // Regular expression for name validation (letters only)
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i; // Regular expression for email validation

  const passwordCriteria = /^.{6,}$/;

  let isValidMobile = mobileRegex.test(phone);
  let isValidPassword = passwordCriteria.test(password);
  let isValidEmail = emailRegex.test(email);
  let isValidName = nameRegex.test(name);

  if (isValidMobile && isValidPassword && isValidEmail && isValidName) {
    try {
      const response = await userHelper.doSignup(req.body);
      if (response && response._id) {
        req.session.signedIn = true;
        req.session.user = response;
        res.status(200).send("Success"); // Return success message
      } else {
        console.log("User signup response does not contain a valid ID.");
        res.status(400).send("User signup response does not contain a valid ID.");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message); // Return the error message
    }
  } else {
    let errorMessage = "";

    if (!isValidMobile) {
      errorMessage += "Please enter a valid mobile number. ";
    }

    if (!isValidEmail) {
      errorMessage += "Please enter a valid email address. ";
    }

    if (!isValidName) {
      errorMessage += "Please enter a valid name with letters only. ";
    }

    if (!isValidPassword) {
      errorMessage += "Password must be at least 6 characters.";
    }

    res.status(400).send(errorMessage.trim());
  }
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
  res.render("users/booknow", { admin: false, user, price, mobile, product, offerId });
});

router.post("/booknow", async (req, res) => {
  let user = req.session.user;
  let price = 100;
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
  "/view-ordered-products/:id/:shopid",
  verifySignedIn,
  async function (req, res) {
    let user = req.session.user;
    let userId = req.session.user._id;
    // let cartCount = await userHelper.getCartCount(userId);
    let orderId = req.params.id;
    let shopId = req.params.shopid;
    let offers = await userHelper.getOrderProducts(orderId, shopId);
    console.log(offers, "llllio")
    res.render("users/order-products", {
      admin: false,
      user,
      offers,
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
  const result = JSON.parse(req.query.results);

  // let cartCount = await userHelper.getCartCount(userId);
  userHelper.searchOffers(JSON.parse(req.query.results)).then((offers) => {
    const uniqueIds = Array.from(result.map(obj => obj.byid));
    const byName = Array.from(result.map(obj => obj.by));
    const byCat = Array.from(result.map(obj => obj.bycat));

    res.render("users/search-result", {
      admin: false,
      user,
      offers,
      uniqueIds,
      byName,
      byCat
    });
  }).catch((err) => console.log("errrr:", err))
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
