
const { getEsewaPaymentHash, verifyEsewaPayment } = require("../../helpers/esewa");
const Order = require("../../models/Order");
require('dotenv').config();
const axios = require("axios");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    console.log(process.env.ESEWA_SECRET_KEY) 
    const data = {
      // Use the parameters required for eSewa payment initiation
      amount: totalAmount,
      productId: cartId,
      productName: "Purchase of items from your shop",
      returnUrl: "http://localhost:5173/shop/esewa-return",
      websiteUrl: "http://localhost:5173",
    };


  // const config = {
  //   headers: {
  //     Authorization: `Key 8gBm/:&EnhH.1/q`,
  //   },
  // }

    

  //   const esewaResponse = await axios.post(
  //     "https://esewa.com.np/api/v1/payment/initiate/",
  //     data,
  //     config
  //   );

    const paymentInitiate = await getEsewaPaymentHash({
     data
    });

    console.log("Khalti Response Data:", paymentInitiate);

    // Save order in the database
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      // paymentToken: khaltiResponse.data.token, // Assuming token is in the response
      payment: paymentInitiate,
      orderId: newlyCreatedOrder._id,
    });
  } catch (e) {
    if (e.response) {
      console.log("Error Data:", e.response.data);
      console.log("Error Status:", e.response.status);
      console.log("Error Headers:", e.response.headers);
    } else {
      console.log("Error:", e.message);
    }
    res.status(500).json({
      success: false,
      message: "Error during Khalti payment!" + e.message,
    });
  }
}

const capturePayment = async (req, res) => {
  try {
    const { paymentToken, orderId } = req.body;

    // Find the order in the database
    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify payment with eSewa
    const paymentInfo = await verifyEsewaPayment(paymentToken);

    // Check if payment is successful
    if (paymentInfo.response.status === "COMPLETE") {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";

      // Update stock for each item in the cart
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.title} not found!`,
          });
        }

        product.totalStock -= item.quantity;
        await product.save();
      }

      // Delete the cart after order completion
      await Cart.findByIdAndDelete(order.cartId);

      // Save the updated order
      await order.save();

      // Return success response
      res.status(200).json({
        success: true,
        message: "Order confirmed",
        data: order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment could not be verified!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while capturing payment",
      error: error.message,
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
