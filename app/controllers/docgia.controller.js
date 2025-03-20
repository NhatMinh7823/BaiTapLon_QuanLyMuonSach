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

    // Check if email already exists
    const existingReader = await docGiaService.findByEmail(req.body.email);
    if (existingReader) {
      return next(new ApiError(400, "Email already in use"));
    }

    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const document = await docGiaService.create(req.body);

    // Remove password from response
    if (document.password) {
      delete document.password;
    }

    return res.send(document);
  } catch (error) {
    console.error("Error creating reader:", error);
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

    // Remove passwords from response
    documents = documents.map((doc) => {
      const { password, ...docWithoutPassword } = doc;
      return docWithoutPassword;
    });

    return res.send(documents);
  } catch (error) {
    console.error("Error retrieving readers:", error);
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

    // Remove password from response
    if (document.password) {
      delete document.password;
    }

    return res.send(document);
  } catch (error) {
    console.error("Error retrieving reader:", error);
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

    // Check if email is being changed and already exists
    if (req.body.email) {
      const currentUser = await docGiaService.findById(req.params.id);
      if (currentUser && currentUser.email !== req.body.email) {
        const existingUser = await docGiaService.findByEmail(req.body.email);
        if (existingUser) {
          return next(new ApiError(400, "Email already in use"));
        }
      }
    }

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
    console.error("Error updating reader:", error);
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
    console.error("Error deleting reader:", error);
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
    console.error("Error deleting all readers:", error);
    return next(
      new ApiError(500, "An error occurred while removing all readers")
    );
  }
};
