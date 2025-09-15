import { dataStore } from '../../../lib/dataStore';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const segments = dataStore.getSegments();
      res.status(200).json({
        success: true,
        data: segments
      });
    } else if (req.method === 'POST') {
      const { name, rules } = req.body;
      
      if (!name || !rules) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and rules are required' }
        });
      }

      const newSegment = dataStore.createSegment({ name, rules });
      res.status(201).json({
        success: true,
        data: newSegment
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      const updatedSegment = dataStore.updateSegment(id, updateData);
      
      if (updatedSegment) {
        res.status(200).json({
          success: true,
          data: updatedSegment
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Segment not found' }
        });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const deletedSegment = dataStore.deleteSegment(id);
      
      if (deletedSegment) {
        res.status(200).json({
          success: true,
          data: deletedSegment
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Segment not found' }
        });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
}
