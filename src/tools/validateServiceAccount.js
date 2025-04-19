// Run this script to validate your service account file
const fs = require('fs');
const path = require('path');

// Path to service account file
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

console.log(`Checking service account at: ${serviceAccountPath}`);

try {
  // Check if file exists
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ SERVICE ACCOUNT FILE NOT FOUND!');
    process.exit(1);
  }
  
  // Read the file content
  const content = fs.readFileSync(serviceAccountPath, 'utf8');
  console.log(`File exists and contains ${content.length} characters`);
  
  // Try to parse the JSON
  const serviceAccount = JSON.parse(content);
  
  // Check essential fields
  const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.error(`❌ Service account is missing required fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ Service account file is valid with all required fields');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
  console.log(`   Client Email: ${serviceAccount.client_email}`);
  
  // Check if the private key looks valid (should start with "-----BEGIN PRIVATE KEY-----")
  if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('❌ Private key appears to be invalid - does not contain the expected prefix');
    process.exit(1);
  }
  
  console.log('✅ Private key format appears valid');
  console.log('✅ Service account validation complete - file appears to be correctly formatted');
} catch (error) {
  console.error('❌ Error validating service account file:', error);
  process.exit(1);
}
