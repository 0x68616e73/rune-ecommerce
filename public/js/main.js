const app = Vue.createApp({
  data() {
    return {
      currentView: 'home',
      products: [],
      selectedCategory: '',
      minPrice: null,
      maxPrice: null,
      sortBy: 'name',
      sortOrder: 'asc',
      selectedProduct: null,
      transformedDate: null,
      isDarkMode: false,
      itemsPerPage: 8,
      currentPage: 1,
      isLoading: false,
      contactForm: {
        name: '',
        email: '',
        message: ''
      },
      showFilterContainer: false,
      selectedProduct: null,
      totalProducts: 0
    }
  },
  computed: {
    categories() {
      return [...new Set(this.products.map(product => product.category))];
    },
    filteredAndSortedProducts() {
      let filtered = this.products;

      if (this.selectedCategory) {
        filtered = filtered.filter(product => product.category === this.selectedCategory);
      }

      if (this.minPrice !== null && this.minPrice !== '') {
        filtered = filtered.filter(product => product.price >= parseFloat(this.minPrice));
      }
      
      if (this.maxPrice !== null && this.maxPrice !== '') {
        filtered = filtered.filter(product => product.price <= parseFloat(this.maxPrice));
      }

      const sortMultiplier = this.sortOrder === 'asc' ? 1 : -1;
      return filtered.sort((a, b) => {
        if (a[this.sortBy] < b[this.sortBy]) return -1 * sortMultiplier;
        if (a[this.sortBy] > b[this.sortBy]) return 1 * sortMultiplier;
        return 0;
      });
    },
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredAndSortedProducts.slice(startIndex, endIndex);
    },
    totalPages() {
      return Math.ceil(this.filteredAndSortedProducts.length / this.itemsPerPage);
    }
  },
  methods: {
    async fetchProducts() {
      this.isLoading = true;
      try {
        const response = await axios.get(`https://rune-ecommerce.onrender.com/api/products?page=${this.currentPage}&limit=${this.itemsPerPage}`);
        this.products = response.data.products;
        this.totalProducts = response.data.totalProducts;
        this.currentPage = response.data.currentPage;
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async selectProduct(product) {
      this.isLoading = true;
      try {
        const response = await axios.get(`https://rune-ecommerce.onrender.com/api/products/${product._id}`);
        this.selectedProduct = response.data;
        this.selectedProduct.dateAdded = moment(this.selectedProduct.dateAdded).format('YYYY.MM.DD');
        this.$nextTick(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          gsap.from('.product-details', { opacity: 0, y: 50, duration: 0.5 });
        });
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        await this.fetchProducts();
        window.scrollTo(0, 0);
      }
    },
    changeView(view) {
      this.isLoading = true;
      setTimeout(() => {
        this.currentView = view;
        this.selectedProduct = null;
        window.scrollTo(0, 0);
        this.isLoading = false;
      }, 500);
    },
    closeProductDetails() {
      this.selectedProduct = null;
      this.isLoading = true;
      setTimeout(() => {
        this.$nextTick(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' });
          gsap.from('.product-details', { opacity: 0, y: 50, duration: 0.5 });

        });
        this.selectedProduct = null;
        this.isLoading = false;
      }, 500);
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.body.classList.toggle('dark-mode');
    },
    applyFilters() {
      this.currentPage = 1;
    },
    submitForm() {
      // Here you would typically send the form data to a server
      console.log('Form submitted:', this.contactForm);
      // Reset the form after submission
      this.contactForm = {
        name: '',
        email: '',
        message: ''
      };
      alert('Thank you for your message. We will get back to you soon!');
    },
    toggleFilterContainer() {
      this.showFilterContainer = !this.showFilterContainer;
      if (this.showFilterContainer) {
        this.$nextTick(() => {
          gsap.from('.filter-container', { opacity: 0, y: -20, duration: 0.3 });
        });
      } else {
        gsap.to('.filter-container', { opacity: 0, y: -20, duration: 0.3 });
      }
    },
    truncateDescription(description, lines) {
      const words = description.split(' ');
      const lineLength = 4; 
      return words.slice(0, lines * lineLength).join(' ') + (words.length > lines * lineLength ? '...' : '');
    },
  
  },
  mounted() {
    // Check if user prefers dark mode
    window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
      if (e.matches !== this.isDarkMode) {
        this.toggleDarkMode();
      }});
    
    this.fetchProducts();
  }
});

app.mount('#app');