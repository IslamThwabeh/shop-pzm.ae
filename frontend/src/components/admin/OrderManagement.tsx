import { useState } from 'react';

interface OrderManagementProps {
  token: string;
  onStatsUpdate?: () => void;
}

export default function OrderManagement({ token, onStatsUpdate }: OrderManagementProps) {
  return (
    <div className="text-slate-300">
      <p>Order management component</p>
    </div>
  );
}
