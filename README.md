# Fuse Demo

This demo showcases Fuse's backend and front-end API capabilities using a Node.js backend, Next.js for the web front-end, and React Native for the mobile front-end. Follow the instructions below to download the project and run it locally.

## Prerequisites

Before proceeding, make sure you have the following installed on your system:

- Node.js
- npm (comes bundled with Node.js)
- Yarn (optional, for React Native front-end)

## 1. Running the Backend

### 1.1. Clone the repository

Clone the project to your local machine using your preferred method (SSH or HTTPS).

### 1.2. Set up environment variables

Create a `.env` file in the project root directory using the provided `.env.template`. Replace the placeholder values with your own credentials.

### 1.3. Install backend dependencies

```bash
npm install
```

### 1.4. Start the backend server

```typescript
npm run dev
```

## 2. Running the Front-end

Choose either the web front-end (Next.js) or mobile front-end (React Native) to run and connect to your backend server.

### 2.1. Next.js front-end

2.1.1. Navigate to the `front-end/nextjs-app` directory.

2.1.2. Create a `.env` file in this directory using the provided `.env.template`. Update the `NEXT_PUBLIC_BACKEND_URL` to the URL of your running backend.

2.1.3. Install front-end dependencies:

```bash
npm install
```

2.1.4. Start the Next.js app:

```bash
npm run dev
```

2.1.5. Open your browser and visit the index page to test connecting to a bank.

### 2.2. React Native front-end

2.2.1. Make sure you have completed all the prerequisites for running a React Native application [here](https://reactnative.dev/docs/environment-setup).

2.2.2. Navigate to the `front-end/ReactNativeApp` directory.

2.2.3. Update the `BACKEND_URL` in `front-end/ReactNativeApp/App.tsx` to the URL of your running backend.

2.2.4. Install front-end dependencies:

```bash
yarn
```

2.2.5. Start the React Native application:

```bash
npx react-native start
```

Now, you should have either the web or mobile front-end running and connected to your backend server. Test the application by connecting to a bank and explore the features provided by the Fise Demo.
