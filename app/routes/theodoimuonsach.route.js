const express = require("express");
const theodoimuonsach = require("../controllers/theodoimuonsach.controller");
const { authJwt } = require("../middlewares");

const router = express.Router();

// Routes for any logged-in user
router.get("/", [authJwt.verifyToken], theodoimuonsach.findAll);
router.get("/:id", [authJwt.verifyToken], theodoimuonsach.findOne);
router.post("/", [authJwt.verifyToken], theodoimuonsach.create);

// Routes requiring admin privileges
router.put("/:id", [authJwt.verifyToken], theodoimuonsach.update);
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  theodoimuonsach.delete
);
router.delete(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  theodoimuonsach.deleteAll
);

module.exports = router;
