const express = require("express");
const nhaxuatban = require("../controllers/nhaxuatban.controller");
const { authJwt } = require("../middlewares");

const router = express.Router();

// Routes for anyone (no auth required)
router.get("/", nhaxuatban.findAll);
router.get("/:id", nhaxuatban.findOne);

// Routes requiring admin privileges
router.post("/", [authJwt.verifyToken, authJwt.isAdmin], nhaxuatban.create);
router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], nhaxuatban.update);
router.delete(
  "/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  nhaxuatban.delete
);
router.delete(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  nhaxuatban.deleteAll
);

module.exports = router;
