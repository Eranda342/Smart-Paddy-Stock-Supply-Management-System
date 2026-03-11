import { Eye, CheckCircle, XCircle } from 'lucide-react';

const pendingUsers = [
  { id: 1, name: 'Saman Perera', role: 'Farmer', nic: '199012345678', district: 'Anuradhapura', document: 'Land Deed', submitted: '2026-03-03' },
  { id: 2, name: 'Lakshmi Mills', role: 'Mill Owner', nic: 'BRN234567', district: 'Colombo', document: 'Business License', submitted: '2026-03-03' },
  { id: 3, name: 'Kumar Silva', role: 'Farmer', nic: '198809876543', district: 'Polonnaruwa', document: 'Lease Agreement', submitted: '2026-03-02' },
  { id: 4, name: 'Golden Rice Co', role: 'Mill Owner', nic: 'BRN345678', district: 'Gampaha', document: 'Registration Cert', submitted: '2026-03-02' },
];

export default function PendingVerifications() {
  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Pending Verifications</h1>
        <p className="text-muted-foreground">Review and approve user registrations</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Role</th>
                <th className="text-left p-4 text-sm font-medium">NIC / Registration</th>
                <th className="text-left p-4 text-sm font-medium">District</th>
                <th className="text-left p-4 text-sm font-medium">Document</th>
                <th className="text-left p-4 text-sm font-medium">Submitted</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      user.role === 'Farmer' ? 'text-green-500 bg-green-500/10' : 'text-blue-500 bg-blue-500/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">{user.nic}</td>
                  <td className="p-4">{user.district}</td>
                  <td className="p-4">{user.document}</td>
                  <td className="p-4 text-muted-foreground">{user.submitted}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors" title="View Document">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </button>
                      <button className="p-2 hover:bg-green-500/10 rounded-lg transition-colors" title="Approve">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </button>
                      <button className="p-2 hover:bg-red-500/10 rounded-lg transition-colors" title="Reject">
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
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
