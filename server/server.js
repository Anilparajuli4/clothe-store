const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
require('dotenv').config();

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const path = require("path")
const commonFeatureRouter = require("./routes/common/feature-routes");
const  axios  = require("axios");





mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express(); 
const PORT =  process.env.PORT;


const _dirname = path.resolve()


app.use(
  cors({
    origin: "https://clothe-store.onrender.com",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);



app.post('/khalti-api/', async (req, res) => {
  try {
    const payload = req.body;
    const khaltiResponse = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', payload, {
      headers: {
        Authorization: `key c751831329d544e18671b93070216342`
      }
    });
    // Log the Khalti response data

    res.status(200).json({
      success: true,
      data: khaltiResponse.data
    });
  } catch (error) {
    console.error("Error during Khalti payment initiation:", error.message);  // Log any error that occurs
    res.status(500).json({
      success: false,
      message: "Payment initiation failed. Please try again."
    });
  }
});


app.get('/payment-success', async (req, res) => {
  const { pidx, status, transaction_id } = req.query;

  // Always perform a lookup after the payment to verify
  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key c751831329d544e18671b93070216342`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Process based on the lookup result
    const paymentStatus = response.data.status;
    if (paymentStatus === 'Completed') {
      // Payment successful
      res.redirect('/order-success');  // Redirect to a success page
    } else {
      // Payment not completed (pending, failed, etc.)
      res.redirect('/order-failed');   // Handle accordingly
    }
  } catch (error) {
    console.error('Error in payment verification:', error);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

 
app.use(express.static(path.join(_dirname, "/client/dist")))
app.get('*', (req, res)=> {
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"))
})

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
 