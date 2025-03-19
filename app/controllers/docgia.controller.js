const DocGiaService = require("../models/docgia.model");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");

exports.create = async (req, res, next) => {
  if (!req.body?.hoLot || !req.body?.ten || !req.body?.email) {
    return next(new ApiError(400, "Name and email are required"));
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);

    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const document = await docGiaService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the reader")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const { name } = req.query;

    if (name) {
      documents = await docGiaService.findByName(name);
    } else {
      documents = await docGiaService.find({});
    }

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving readers")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.findById(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Reader not found"));
    }

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving reader with id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);

    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const document = await docGiaService.update(req.params.id, req.body);

    if (!document) {
      return next(new ApiError(404, "Reader not found"));
    }

    return res.send({ message: "Reader was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating reader with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const document = await docGiaService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Reader not found"));
    }

    return res.send({ message: "Reader was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete reader with id=${req.params.id}`)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const deletedCount = await docGiaService.deleteAll();

    return res.send({
      message: `${deletedCount} readers were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all readers")
    );
  }
};
