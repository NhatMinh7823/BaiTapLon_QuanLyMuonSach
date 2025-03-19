const express = require("express");
const docgia = require("../controllers/docgia.controller");
const { authJwt } = require("../middlewares");

const router = express.Router();

// Routes requiring admin privileges
router.get("/", [authJwt.verifyToken, authJwt.isAdmin], docgia.findAll);
router.get("/:id", [authJwt.verifyToken], docgia.findOne);
router.post("/", [authJwt.verifyToken, authJwt.isAdmin], docgia.create);
router.put("/:id", [authJwt.verifyToken, authJwt.isAdmin], docgia.update);
router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], docgia.delete);
router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], docgia.deleteAll);

module.exports = router;
