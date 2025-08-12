const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIAW7P6NTUQMFEDKZNS",
    secretAccessKey: "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",
  },
});

async function testS3() {
  try {
    console.log("Testing S3 connection...");

    const command = new ListObjectsV2Command({
      Bucket: "destinationhealth-medical-docs-dev",
      MaxKeys: 1,
    });

    const result = await s3Client.send(command);
    console.log("✅ S3 connection successful!");
    console.log("Bucket contents:", result.Contents?.length || 0, "objects");
  } catch (error) {
    console.error("❌ S3 connection failed:");
    console.error("Error code:", error.Code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  }
}

testS3();
