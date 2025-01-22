// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// import { useNavigate } from "react-router-dom";

// function PaymentSuccessPage() {
//   const navigate = useNavigate();

//   return (
//     <Card className="p-10">
//       <CardHeader className="p-0">
//         <CardTitle className="text-4xl">Payment is successfull!</CardTitle>
//       </CardHeader>
//       <Button className="mt-5" onClick={() => navigate("/shop/account")}>
//         View Orders
//       </Button>
//     </Card>
//   );
// }

// export default PaymentSuccessPage;


import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"; // To get query params like 'pidx'

const PaymentSuccessPage = () => {
  const [paymentStatus, setPaymentStatus] = useState(null); // To store payment status
  const [loading, setLoading] = useState(true); // Loading state while fetching data
  const [searchParams] = useSearchParams(); // Hook to get query params

  // Get pidx from URL query params
  const pidx = searchParams.get("pidx");

  useEffect(() => {
    // Function to fetch payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/payment-success?pidx=${pidx}` // Assuming this is your backend URL
        );
        const data = await response.json();

        if (data.success) {
          setPaymentStatus("success");
        } else {
          setPaymentStatus("failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setPaymentStatus("error");
      } finally {
        setLoading(false);
      }
    };

    if (pidx) {
      verifyPayment(); // Only call the API if 'pidx' is present
    }
  }, [pidx]);

  if (loading) {
    return <div>Loading payment status...</div>; // Display while waiting for API response
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {paymentStatus === "success" && (
        <div>
          <h3 className="text-2xl font-bold text-green-600">Thank you for your payment!</h3>
          <p>Your payment has been successfully completed.</p>
        </div>
      )}
      {paymentStatus === "failed" && (
        <div>
          <h3 className="text-2xl font-bold text-red-600">Payment Failed</h3>
          <p>Unfortunately, we could not complete your payment. Please try again.</p>
        </div>
      )}
      {paymentStatus === "error" && (
        <div>
          <h3 className="text-2xl font-bold text-red-600">Error Verifying Payment</h3>
          <p>We encountered an error while verifying your payment. Please contact support.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
