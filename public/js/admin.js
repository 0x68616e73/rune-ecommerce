const app = Vue.createApp({
  data() {
    return {
      isLoggedIn: false,
      loginForm: {
        username: '',
        password: ''
      },
      loginError: '',
      currentView: 'dashboard',
      products: [],
      currentProduct: {
        name: '',
        description: '',
        category: '',
        price: 0,
        image: '',
        productionDetails: []
      },
      editingProduct: null,
      itemsPerPage: 10,
      currentPage: 1,
      sortBy: 'name',
      sortOrder: 'asc',
      searchQuery: '',
      websiteVisitors: 15789,
      errorMessage: '',
      successMessage: '',
      totalProducts: 0 // Add this line
    }
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products];
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
      
      filtered.sort((a, b) => {
        let comparison = 0;
        if (this.sortBy === 'price') {
          comparison = a.price - b.price;
        } else if (this.sortBy === 'dateAdded') {
          comparison = new Date(a.dateAdded) - new Date(b.dateAdded);
        } else {
          comparison = a.name.localeCompare(b.name);
        }
        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
      
      return filtered;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },
    totalValue() {
      return this.products.reduce((total, product) => total + product.price, 0);
    }
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('/api/auth/login', this.loginForm);
        this.isLoggedIn = true;
        this.loginError = '';
        this.fetchProducts();
      } catch (error) {
        this.loginError = error.response ? error.response.data.message : 'Login failed';
      }
    },
    logout() {
      this.isLoggedIn = false;
      this.loginForm.username = '';
      this.loginForm.password = '';
    },
    async fetchProducts() {
      try {
        const response = await axios.get(`/api/products?page=${this.currentPage}&limit=${this.itemsPerPage}`);
        this.products = response.data.products;
        this.currentPage = response.data.currentPage;
        this.totalProducts = response.data.totalProducts; // Update this line
      } catch (error) {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Failed to fetch products. Please try again.';
      }
    },
    openAddProductModal() {
      this.editingProduct = null;
      this.currentProduct = { 
        name: '', 
        description: '', 
        category: '', 
        price: 0, 
        image: '', 
        productionDetails: [] 
      };
      const modal = new bootstrap.Modal(document.getElementById('productModal'));
      modal.show();
    },
    async saveProduct() {
      try {
        const productData = { ...this.currentProduct };
    
        // Ensure that each item in productionDetails is an object with a 'detail' string
        productData.productionDetails = productData.productionDetails.map(detail => {
          if (typeof detail === 'string') {
            return { detail };
          }
          return detail; // If it's already an object, return as is
        });
    
        if (this.editingProduct) {
          await axios.put(`/api/products/${this.editingProduct._id}`, productData);
          this.successMessage = 'Product updated successfully.';
        } else {
          await axios.post('/api/products', productData);
          this.successMessage = 'Product added successfully.';
        }
        this.fetchProducts();
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
      } catch (error) {
        console.error('Error saving product:', error.response ? error.response.data : error);
        this.errorMessage = 'Failed to save product. Please try again.';
      }
    }
    ,
    editProduct(product) {
      this.editingProduct = product;
      this.currentProduct = { 
        ...product,
        productionDetails: product.productionDetails.map(pd => pd.detail)
      };
      const modal = new bootstrap.Modal(document.getElementById('productModal'));
      modal.show();
    },
    async deleteProduct(productId) {
      console.log('Deleting product with ID:', productId); // Add this line for debugging
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await axios.delete(`/api/products/${productId}`);
          this.fetchProducts();
          this.successMessage = 'Product deleted successfully.';
        } catch (error) {
          console.error('Error deleting product:', error);
          this.errorMessage = 'Failed to delete product. Please try again.';
        }
      }
    },
    addProductionDetail() {
      this.currentProduct.productionDetails.push('');
    },
    removeProductionDetail(index) {
        this.currentProduct.productionDetails.splice(index, 1);
    },
    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
    }
  },
  watch: {
    currentPage() {
      this.fetchProducts();
    },
    itemsPerPage() {
      this.currentPage = 1;
      this.fetchProducts();
    },
    sortBy() {
      this.currentPage = 1;
    },
    sortOrder() {
      this.currentPage = 1;
    },
    searchQuery() {
      this.currentPage = 1;
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.fetchProducts();
    }
  }
});

app.mount('#app');