const express = require("express");
const sach = require("../controllers/sach.controller");
const { authJwt } = require("../middlewares");

const router = express.Router();

// Routes for anyone (no auth required)
router.get("/", sach.findAll);
router.get("/:id", sach.findOne);

// Routes requiring admin privileges
router.post(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  sach.upload,
  sach.create
);
router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], sach.update);
router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], sach.delete);
router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], sach.deleteAll);

module.exports = router;
