const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect('mongodb+srv://hans:yoxlama123@kellerdb.a8bvub2.mongodb.net/eCommerceDB?retryWrites=true&w=majority&appName=kellerdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

async function createAdminUser() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('GM~sQB.-y^U18Lf}gIc1y^(Bb-@i%hAs^', salt);

    const adminUser = new User({
      username: 'Admin',
      password: hashedPassword
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
}

createAdminUser();