const { processBatchVegetation } = require('../backend/controllers/vegetation.controller');

// Mock dependencies
const mockReq = {
    files: [
        { originalname: 'test1.tif', path: '/tmp/test1.tif', filename: 'test1.tif' },
        { originalname: 'test2.tif', path: '/tmp/test2.tif', filename: 'test2.tif' }
    ],
    body: {
        farmId: 'mockFarmId'
    },
    user: {
        id: 'mockUserId'
    }
};

const mockRes = {
    status: (code) => {
        console.log(`Response Status: ${code}`);
        return mockRes;
    },
    json: (data) => {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
        return mockRes;
    }
};

// Mock the internal functions that processBatchVegetation calls
// We need to proxy the require calls or mock the module if we were using a real test runner.
// Since we are running this with node directly, we can't easily mock the internal require calls 
// inside the controller without a library like proxyquire or jest.
// However, we CAN test the validation logic easily.

async function testValidation() {
    console.log('--- Testing Validation (Missing farmId) ---');
    const badReq = { ...mockReq, body: {} };
    await processBatchVegetation(badReq, mockRes);

    console.log('\n--- Testing Validation (No files) ---');
    const noFilesReq = { ...mockReq, files: [] };
    await processBatchVegetation(noFilesReq, mockRes);
}

testValidation();
