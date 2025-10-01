/**
 * Test VSP endpoints
 */

const testData = {
  fullName: 'John Doe',
  email: 'john@example.com',
  company: 'Test Corp',
  phone: '+1-555-0100',
  package: 'professional',
  projectDescription: 'We need a comprehensive Web3 platform with NFT integration',
  timeline: '4 weeks',
  budget: '5k-10k'
};

async function testVSPSubmission() {
  console.log('Testing VSP submission endpoint...');
  
  try {
    const response = await fetch('http://localhost:8787/api/vsp/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('✅ Submission test:', response.status, result);
    
    if (result.contractId) {
      await testContractGeneration(result.contractId);
      await testESignature(result.contractId, testData.email);
    }
  } catch (error) {
    console.error('❌ Submission test failed:', error);
  }
}

async function testContractGeneration(contractId) {
  console.log('\nTesting contract generation...');
  
  try {
    const response = await fetch('http://localhost:8787/api/vsp/contract/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('✅ Contract generation test:', response.status);
    console.log('Contract details:', result.contract);
  } catch (error) {
    console.error('❌ Contract generation test failed:', error);
  }
}

async function testESignature(contractId, email) {
  console.log('\nTesting e-signature request...');
  
  const vendors = ['docusign', 'hellosign', 'adobesign', 'pandadoc'];
  
  for (const vendor of vendors) {
    try {
      const response = await fetch('http://localhost:8787/api/vsp/contract/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractId,
          signerEmail: email,
          vendor
        })
      });
      
      const result = await response.json();
      console.log(`✅ ${vendor} test:`, result.signatureRequest.status);
    } catch (error) {
      console.error(`❌ ${vendor} test failed:`, error);
    }
  }
}

async function testPayment() {
  console.log('\nTesting payment endpoint...');
  
  try {
    const response = await fetch('http://localhost:8787/api/vsp/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package: 'professional',
        email: testData.email,
        amount: 750000
      })
    });
    
    const result = await response.json();
    console.log('✅ Payment test:', response.status);
    console.log('Payment intent:', result.paymentIntentId);
  } catch (error) {
    console.error('❌ Payment test failed:', error);
  }
}

async function testVSPPage() {
  console.log('\nTesting VSP page rendering...');
  
  try {
    const response = await fetch('http://localhost:8787/vsp');
    const html = await response.text();
    
    console.log('✅ Page test:', response.status);
    console.log('HTML length:', html.length, 'chars');
    console.log('Contains form:', html.includes('intake-form'));
    console.log('Contains packages:', html.includes('package-card'));
  } catch (error) {
    console.error('❌ Page test failed:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting VSP Tests\n');
  console.log('='.repeat(50));
  
  await testVSPPage();
  await testVSPSubmission();
  await testPayment();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed');
}

runTests();
