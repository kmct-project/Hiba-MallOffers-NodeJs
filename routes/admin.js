var express = require("express");
var adminHelper = require("../helper/adminHelper");
var fs = require("fs");
const userHelper = require("../helper/userHelper");
const shopHelper = require("../helper/shopHelper");
var router = express.Router();

const verifySignedIn = (req, res, next) => {
  if (req.session.signedInAdmin) {
    next();
  } else {
    res.redirect("/admin/signin");
  }
};

/* GET admins listing. */
router.get("/", verifySignedIn, function (req, res, next) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/home", { admin: true, layout: "adminlayout", products, administator });
  });
});

router.get("/all-products", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllProducts().then((products) => {
    res.render("admin/all-products", { admin: true, layout: "adminlayout", products, administator });
  });
});

router.get("/signup", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signup", {
      admin: true, layout: "emptylayout",
      signUpErr: req.session.signUpErr,
    });
  }
});


///////ALL feedback/////////////////////                                         
router.get("/all-feedbacks", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  userHelper.getAllfeedbacks().then((feedbacks) => {
    res.render("admin/all-feedbacks", { admin: true, layout: "adminlayout", feedbacks, administator });
  });
});

///////DELETE FeedBack/////////////////////                                         
router.get("/delete-feedback/:id", verifySignedIn, function (req, res) {
  let feedbackId = req.params.id;
  userHelper.deletefeedback(feedbackId).then((response) => {
    res.redirect("/admin/all-feedbacks");
  });
});

///////DELETE ALL FeedBack/////////////////////                                         
router.get("/delete-all-feedbacks", verifySignedIn, function (req, res) {
  userHelper.deleteAllfeedbacks().then(() => {
    res.redirect("/admin/all-feedbacks");
  });
});




///////ALL complaint/////////////////////                                         
router.get("/all-complaints", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  userHelper.getAllcomplaints().then((complaints) => {
    res.render("admin/all-complaints", { admin: true, layout: "adminlayout", complaints, administator });
  });
});

router.get("/complaints-reply", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  let cmpId=req.query.id;
  adminHelper.getcomplaintReply(cmpId).then((complaint) => {
    res.render("admin/cmp-reply", { admin: true, layout: "adminlayout", complaint, administator });
  });
}); 
router.post("/add-reply",(req,res)=>{
  let cmpId=req.query.id;
  console.log("ree",cmpId,req.body.reply)
  adminHelper.complaintReply(cmpId,req.body.reply).then((complaint) => {
    res.redirect("/admin/all-complaints")
  });

})
///////DELETE complaint/////////////////////                                         
router.get("/delete-complaint/:id", verifySignedIn, function (req, res) {
  let complaintId = req.params.id;
  userHelper.deletecomplaint(complaintId).then((response) => {
    res.redirect("/admin/all-complaints");
  });
});

///////DELETE ALL complaint/////////////////////                                         
router.get("/delete-all-complaints", verifySignedIn, function (req, res) {
  userHelper.deleteAllcomplaints().then(() => {
    res.redirect("/admin/all-complaints");
  });
});


router.post("/signup", function (req, res) {
  adminHelper.doSignup(req.body).then((response) => {
    console.log(response);
    if (response.status == false) {
      req.session.signUpErr = "Invalid Admin Code";
      res.redirect("/admin/signup");
    } else {
      req.session.signedInAdmin = true;
      req.session.admin = response;
      res.redirect("/admin");
    }
  });
});

router.get("/signin", function (req, res) {
  if (req.session.signedInAdmin) {
    res.redirect("/admin");
  } else {
    res.render("admin/signin", {
      admin: true, layout: "emptylayout",
      signInErr: req.session.signInErr,
    });
    req.session.signInErr = null;
  }
});

router.post("/signin", function (req, res) {
  adminHelper.doSignin(req.body).then((response) => {
    if (response.status) {
      req.session.signedInAdmin = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.signInErr = "Invalid Email/Password";
      res.redirect("/admin/signin");
    }
  });
});

router.get("/signout", function (req, res) {
  req.session.signedInAdmin = false;
  req.session.admin = null;
  res.redirect("/admin");
});

router.get("/add-product", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-product", { admin: true, layout: "adminlayout", administator });
});

router.get("/all-categories", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllcategories().then((categories) => {
    res.render("admin/all-categories", { admin: true, layout: "adminlayout", administator, categories });
  });
});

// router.get("/all-offers", verifySignedIn, function (req, res) {
//   let administator = req.session.admin;
//     res.render("admin/all-offers", { admin: true,layout:"adminlayout" , administator });
//   });


