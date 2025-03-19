const SachService = require("../models/sach.model");
const NhaXuatBanService = require("../models/nhaxuatban.model");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/bookcovers");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (ext && mimetype) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Only images with extensions jpeg, jpg, png, or gif are allowed"
      )
    );
  },
}).single("anhBia");

exports.upload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return next(new ApiError(400, err.message));
    }
    if (!req.file) {
      return next(new ApiError(400, "Please upload a file"));
    }
    // Set the file path to be saved in the database
    req.body.anhBia = `/uploads/bookcovers/${req.file.filename}`;
    next();
  });
};

exports.create = async (req, res, next) => {
  if (!req.body?.tenSach) {
    return next(new ApiError(400, "Tên sách is required"));
  }

  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while creating the book"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const sachService = new SachService(MongoDB.client);
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);
    const { tenSach } = req.query;

    if (tenSach) {
      documents = await sachService.findByName(tenSach);
    } else {
      documents = await sachService.find({});
    }

    // Populate publisher information
    const publishers = await nhaXuatBanService.find({});
    const publisherMap = {};
    publishers.forEach((pub) => {
      publisherMap[pub._id.toString()] = pub;
    });

    documents = documents.map((book) => {
      if (book.maNXB && publisherMap[book.maNXB.toString()]) {
        book.nhaXuatBan = publisherMap[book.maNXB.toString()];
      }
      return book;
    });

    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving books"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const nhaXuatBanService = new NhaXuatBanService(MongoDB.client);

    const document = await sachService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Book not found"));
    }

    // Populate publisher information
    if (document.maNXB) {
      const publisher = await nhaXuatBanService.findById(document.maNXB);
      if (publisher) {
        document.nhaXuatBan = publisher;
      }
    }

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving book with id=${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.update(req.params.id, req.body);

    if (!document) {
      return next(new ApiError(404, "Book not found"));
    }

    return res.send({
      message: "Book was updated successfully",
      book: document,
    });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating book with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Book not found"));
    }

    // Delete the book cover image if it exists
    if (document.anhBia) {
      const filePath = path.join(__dirname, "../../", document.anhBia);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return res.send({ message: "Book was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete book with id=${req.params.id}`)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const sachService = new SachService(MongoDB.client);
    const deletedCount = await sachService.deleteAll();

    // Clean up book cover images directory
    const uploadDir = path.join(__dirname, "../../uploads/bookcovers");
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }

    return res.send({
      message: `${deletedCount} books were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all books")
    );
  }
};
