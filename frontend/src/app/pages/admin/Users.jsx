import { useState } from 'react';

const users = [
  { id: 1, name: 'John Doe', role: 'Farmer', email: 'john@email.com', district: 'Anuradhapura', status: 'Active', statusColor: 'text-green-500 bg-green-500/10', joined: '2026-02-15' },
  { id: 2, name: 'Mill Services Ltd', role: 'Mill Owner', email: 'contact@millservices.lk', district: 'Colombo', status: 'Active', statusColor: 'text-green-500 bg-green-500/10', joined: '2026-02-18' },
  { id: 3, name: 'Kamal Silva', role: 'Farmer', email: 'kamal@email.com', district: 'Polonnaruwa', status: 'Active', statusColor: 'text-green-500 bg-green-500/10', joined: '2026-02-20' },
  { id: 4, name: 'Golden Rice Co', role: 'Mill Owner', email: 'info@goldenrice.lk', district: 'Gampaha', status: 'Suspended', statusColor: 'text-red-500 bg-red-500/10', joined: '2026-02-22' },
];

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  return (
    <div className="max-w-[1320px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Users</h1>
        <p className="text-muted-foreground">Manage platform users</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        >
          <option>All Roles</option>
          <option>Farmer</option>
          <option>Mill Owner</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Role</th>
                <th className="text-left p-4 text-sm font-medium">Email</th>
                <th className="text-left p-4 text-sm font-medium">District</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Joined</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors h-14">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      user.role === 'Farmer' ? 'text-green-500 bg-green-500/10' : 'text-blue-500 bg-blue-500/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">{user.district}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${user.statusColor}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.joined}</td>
                  <td className="p-4">
                    <button className="text-[#22C55E] hover:underline text-sm">View</button>
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