router.get("/add-category", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  res.render("admin/add-category", { admin: true, layout: "adminlayout", administator });
});

router.post("/add-category", function (req, res) {
  let administator = req.session.admin;
  adminHelper.addCategory(req.body).then(() => {
    res.render("admin/add-category", { admin: true, layout: "adminlayout", administator })
  })
})

router.post("/add-product", function (req, res) {
  adminHelper.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/images/product-images/" + id + ".png", (err, done) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/:id", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let productId = req.params.id;
  let product = await adminHelper.getProductDetails(productId);
  console.log(product);
  res.render("admin/edit-product", { admin: true, layout: "adminlayout", product, administator });
});

router.post("/edit-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.updateProduct(productId, req.body).then(() => {
    if (req.files) {
      let image = req.files.Image;
      if (image) {
        image.mv("./public/images/product-images/" + productId + ".png");
      }
    }
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-product/:id", verifySignedIn, function (req, res) {
  let productId = req.params.id;
  adminHelper.deleteProduct(productId).then((response) => {
    fs.unlinkSync("./public/images/product-images/" + productId + ".png");
    res.redirect("/admin/all-products");
  });
});

router.get("/delete-all-products", verifySignedIn, function (req, res) {
  adminHelper.deleteAllProducts().then(() => {
    res.redirect("/admin/all-products");
  });
});

router.get("/all-users", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.getAllUsers().then((users) => {
    res.render("admin/all-users", { admin: true, layout: "adminlayout", administator, users });
  });
});

router.get("/all-shops", function (req, res) {
  // let shopkeeper = req.session.shop;
  let administator = req.session.admin;
  shopHelper.getAllShops().then((shops) => {
    res.render("admin/all-shops", { admin: true, layout: "adminlayout", shops, administator });
  });
});

router.get("/all-offers", function (req, res) {
  // let shopkeeper = req.session.shop;
  let administator = req.session.admin;
  shopHelper.getAllShopOffers().then((offerShops) => {
    res.render("admin/all-offers", { admin: true, layout: "adminlayout", offerShops, administator });
  });
});


router.get("/delete-offer/:id/:img_id", verifySignedIn, function (req, res) {
  let shopId = req.params.id;
  let offerId = req.params.img_id;
  console.log(offerId, "lklk")
  adminHelper.deleteOffer( shopId,offerId).then((response) => {
    try {
      fs.unlinkSync("./public/images/offer-images/" + offerId + ".png");
      res.redirect("/admin/all-offers");
      console.log("File deleted successfully");
    } catch (error) {
      console.error("Error deleting file:", error.message);
      res.redirect("/admin/all-offers");
    }
   
  });
});


router.get("/remove-user/:id", verifySignedIn, function (req, res) {
  let userId = req.params.id;
  adminHelper.removeUser(userId).then(() => {
    res.redirect("/admin/all-users");
  });
});
router.get("/remove-feedback/:id", verifySignedIn, function (req, res) {
  let Id = req.params.id;
  adminHelper.removeFeedback(Id).then(() => {
    res.redirect("/admin/all-feedbacks");
  });
});



router.get("/remove-all-users", verifySignedIn, function (req, res) {
  adminHelper.removeAllUsers().then(() => {
    res.redirect("/admin/all-users");
  });
});

router.get("/all-orders", verifySignedIn, async function (req, res) {
  let administator = req.session.admin;
  let orders = await adminHelper.getAllOrders();
  res.render("shop/all-orders", {
    admin: true, layout: "adminlayout",
    administator,
    orders,
  });
});

router.get(
  "/view-ordered-products/:id",
  verifySignedIn,
  async function (req, res) {
    let administator = req.session.admin;
    let orderId = req.params.id;
    let products = await userHelper.getOrderProducts(orderId);
    res.render("admin/order-products", {
      admin: true, layout: "adminlayout",
      administator,
      products,
    });
  }
);

router.get("/change-status/", verifySignedIn, function (req, res) {
  let status = req.query.status;
  let orderId = req.query.orderId;
  adminHelper.changeStatus(status, orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-order/:id", verifySignedIn, function (req, res) {
  let orderId = req.params.id;
  adminHelper.cancelOrder(orderId).then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.get("/cancel-all-orders", verifySignedIn, function (req, res) {
  adminHelper.cancelAllOrders().then(() => {
    res.redirect("/admin/all-orders");
  });
});

router.post("/search", verifySignedIn, function (req, res) {
  let administator = req.session.admin;
  adminHelper.searchProduct(req.body).then((response) => {
    res.render("admin/search-result", { admin: true, layout: "adminlayout", administator, response });
  });
});


module.exports = router;
