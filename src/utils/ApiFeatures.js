import _ from "lodash";

export function shuffleArray(array) {
  return _.shuffle(array);
}

export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  // ========= pagination =========
  paginate() {
    let limit = Number(this.queryString.limit) || 20;
    if (this.queryString.limit <= 0) limit = 20;
    let page = this.queryString.page * 1 || 1;
    if (this.queryString.page <= 0) page = 1;
    let skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);

    this.limit = limit;
    this.metadata = {
      limit: limit,
      currentPage: page,
    };
    return this;
  }
  calculateTotalAndPages(totalCount) {
    if (
      this.metadata.limit < totalCount &&
      Math.ceil(totalCount / this.limit) > this.metadata.currentPage
    ) {
      this.metadata.nextPage = this.metadata.currentPage + 1;
    }
    if (this.metadata.currentPage > 1) {
      this.metadata.prevPage = this.metadata.currentPage - 1;
    }
    this.metadata.numberOfPages = Math.ceil(totalCount / this.limit);
  }

  // ========= filter =========
  filter() {
    let filterObj = { ...this.queryString };
    let excludedQuery = ["page", "sort", "fields", "keyword", "limit"];
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
          { name: { $regex: this.queryString.keyword, $options: "i" } },
          { title: { $regex: this.queryString.keyword, $options: "i" } },
          { code: { $regex: this.queryString.keyword, $options: "i" } },
          { expires: { $regex: this.queryString.keyword, $options: "i" } },
          { comment: { $regex: this.queryString.keyword, $options: "i" } },
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
