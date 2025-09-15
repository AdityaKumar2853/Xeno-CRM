export default function handler(req, res) {
  res.status(200).json({
    success: true,
    data: {
      totalCustomers: 150,
      totalOrders: 320,
      totalRevenue: 45000,
      activeCampaigns: 5
    }
  });
}
