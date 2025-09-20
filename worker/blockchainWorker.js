// Example blockchain worker for TouristShield
// This is a skeleton; you'll need to fill in your contract ABI/address and provider details.

const mongoose = require('mongoose');
const Incident = require('../models/Incident');

// Dummy blockchain setup (replace with real web3/ethers config)
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider('http://localhost:8545'); // Change to your node/infura
const privateKey = 'YOUR_PRIVATE_KEY'; // Securely store in env!
const wallet = new ethers.Wallet(privateKey, provider);

// Sample contract ABI and address (replace with yours)
const contractAddress = '0xYourSmartContractAddressHere';
const contractABI = [
  // Replace with your actual ABI
  "function storeProof(bytes32 proofHash, string touristDid, uint256 incidentId) public returns (bool)",
  "event ProofStored(bytes32 proofHash, string touristDid, uint256 incidentId)"
];

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Simulate BullMQ/queue: just a function for demo
async function enqueueBlockchainProof({ proofHash, touristDid, incidentId }) {
  // In a real app, you'd push this job to a queue and process it
  await writeProofToBlockchain({ proofHash, touristDid, incidentId });
}

// Worker process function
async function writeProofToBlockchain({ proofHash, touristDid, incidentId }) {
  try {
    // Call smart contract to store proof
    const tx = await contract.storeProof(proofHash, touristDid, incidentId);
    const receipt = await tx.wait();

    // Update Incident record with blockchain tx hash
    await Incident.updateOne(
      { _id: incidentId },
      { $set: { proofTxId: receipt.transactionHash } }
    );

    console.log(
      `Proof stored on chain for incident ${incidentId}: tx ${receipt.transactionHash}`
    );
  } catch (err) {
    console.error('Blockchain write error:', err);
  }
}

// Export for API to call
module.exports = {
  enqueueBlockchainProof,
  writeProofToBlockchain
};

// Example usage (remove/comment in production)
// enqueueBlockchainProof({
//   proofHash: '0xabcdef1234567890',
//   touristDid: 'did:example:123',
//   incidentId: '65203c9cdb1234567890abcd'
// });
