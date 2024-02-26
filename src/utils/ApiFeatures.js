export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  // ========= pagination =========
  paginate() {
    let page = this.queryString.page * 1 || 1;
    if (this.queryString.page <= 0) page = 1;
    let skip = (page - 1) * 25;
    this.page=page
    this.mongooseQuery.skip(skip).limit(25);
    return this;
  }

  // ========= filter =========
  filter() {
    let filterObj = { ...this.queryString };
    let excludedQuery = ["page", "sort", "fields", "keyword"];
    excludedQuery.forEach((q) => {
      delete filterObj[q];
    });
    filterObj = JSON.stringify(filterObj);
    filterObj = filterObj.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );
    filterObj = JSON.parse(filterObj);
    this.mongooseQuery.find(filterObj);
    return this;
  }

  // ========= sort =========
  sort() {
    if (this.queryString.sort) {
      let sortedBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery.sort(sortedBy);
    }
    return this;
  }

  // ========= search =========
  search() {
    if (this.queryString.keyword) {
      this.mongooseQuery.find({
        $or: [
          { fName: { $regex: this.queryString.keyword, $options: "i" } },
          { lName: { $regex: this.queryString.keyword, $options: "i" } },
          { email: { $regex: this.queryString.keyword, $options: "i" } },
          { role: { $regex: this.queryString.keyword, $options: "i" } },
          { name: { $regex: this.queryString.keyword, $options: "i" } },
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { description: { $regex: this.queryString.keyword, $options: "i" } },
        ],
      });
    }
    return this;
  }

  // ========= selected fields =========
  fields() {
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery.select(fields);
    }
    return this;
  }
}
