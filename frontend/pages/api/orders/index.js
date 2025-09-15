export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: [
        { 
          id: 1, 
          customerId: 1, 
          customerName: 'John Doe',
          amount: 1200, 
          status: 'completed',
          date: '2024-01-15',
          items: ['Product A', 'Product B']
        },
        { 
          id: 2, 
          customerId: 2, 
          customerName: 'Jane Smith',
          amount: 800, 
          status: 'pending',
          date: '2024-01-14',
          items: ['Product C']
        }
      ]
    });
  } else if (req.method === 'POST') {
    const { customerId, amount, items } = req.body;
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        customerId,
        amount,
        items: items || [],
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
