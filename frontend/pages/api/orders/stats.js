export default function handler(req, res) {
  res.status(200).json({
    success: true,
    data: {
      totalOrders: 320,
      totalRevenue: 45000,
      averageOrderValue: 140.63,
      pendingOrders: 15
    }
  });
}
