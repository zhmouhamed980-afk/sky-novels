const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const API_BASE = 'http://62.171.141.197:5007';

app.use(cors());
app.use(express.json());

// Proxy function to forward requests
const proxyRequest = async (req, res, targetPath) => {
  try {
    const config = {
      method: req.method,
      url: `${API_BASE}${targetPath}`,
      headers: {}
    };

    // Forward Authorization header if present
    if (req.headers.authorization) {
      config.headers.Authorization = req.headers.authorization;
    }

    // Forward body for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      config.data = req.body;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    
    // Return upstream response as-is
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`Proxy error for ${targetPath}:`, error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { success: false, error: error.message };
    res.status(status).json(data);
  }
};

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  proxyRequest(req, res, '/auth/login');
});

// Novels endpoints
app.get('/api/novels', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const targetPath = `/novels?page=${page}&limit=${Math.min(parseInt(limit), 100)}`;
  proxyRequest(req, res, targetPath);
});

app.get('/api/novels/search', (req, res) => {
  const { q } = req.query;
  const targetPath = `/novels/search?q=${encodeURIComponent(q)}`;
  proxyRequest(req, res, targetPath);
});

app.get('/api/novels/:id', (req, res) => {
  const { id } = req.params;
  proxyRequest(req, res, `/novels/${id}`);
});

app.get('/api/novels/:id/chapters/:num', (req, res) => {
  const { id, num } = req.params;
  proxyRequest(req, res, `/novels/${id}/chapters/${num}`);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sky Novels Proxy Server running on http://0.0.0.0:${PORT}`);
});
