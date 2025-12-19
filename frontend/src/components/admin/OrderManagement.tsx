interface OrderManagementProps {
  onStatsUpdate?: () => void;
}

export default function OrderManagement({}: OrderManagementProps) {
  return (
    <div className="text-slate-300">
      <p>Order management component</p>
    </div>
  );
}
