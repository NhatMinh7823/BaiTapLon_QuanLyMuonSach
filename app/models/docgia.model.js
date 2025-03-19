const { ObjectId } = require("mongodb");

class DocGiaService {
  constructor(client) {
    this.DocGia = client.db().collection("docgia");
  }

  extractDocGiaData(payload) {
    const docgia = {
      hoLot: payload.hoLot,
      ten: payload.ten,
      ngaySinh: payload.ngaySinh ? new Date(payload.ngaySinh) : null,
      phai: payload.phai,
      diaChi: payload.diaChi,
      dienThoai: payload.dienThoai,
      email: payload.email,
      password: payload.password, // Password should already be hashed in controller
      role: payload.role || "user",
    };

    // Remove undefined fields
    Object.keys(docgia).forEach(
      (key) => docgia[key] === undefined && delete docgia[key]
    );

    return docgia;
  }

  async create(payload) {
    // Password should be hashed in controller before calling this method
    const docgia = this.extractDocGiaData(payload);
    const result = await this.DocGia.findOneAndUpdate(
      { email: docgia.email },
      { $set: docgia },
      { returnDocument: "after", upsert: true }
    );

   return result.value || (result.ok && result);
  }

  async find(filter) {
    const cursor = await this.DocGia.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      $or: [
        { hoLot: { $regex: new RegExp(name), $options: "i" } },
        { ten: { $regex: new RegExp(name), $options: "i" } },
      ],
    });
  }

  async findById(id) {
    // Improved ObjectId validation - return null if id is invalid
    if (!ObjectId.isValid(id)) {
      return null;
    }
    return await this.DocGia.findOne({ _id: new ObjectId(id) });
  }

  async findByEmail(email) {
    return await this.DocGia.findOne({ email });
  }

  async update(id, payload) {
    // Improved ObjectId validation - return null if id is invalid
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const filter = { _id: new ObjectId(id) };
    const update = this.extractDocGiaData(payload);
    const result = await this.DocGia.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    // Improved ObjectId validation - return null if id is invalid
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const result = await this.DocGia.findOneAndDelete({
      _id: new ObjectId(id),
    });

    return result;
  }

  async deleteAll() {
    const result = await this.DocGia.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = DocGiaService;
