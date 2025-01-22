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

const commonFeatureRouter = require("./routes/common/feature-routes");
const  axios  = require("axios");




//create a database connection -> u can also
//create a separate file for this and then import/use that file here

mongoose
  .connect('mongodb+srv://anilparajuli580:kinganil@cluster0.opnsgkx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT =  5000;





app.use(
  cors({
    origin: "http://localhost:5173",
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

// app.post('/esewa-payment', async (req, res) => {
//   try {
//     const paymentData = {
//       amt: req.body.amount,
//       txAmt: 0,
//       psc: 0,
//       pdc: 0,
//       tAmt: req.body.amount,
//       pid: req.body.orderId,
//       scd: "EPAYTEST",
//       su: "http://localhost:5173/shop/payment-success",
//       fu: "https://developer.esewa.com.np/failure",
//       signed_field_names: req.body.signed_field_names,
//       signature: req.body.signature,
//     };
  
//     const response = await fetch('https://rc-epay.esewa.com.np/api/epay/main/v2/form', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams(paymentData),
//     });
  
//     const data = await response.json();
//     console.log(data)
//     res.status(200).json(data);  // Forward the eSewa response to the frontend
//   } catch (error) {
//     console.log(error);
    
//   }
  
// });

app.post('/khalti-api/', async (req, res) => {
  try {
    const payload = req.body;
    const khaltiResponse = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', payload, {
      headers: {
        Authorization: `key c751831329d544e18671b93070216342`
      }
    });
    console.log(khaltiResponse.data);  // Log the Khalti response data

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


app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
