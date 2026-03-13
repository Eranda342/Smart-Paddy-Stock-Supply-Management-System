import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TransactionDetails() {

  const { id } = useParams();

  const [transaction, setTransaction] = useState(null);

  const token = localStorage.getItem("token");

  const fetchTransaction = async () => {

    try {

      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setTransaction(data.transaction);
      }

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  if (!transaction) {
    return (
      <div className="max-w-[1320px] mx-auto text-center py-20">
        Loading transaction...
      </div>
    );
  }

  return (

    <div className="max-w-[900px] mx-auto">

      <div className="mb-8">

        <h1 className="text-3xl font-semibold mb-2">
          Transaction Details
        </h1>

        <p className="text-muted-foreground">
          Order ID: {transaction.orderNumber || transaction._id}
        </p>

      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">

        <div className="grid grid-cols-2 gap-6">

          <div>
            <p className="text-sm text-muted-foreground">Buyer</p>
            <p className="font-medium">
              {transaction.millOwner?.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Farmer</p>
            <p className="font-medium">
              {transaction.farmer?.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Paddy Type</p>
            <p className="font-medium">
              {transaction.listing?.paddyType}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Quantity</p>
            <p className="font-medium">
              {transaction.quantityKg} kg
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Price / Kg</p>
            <p className="font-medium">
              Rs {transaction.finalPricePerKg}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-medium">
              Rs {transaction.totalAmount}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <p className="font-medium">
              {transaction.paymentStatus || "PENDING"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Order Status</p>
            <p className="font-medium">
              {transaction.status}
            </p>
          </div>

        </div>

      </div>

    </div>

  );

}