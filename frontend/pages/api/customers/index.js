export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', totalSpend: 1200 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', totalSpend: 800 },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', totalSpend: 1500 }
      ]
    });
  } else if (req.method === 'POST') {
    const { name, email, phone } = req.body;
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        name,
        email,
        phone,
        totalSpend: 0
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
