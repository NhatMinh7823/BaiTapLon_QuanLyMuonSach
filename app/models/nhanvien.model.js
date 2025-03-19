const { ObjectId } = require("mongodb");

class NhanVienService {
  constructor(client) {
    this.NhanVien = client.db().collection("nhanvien");
  }

  extractNhanVienData(payload) {
    const nhanvien = {
      hoTenNV: payload.hoTenNV,
      password: payload.password,
      chucVu: payload.chucVu,
      diaChi: payload.diaChi,
      soDienThoai: payload.soDienThoai,
      email: payload.email,
    };

    // Remove undefined fields
    Object.keys(nhanvien).forEach(
      (key) => nhanvien[key] === undefined && delete nhanvien[key]
    );

    return nhanvien;
  }

  async create(payload) {
    const nhanvien = this.extractNhanVienData(payload);
    const result = await this.NhanVien.findOneAndUpdate(
      { email: nhanvien.email },
      { $set: nhanvien },
      { returnDocument: "after", upsert: true }
    );

    return result;
  }

  async find(filter) {
    const cursor = await this.NhanVien.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      hoTenNV: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.NhanVien.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByEmail(email) {
    return await this.NhanVien.findOne({ email });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractNhanVienData(payload);
    const result = await this.NhanVien.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.NhanVien.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result;
  }

  async deleteAll() {
    const result = await this.NhanVien.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = NhanVienService;
