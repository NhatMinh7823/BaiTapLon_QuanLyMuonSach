const TheoDoiMuonSachService = require("../models/theodoimuonsach.model");
const SachService = require("../models/sach.model");
const DocGiaService = require("../models/docgia.model");
const NhanVienService = require("../models/nhanvien.model");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  if (!req.body?.maDocGia || !req.body?.maSach) {
    return next(new ApiError(400, "Reader ID and Book ID are required"));
  }

  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const sachService = new SachService(MongoDB.client);
    const docGiaService = new DocGiaService(MongoDB.client);

    // Check if book exists
    const book = await sachService.findById(req.body.maSach);
    if (!book) {
      return next(new ApiError(404, "Book not found"));
    }

    // Check if reader exists
    const reader = await docGiaService.findById(req.body.maDocGia);
    if (!reader) {
      return next(new ApiError(404, "Reader not found"));
    }

    // Create borrow request
    const document = await theoDoiMuonSachService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the borrow request")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const sachService = new SachService(MongoDB.client);
    const docGiaService = new DocGiaService(MongoDB.client);
    const nhanVienService = new NhanVienService(MongoDB.client);

    const { maDocGia, maSach, trangThai } = req.query;
    let filter = {};

    if (maDocGia) {
      filter.maDocGia = maDocGia;
    }

    if (maSach) {
      filter.maSach = maSach;
    }

    if (trangThai) {
      filter.trangThai = trangThai;
    }

    documents = await theoDoiMuonSachService.find(filter);

    // Get all books and readers for populating data
    const books = await sachService.find({});
    const readers = await docGiaService.find({});
    const staff = await nhanVienService.find({});

    // Create maps for quick lookup
    const bookMap = {};
    books.forEach((book) => {
      bookMap[book._id.toString()] = book;
    });

    const readerMap = {};
    readers.forEach((reader) => {
      readerMap[reader._id.toString()] = reader;
    });

    const staffMap = {};
    staff.forEach((s) => {
      staffMap[s._id.toString()] = s;
    });

    // Populate the documents with related data
    documents = documents.map((doc) => {
      const populatedDoc = { ...doc };

      if (doc.maSach && bookMap[doc.maSach.toString()]) {
        populatedDoc.sach = bookMap[doc.maSach.toString()];
      }

      if (doc.maDocGia && readerMap[doc.maDocGia.toString()]) {
        populatedDoc.docGia = readerMap[doc.maDocGia.toString()];
      }

      if (doc.maNhanVienDuyet && staffMap[doc.maNhanVienDuyet.toString()]) {
        populatedDoc.nhanVien = staffMap[doc.maNhanVienDuyet.toString()];
      }

      return populatedDoc;
    });

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving borrow records")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const sachService = new SachService(MongoDB.client);
    const docGiaService = new DocGiaService(MongoDB.client);
    const nhanVienService = new NhanVienService(MongoDB.client);

    const document = await theoDoiMuonSachService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Borrow record not found"));
    }

    // Populate with related data
    if (document.maSach) {
      document.sach = await sachService.findById(document.maSach);
    }

    if (document.maDocGia) {
      document.docGia = await docGiaService.findById(document.maDocGia);
    }

    if (document.maNhanVienDuyet) {
      document.nhanVien = await nhanVienService.findById(
        document.maNhanVienDuyet
      );
    }

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving borrow record with id=${req.params.id}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.update(
      req.params.id,
      req.body
    );

    if (!document) {
      return next(new ApiError(404, "Borrow record not found"));
    }

    return res.send({ message: "Borrow record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating borrow record with id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const document = await theoDoiMuonSachService.delete(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Borrow record not found"));
    }

    return res.send({ message: "Borrow record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete borrow record with id=${req.params.id}`
      )
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const theoDoiMuonSachService = new TheoDoiMuonSachService(MongoDB.client);
    const deletedCount = await theoDoiMuonSachService.deleteAll();

    return res.send({
      message: `${deletedCount} borrow records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all borrow records")
    );
  }
};
