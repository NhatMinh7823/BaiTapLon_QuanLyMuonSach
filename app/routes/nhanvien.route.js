const express = require("express");
const nhanvien = require("../controllers/nhanvien.controller");
const { authJwt } = require("../middlewares");

const router = express.Router();

// All routes require admin privileges
router.get("/", [authJwt.verifyToken, authJwt.isAdmin], nhanvien.findAll);
router.get("/:id", [authJwt.verifyToken, authJwt.isAdmin], nhanvien.findOne);
router.post("/", [authJwt.verifyToken, authJwt.isAdmin], nhanvien.create);
router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], nhanvien.update);
router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], nhanvien.delete);
router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], nhanvien.deleteAll);

module.exports = router;
