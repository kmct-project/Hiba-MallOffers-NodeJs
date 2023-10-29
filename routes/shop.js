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
  let shopName=req.session.shop.name;
  console.log(shopkeeper._id)
  shopHelper.getShopDetails(shopName).then((shopDetails) => {
    res.render("shop/home", { shop: true, layout:"adminlayout",  shopDetails, shopkeeper });
  });
});

router.get("/all-shops", function (req, res) {
  // let shopkeeper = req.session.shop;
  shopHelper.getAllShops().then((shops) => {
    res.render("shop/all-shops", { shop: false, shops });
  });
});

router.get("/details/:name",function(req,res){
  let shopName = req.params.name;

  shopHelper.getShopDetails(shopName).then((shopDetails)=>{
    res.render("shop/shopDetalis",{shopDetails})
  })
})

// router.get("/details/:name",function(req,res){
//   let shopName = req.params.name;

//   shopHelper.getShopDetails(shopName).then((shopDetails)=>{
//     res.render("shop/shopDetalis",{shopDetails})
//   })
// })

router.get("/signup", function (req, res) {
  if (req.session.signedInShop) {
    res.redirect("/shop");
  } else {
    res.render("shop/signup", {
      shop: true, layout:"emptylayout", 
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
      shop: true, layout:"emptylayout", 
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  console.log(req.body)
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
router.get("/offerbookings",async function(req,res){
  let shopkeeper = req.session.shop;
  let orders = await shopHelper.getAllOfferBookings(shopkeeper._id);
  res.render("shop/all-orders", {
    shop: true, layout:"adminlayout", 
    shopkeeper,
    orders,
  });

})
router.get("/add-offers", verifySignedIn, function (req, res) {
  let shopkeeper = req.session.shop;
  res.render("shop/add-offers", { shop: true, layout:"adminlayout",  shopkeeper });
});

router.post("/add-offer", function (req, res) {
  console.log("shoppp",req.session.shop)
  let shopId = req.session.shop._id;
  let offerLength = req.session.shop.offers.length;
  shopHelper.addOffer(req.body,shopId,offerLength,function callback (id){
    let image = req.files.Image;
    image.mv("./public/images/offer-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/shop");
      } else {
        console.log(err);
      }
    });
  });
});


router.get("/delete-offer/:id", verifySignedIn, function (req, res) {
  let offerId = req.session.shop._id;
  let imgId =req.params.id;
  console.log(offerId,"lklk")
  shopHelper.deleteOffer(offerId, imgId).then((response) => {
    fs.unlinkSync("./public/images/offer-images/" + imgId + ".png");
    res.redirect("/shop");
  });
});

router.get("/delete-all-offers",  function (req, res) {
  let shopId = req.session.shop._id;
  shopHelper.deleteAllOffers(shopId).then(() => {
    res.redirect("/shop");
  });
});



router.get("/all-users", verifySignedIn, function (req, res) {
  let shopkeeper = req.session.shop;
  shopHelper.getAllUsers().then((users) => {
    res.render("shop/all-users", { shop: true, layout:"adminlayout",  shopkeeper, users });
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
    shop: true, layout:"adminlayout", 
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
      shop: true, layout:"adminlayout", 
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
    res.render("shop/search-result", { shop: true, layout:"adminlayout",  shopkeeper, response });
  });
});

module.exports = router;
