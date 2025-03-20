const { ObjectId } = require("mongodb");

class TheoDoiMuonSachService {
  constructor(client) {
    this.TheoDoiMuonSach = client.db().collection("theodoimuonsach");
  }

  extractTheoDoiMuonSachData(payload) {
    const theodoimuonsach = {
      maDocGia: payload.maDocGia ? new ObjectId(payload.maDocGia) : null,
      maSach: payload.maSach ? new ObjectId(payload.maSach) : null,
      ngayMuon: payload.ngayMuon ? new Date(payload.ngayMuon) : new Date(),
      ngayTra: payload.ngayTra ? new Date(payload.ngayTra) : null,
      trangThai: payload.trangThai || "pending", // pending, approved, rejected, returned
      maNhanVienDuyet: payload.maNhanVienDuyet
        ? new ObjectId(payload.maNhanVienDuyet)
        : null,
    };

    // Remove undefined fields
    Object.keys(theodoimuonsach).forEach(
      (key) => theodoimuonsach[key] === undefined && delete theodoimuonsach[key]
    );

    return theodoimuonsach;
  }

  async create(payload) {
    const theodoimuonsach = this.extractTheoDoiMuonSachData(payload);
    const result = await this.TheoDoiMuonSach.insertOne(theodoimuonsach);
    return { _id: result.insertedId, ...theodoimuonsach };
  }

  async find(filter) {
    const cursor = await this.TheoDoiMuonSach.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.TheoDoiMuonSach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByDocGia(maDocGia) {
    return await this.find({
      maDocGia: ObjectId.isValid(maDocGia) ? new ObjectId(maDocGia) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    // Đảm bảo dữ liệu được xử lý đúng trước khi cập nhật
    const update = this.extractTheoDoiMuonSachData(payload);

    // Sử dụng $set thay vì thay thế toàn bộ document
    const result = await this.TheoDoiMuonSach.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.TheoDoiMuonSach.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result;
  }

  async deleteAll() {
    const result = await this.TheoDoiMuonSach.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = TheoDoiMuonSachService;
