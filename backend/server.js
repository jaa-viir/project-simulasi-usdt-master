const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const DummyUSDT_ABI = require('./DummyUSDT_ABI.json'); // 🔥 Pastikan file ini ada!

const app = express();
app.use(cors());
app.use(express.json());

let invoices = [];
let withdraws = [];

// Buat invoice
app.post('/invoice', (req, res) => {
  const { freelancer, amount, note } = req.body;
  const newInvoice = {
    id: invoices.length + 1,
    freelancer,
    amount,
    note,
    status: 'pending'
  };
  invoices.push(newInvoice);
  res.json(newInvoice);
});

// Lihat semua invoice
app.get('/invoices', (req, res) => {
  res.json(invoices);
});

// Pembayaran invoice
app.post('/pay', (req, res) => {
  const { id } = req.body;
  const invoice = invoices.find(i => i.id === id);
  if (invoice) {
    invoice.status = 'paid';
    res.json({ message: 'Invoice paid!' });
  } else {
    res.status(404).json({ message: 'Invoice not found' });
  }
});

// Simulasi withdraw
app.post('/withdraw', (req, res) => {
  const { freelancer, wallet } = req.body;
  withdraws.push({ freelancer, wallet, date: new Date() });
  res.json({ message: 'Withdraw success!' });
});

// Lihat histori withdraw
app.get('/withdraws', (req, res) => {
  res.json(withdraws);
});

// 🔥 NEW: Lihat histori transaksi blockchain DummyUSDT
app.get('/transactions', async (req, res) => {
  try {
    const RPC_URL = 'https://rpc2.sepolia.org';
    const CONTRACT_ADDRESS = '0x9052d8a3c6851Ed20FB19C6AFB863997877d9bE6';
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, DummyUSDT_ABI, provider);

    const filter = contract.filters.Transfer();
    const logs = await contract.queryFilter(filter, 0, 'latest');

    const formatted = logs.map((log) => ({
      hash: log.transactionHash,
      from: log.args.from,
      to: log.args.to,
      amount: ethers.formatUnits(log.args.value, 18),
      blockNumber: log.blockNumber,
    }));

    res.json(formatted.reverse());
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch blockchain transactions' });
  }
});

// 🔥 Ganti port ke 5000
app.listen(5000, () => console.log('✅ Server running on http://localhost:5000'));
