const { ObjectId } = require("mongodb");

class SachService {
  constructor(client) {
    this.Sach = client.db().collection("sach");
  }

  extractSachData(payload) {
    const sach = {
      tenSach: payload.tenSach,
      donGia: payload.donGia,
      soQuyen: payload.soQuyen,
      namXuatBan: payload.namXuatBan,
      maNXB: payload.maNXB ? new ObjectId(payload.maNXB) : null,
      nguonGocTacGia: payload.nguonGocTacGia,
      anhBia: payload.anhBia,
    };

    // Remove undefined fields
    Object.keys(sach).forEach(
      (key) => sach[key] === undefined && delete sach[key]
    );

    return sach;
  }

  async create(payload) {
    const sach = this.extractSachData(payload);
    const result = await this.Sach.insertOne(sach);
    return { _id: result.insertedId, ...sach };
  }

  async find(filter) {
    const cursor = await this.Sach.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      tenSach: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.Sach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractSachData(payload);
    const result = await this.Sach.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.Sach.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result;
  }

  async deleteAll() {
    const result = await this.Sach.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = SachService;
