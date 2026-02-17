const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');

// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find().select('-password');
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).select('-password');
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update organization parameters
router.put('/parameters', auth, async (req, res) => {
  try {
    if (req.user.role !== 'organization') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { messParameters } = req.body;
    const organization = await Organization.findById(req.user.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    organization.messParameters = {
      ...organization.messParameters,
      ...messParameters
    };

    await organization.save();
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get organization parameters
router.get('/parameters/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization.messParameters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
