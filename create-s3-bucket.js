const {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
} = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIAW7P6NTUQMFEDKZNS",
    secretAccessKey: "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",
  },
});

async function createBucket() {
  const bucketName = "destinationhealth-medical-docs-dev";

  try {
    console.log(`🪣 Creating S3 bucket: ${bucketName}`);

    // Create bucket
    const createCommand = new CreateBucketCommand({
      Bucket: bucketName,
      // Note: For us-east-1, don't specify CreateBucketConfiguration
    });

    await s3Client.send(createCommand);
    console.log("✅ Bucket created successfully!");

    // Configure CORS for web uploads
    console.log("🔧 Configuring CORS...");
    const corsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: [
              "http://localhost:3000",
              "http://localhost:3001",
              "https://your-domain.com", // Add your production domain
            ],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    });

    await s3Client.send(corsCommand);
    console.log("✅ CORS configured successfully!");

    console.log(`🎉 S3 bucket ${bucketName} is ready for use!`);
  } catch (error) {
    if (error.Code === "BucketAlreadyOwnedByYou") {
      console.log("✅ Bucket already exists and you own it!");
    } else {
      console.error("❌ Failed to create bucket:");
      console.error("Error code:", error.Code);
      console.error("Error message:", error.message);
    }
  }
}

createBucket();
