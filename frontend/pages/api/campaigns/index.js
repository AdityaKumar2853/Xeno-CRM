import { dataStore } from '../../../lib/dataStore';

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const campaigns = dataStore.getCampaigns();
      res.status(200).json({
        success: true,
        data: campaigns
      });
    } else if (req.method === 'POST') {
      const { name, segmentId, message } = req.body;
      
      if (!name || !message) {
        return res.status(400).json({
          success: false,
          error: { message: 'Name and message are required' }
        });
      }

      const newCampaign = dataStore.createCampaign({ name, segmentId, message });
      res.status(201).json({
        success: true,
        data: newCampaign
      });
    } else if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      const updatedCampaign = dataStore.updateCampaign(id, updateData);
      
      if (updatedCampaign) {
        res.status(200).json({
          success: true,
          data: updatedCampaign
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Campaign not found' }
        });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const deletedCampaign = dataStore.deleteCampaign(id);
      
      if (deletedCampaign) {
        res.status(200).json({
          success: true,
          data: deletedCampaign
        });
      } else {
        res.status(404).json({
          success: false,
          error: { message: 'Campaign not found' }
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
