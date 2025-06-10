# SRF Convocation Global Devotee Map

An interactive map application that helps SRF/YSS convocation participants connect with fellow devotees from around the world.

## Features

- 🌍 Interactive global map showing devotee locations
- 👥 Browseable devotee directory with search and filters
- 🔒 Privacy-focused with optional location sharing
- 📱 Responsive design for all devices
- 🔄 Real-time updates using Firebase

## Tech Stack

- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Firebase (Authentication & Firestore)
- Mapbox GL JS
- React Hook Form with Yup validation

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd srf-convocation-map
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication and Firestore Database
3. Create a web app in your Firebase project
4. Copy the Firebase configuration values to your `.env.local` file

## Mapbox Setup

1. Create a Mapbox account at [https://www.mapbox.com](https://www.mapbox.com)
2. Create a new access token
3. Copy the token to your `.env.local` file

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── components/        # Reusable components
│   ├── map/              # Map page
│   ├── directory/        # Directory page
│   └── layout.tsx        # Root layout
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and Firebase setup
└── types/               # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- SRF/YSS for inspiration
- Next.js team for the amazing framework
- Firebase for the backend infrastructure
- Mapbox for the mapping capabilities
