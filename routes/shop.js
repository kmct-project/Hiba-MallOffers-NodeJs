var express = require("express");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
const shopHelper = require("../helper/shopHelper");

var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInShop) {
    next();
  } else {
    res.redirect("/shop/signin");
  }
};

/* GET shops listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let shopkeeper = req.session.shop;
  shopHelper.getAllProducts().then((products) => {
    res.render("shop/home", { shop: true, products, shopkeeper });
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let shopkeeper = req.session.shop;
  shopHelper.getAllProducts().then((products) => {
    res.render("shop/all-products", { shop: true, products, shopkeeper });
  });
});

router.get("/signup", function (req, res) {
  if (req.session.signedInShop) {
    res.redirect("/shop");
  } else {
    res.render("shop/signup", {
      shop: true,
      signUpErr: req.session.signUpErr,
    });
  }
});

router.post("/signup", function (req, res) {
  shopHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Code";
      res.redirect("/shop/signup");
    } else {
      req.session.signedInShop = true;
      req.session.shop = response;
      res.redirect("/shop");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInShop) {
    res.redirect("/shop");
  } else {
    res.render("shop/signin", {
      shop: true,
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  shopHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInShop = true;
      req.session.shop = response.shop;
      res.redirect("/shop");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/shop/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInShop = false;
  req.session.shop = null;
  res.redirect("/shop");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let shopkeeper = req.session.shop;
  res.render("shop/add-product", { shop: true, shopkeeper });
});

router.post("/add-product", function (req, res) {
  shopHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/shop/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let shopkeeper = req.session.shop;
  let productId = req.params.id;
  let product = await shopHelper.getProductDetails(productId);
  console.log(product);
  res.render("shop/edit-product", { shop: true, product, shopkeeper });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  shopHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/shop/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  shopHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/shop/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  shopHelper.deleteAllProducts().then(() => {
    res.redirect("/shop/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let shopkeeper = req.session.shop;
  shopHelper.getAllUsers().then((users) => {
    res.render("shop/all-users", { shop: true, shopkeeper, users });
  });
});

router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  shopHelper.removeUser(userId).then(() => {
    res.redirect("/shop/all-users");
  });
});

router.get("/remove-all-users", verifySignedIn, function (req, res) {
  shopHelper.removeAllUsers().then(() => {
    res.redirect("/shop/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let shopkeeper = req.session.shop;
  let orders = await shopHelper.getAllOrders();
  res.render("shop/all-orders", {
    shop: true,
    shopkeeper,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let shopkeeper = req.session.shop;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("shop/order-products", {
      shop: true,
      shopkeeper,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  shopHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/shop/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  shopHelper.cancelOrder(orderId).then(() => {
    res.redirect("/shop/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  shopHelper.cancelAllOrders().then(() => {
    res.redirect("/shop/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let shopkeeper = req.session.shop;
  shopHelper.searchProduct(req.body).then((response) => {
    res.render("shop/search-result", { shop: true, shopkeeper, response });
  });
});

module.exports = router;
