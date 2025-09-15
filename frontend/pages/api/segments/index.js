export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          name: 'High Value Customers',
          rules: 'total_spend > 1000',
          customerCount: 45,
          createdAt: '2024-01-10'
        },
        {
          id: 2,
          name: 'Inactive Customers',
          rules: 'last_purchase_date < today - 90',
          customerCount: 23,
          createdAt: '2024-01-12'
        }
      ]
    });
  } else if (req.method === 'POST') {
    const { name, rules } = req.body;
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        name,
        rules,
        customerCount: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString().split('T')[0]
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
