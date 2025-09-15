export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Welcome Campaign',
          status: 'active',
          segmentId: 1,
          message: 'Welcome to our platform!',
          createdAt: '2024-01-10',
          sentCount: 150,
          openRate: 0.75
        },
        {
          id: 2,
          name: 'Retention Campaign',
          status: 'draft',
          segmentId: 2,
          message: 'We miss you! Come back with 20% off.',
          createdAt: '2024-01-12',
          sentCount: 0,
          openRate: 0
        }
      ]
    });
  } else if (req.method === 'POST') {
    const { name, segmentId, message } = req.body;
    res.status(201).json({
      success: true,
      data: {
        id: Date.now(),
        name,
        segmentId,
        message,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        sentCount: 0,
        openRate: 0
      }
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
