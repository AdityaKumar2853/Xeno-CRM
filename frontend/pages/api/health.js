export default function handler(req, res) {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      message: 'Xeno CRM API is running on Vercel',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
  });
}
