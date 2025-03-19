const NhanVienService = require("../models/nhanvien.model");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcryptjs");

exports.create = async (req, res, next) => {
  if (!req.body?.hoTenNV || !req.body?.email) {
    return next(new ApiError(400, "Name and email are required"));
  }

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);

    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const document = await nhanVienService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the staff member")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const { name } = req.query;

    if (name) {
      documents = await nhanVienService.findByName(name);
    } else {
      documents = await nhanVienService.find({});
    }

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving staff members")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.findById(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Staff member not found"));
    }

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving staff member with id=${req.params.id}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const nhanVienService = new NhanVienService(MongoDB.client);

    // Hash password if provided
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const document = await nhanVienService.update(req.params.id, req.body);

    if (!document) {
      return next(new ApiError(404, "Staff member not found"));
    }

    return res.send({ message: "Staff member was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating staff member with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const document = await nhanVienService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Staff member not found"));
    }

    return res.send({ message: "Staff member was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete staff member with id=${req.params.id}`
      )
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService(MongoDB.client);
    const deletedCount = await nhanVienService.deleteAll();

    return res.send({
      message: `${deletedCount} staff members were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all staff members")
    );
  }
};
