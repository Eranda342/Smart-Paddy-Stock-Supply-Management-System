const transactions = [
  { id: 1, buyer: 'ABC Rice Mill', paddyType: 'Samba', quantity: '500 kg', finalPrice: 'Rs 42,500', payment: 'Paid', paymentColor: 'text-green-500 bg-green-500/10', transport: 'Completed', transportColor: 'text-green-500 bg-green-500/10' },
  { id: 2, buyer: 'XYZ Mills Ltd', paddyType: 'Keeri Samba', quantity: '750 kg', finalPrice: 'Rs 71,250', payment: 'Pending', paymentColor: 'text-yellow-500 bg-yellow-500/10', transport: 'In Transit', transportColor: 'text-blue-500 bg-blue-500/10' },
  { id: 3, buyer: 'Green Valley Mills', paddyType: 'Nadu', quantity: '600 kg', finalPrice: 'Rs 45,000', payment: 'Paid', paymentColor: 'text-green-500 bg-green-500/10', transport: 'Scheduled', transportColor: 'text-yellow-500 bg-yellow-500/10' },
];

export default function FarmerTransactions() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Transactions</h1>
        <p className="text-muted-foreground">View your completed and ongoing transactions</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Buyer</th>
                <th className="text-left p-4 text-sm font-medium">Paddy Type</th>
                <th className="text-left p-4 text-sm font-medium">Quantity</th>
                <th className="text-left p-4 text-sm font-medium">Final Price</th>
                <th className="text-left p-4 text-sm font-medium">Payment Status</th>
                <th className="text-left p-4 text-sm font-medium">Transport Status</th>
                <th className="text-left p-4 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4 font-medium">{txn.buyer}</td>
                  <td className="p-4">{txn.paddyType}</td>
                  <td className="p-4">{txn.quantity}</td>
                  <td className="p-4">{txn.finalPrice}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${txn.paymentColor}`}>
                      {txn.payment}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${txn.transportColor}`}>
                      {txn.transport}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-[#22C55E] hover:underline text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
