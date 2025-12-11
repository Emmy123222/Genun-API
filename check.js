const { randomBytes } = require('crypto');


const generateNumericId =  () => {
    // Get current timestamp
    // const timestamp = new Date().getTime();
    //   const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    //   const numericId = parseInt(timestamp.toString() + randomNumber.toString());

    //   // Create a valid ObjectId from the numeric ID
    //   const objectId = new ObjectID(numericId);

    const randomNumber = randomBytes(4).readUInt32BE(0); // Generate a random 4-byte number
    const numericId = randomNumber >>> 0; // Convert to unsigned integer

    return numericId;
}

// Example usage
const productId = generateNumericId();
console.log(productId);



