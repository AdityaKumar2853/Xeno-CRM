import { dataStore } from '../../../lib/dataStore';

export default function handler(req, res) {
  try {
    const stats = dataStore.getOrderStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch order statistics' }
    });
  }
}
