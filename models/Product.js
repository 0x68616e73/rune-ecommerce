const mongoose = require('mongoose');


const productionDetailSchema = new mongoose.Schema({
  detail: {
    type: String,
    required: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: false
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  productionDetails: [productionDetailSchema]
}, {
  timestamps: true
});

// Virtual for product's URL
productSchema.virtual('url').get(function() {
  return `/product/${this._id}`;
});

// Method to get total value of all products
productSchema.statics.getTotalValue = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: "$price" }
      }
    }
  ]);
  return result[0].totalValue;
};

// Method to search products
productSchema.statics.searchProducts = async function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ]
  });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;