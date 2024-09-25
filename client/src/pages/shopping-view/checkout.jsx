import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(currentSelectedAddress, "cartItems");

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });

      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });

      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "esewa",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log(data, "anil data");
      if (data?.payload?.success) {
        setIsPaymemntStart(true);
        console.log(data?.payload?.payment?.signature, data?.payload?.payment?.signed_field_names, 'fields');
        
        
        startEsewaPayment(data?.payload?.orderId, data?.payload?.payment?.signature, data?.payload?.payment?.signed_field_names,    totalCartAmount);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  // if (approvalURL) {
  //   window.location.href = approvalURL;
  // }

  async function  startEsewaPayment(orderId, signature, signed_field_names,  amount ) {
    // const form = document.createElement("form");
    // form.method = "POST";
    // form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
  
    // form.innerHTML = `
    //   <input type="hidden" name="amt" value="${amount}" />
    //   <input type="hidden" name="txAmt" value="0" />
    //   <input type="hidden" name="psc" value="0" />
    //   <input type="hidden" name="pdc" value="0" />
    //   <input type="hidden" name="tAmt" value="${amount}" />
    //   <input type="hidden" name="pid" value="${orderId}" />
    //   <input type="hidden" name="scd" value="EPAYTEST" />
    //   <input type="hidden" name="su" value="http://localhost:5173/shop/payment-success" />
    //   <input type="hidden" name="fu" value="https://developer.esewa.com.np/failure" />
    //   <input type="hidden" name="signed_field_names" value="${signed_field_names}" />
    //   <input type="hidden" name="signature" value="${signature}" />
    // `;
  
    // document.body.appendChild(form);
    // form.submit();

    const url = "http://localhost:5000/esewa-payment";
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          signature: signature,
          signed_field_names: signed_field_names,
          amount: amount
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Payment Response:", data);
      return data;
    } catch (error) {
      console.error("Payment Error:", error);
      throw error;
    }
  }
 

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent  cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button onClick={handleInitiatePaypalPayment} className="w-full">
              {isPaymentStart
                ? "Processing Esewa Payment..."
                : "Checkout with Esewa"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
