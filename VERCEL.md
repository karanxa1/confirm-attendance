 # Deploying to Vercel

This guide provides step-by-step instructions for deploying the College Attendance Monitoring System to Vercel's free tier.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com) if you don't have one)
2. Your Firebase project credentials
3. Google Sheets API credentials (if using Google Sheets integration)

## Deployment Steps

### 1. Prepare Your Project for Vercel

The project has been configured with a `vercel.json` file that tells Vercel how to build and deploy your application. This file specifies:

- The entry point for your application (`src/routes/server.js`)
- The build configuration using `@vercel/node`
- Route configuration to direct all traffic to your server

### 2. Push Your Code to a Git Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 3. Deploy to Vercel

1. Log in to your Vercel account
2. Click on "New Project"
3. Import your Git repository
4. Configure your project:
   - **Framework Preset**: Select "Other" (since we're using a custom Express.js setup)
   - **Root Directory**: Leave as default (the root of your repository)
   - **Build Command**: Vercel will use the configuration from `vercel.json`
   - **Output Directory**: Vercel will use the configuration from `vercel.json`

### 4. Configure Environment Variables

In the "Environment Variables" section of your project settings, add the following variables:

- `JWT_SECRET`: Your JWT secret key for authentication
- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID

If using Google Sheets integration:
- `GOOGLE_CLIENT_EMAIL`: Your Google service account client email
- `GOOGLE_PRIVATE_KEY`: Your Google service account private key (make sure to include all newlines)
- `USER_EMAIL`: Default user email for Google Sheets operations

### 5. Deploy Your Application

1. Click "Deploy"
2. Vercel will automatically build and deploy your application
3. You can monitor the deployment process in the "Deployments" tab

### 6. Access Your Application

Once deployment is complete, you can access your application at the URL provided by Vercel (e.g., `https://your-project-name.vercel.app`).

## Vercel CLI Deployment (Alternative Method)

You can also deploy your application using the Vercel CLI:

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```
   vercel login
   ```

3. Navigate to your project directory and deploy:
   ```
   vercel
   ```

4. Follow the prompts to configure your project

## Free Tier Limitations

Vercel's free tier has some limitations to be aware of:

1. **Serverless Functions**: Limited to 12 concurrent executions on the free plan
2. **Bandwidth**: Limited to 100 GB per month
3. **Build Duration**: Limited to 45 minutes per month
4. **Serverless Function Execution**: Limited to 10 seconds per invocation
5. **Environment Variables**: Limited to 64KB total size

## Troubleshooting

### Common Issues

1. **Application fails to start**: Check the deployment logs for error messages. Common issues include missing environment variables or dependency problems.

2. **Firebase connection issues**: Verify that all Firebase environment variables are correctly set and that your Firebase project has the appropriate security rules.

3. **Google Sheets integration not working**: Ensure that the Google service account has the necessary permissions and that the private key is correctly formatted with newlines.

4. **API routes not working**: Make sure your routes are properly configured in the `vercel.json` file.

## Updating Your Deployment

To update your deployed application:

1. Make changes to your code locally
2. Commit and push the changes to your Git repository
3. Vercel will automatically redeploy your application

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)