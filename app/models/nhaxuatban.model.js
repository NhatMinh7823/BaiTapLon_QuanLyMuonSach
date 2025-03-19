const { ObjectId } = require("mongodb");

class NhaXuatBanService {
  constructor(client) {
    this.NhaXuatBan = client.db().collection("nhaxuatban");
  }

  extractNhaXuatBanData(payload) {
    const nhaxuatban = {
      tenNXB: payload.tenNXB,
      diaChi: payload.diaChi,
    };

    // Remove undefined fields
    Object.keys(nhaxuatban).forEach(
      (key) => nhaxuatban[key] === undefined && delete nhaxuatban[key]
    );

    return nhaxuatban;
  }

  async create(payload) {
    const nhaxuatban = this.extractNhaXuatBanData(payload);
    const result = await this.NhaXuatBan.insertOne(nhaxuatban);
    return { _id: result.insertedId, ...nhaxuatban };
  }

  async find(filter) {
    const cursor = await this.NhaXuatBan.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      tenNXB: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.NhaXuatBan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractNhaXuatBanData(payload);
    const result = await this.NhaXuatBan.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.NhaXuatBan.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result;
  }

  async deleteAll() {
    const result = await this.NhaXuatBan.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = NhaXuatBanService;
